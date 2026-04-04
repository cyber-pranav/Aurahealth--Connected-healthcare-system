const MedicationLog = require('../models/MedicationLog');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const CarePlan = require('../models/CarePlan');
const User = require('../models/User');
const HealthEvent = require('../models/HealthEvent');

// Get patient analytics (for patient or doctor viewing a patient)
exports.getPatientAnalytics = async (req, res) => {
  try {
    let patientId = req.user._id;
    if ((req.user.role === 'DOCTOR' || req.user.role === 'CAREGIVER') && req.query.patientId) {
      patientId = req.query.patientId;
    }

    // Medication adherence
    const allLogs = await MedicationLog.find({ patientId });
    const taken = allLogs.filter(l => l.status === 'taken').length;
    const missed = allLogs.filter(l => l.status === 'missed').length;
    const pending = allLogs.filter(l => l.status === 'pending').length;
    const adherenceRate = allLogs.length > 0 ? Math.round((taken / (taken + missed || 1)) * 100) : 100;

    // Weekly adherence trend (last 7 days)
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      
      const dayLogs = allLogs.filter(l => {
        const st = new Date(l.scheduledTime);
        return st >= d && st < next;
      });
      const dayTaken = dayLogs.filter(l => l.status === 'taken').length;
      const dayTotal = dayLogs.filter(l => l.status !== 'pending').length;
      
      weeklyTrend.push({
        date: d.toISOString().split('T')[0],
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        taken: dayTaken,
        total: dayTotal,
        rate: dayTotal > 0 ? Math.round((dayTaken / dayTotal) * 100) : null
      });
    }

    // Appointments stats
    const appointments = await Appointment.find({ patientId });
    const completedAppointments = appointments.filter(a => a.status === 'completed').length;
    const upcomingAppointments = appointments.filter(a => new Date(a.date) >= new Date() && a.status === 'scheduled').length;

    // Medical records
    const records = await MedicalRecord.find({ patientId });
    const allDiagnoses = records.flatMap(r => r.diagnoses || []);
    const diagnosisCounts = {};
    allDiagnoses.forEach(d => { diagnosisCounts[d] = (diagnosisCounts[d] || 0) + 1; });

    // Care plans
    const carePlans = await CarePlan.find({ patientId });
    const activePlans = carePlans.filter(p => p.status === 'active').length;
    const completedPlans = carePlans.filter(p => p.status === 'completed').length;

    // AI-powered insights
    const insights = [];
    
    if (adherenceRate < 50) {
      insights.push({ type: 'warning', icon: 'warning', message: `Critical: Medication adherence is at ${adherenceRate}%. Patient is at high risk of disease progression.` });
    } else if (adherenceRate < 75) {
      insights.push({ type: 'caution', icon: 'info', message: `Adherence is ${adherenceRate}%. Consider discussing barriers to medication compliance.` });
    } else {
      insights.push({ type: 'positive', icon: 'check_circle', message: `Good adherence at ${adherenceRate}%. Keep up the consistent medication routine.` });
    }

    // Detect declining trend
    const recentRates = weeklyTrend.filter(w => w.rate !== null).slice(-3).map(w => w.rate);
    if (recentRates.length >= 3 && recentRates[2] < recentRates[0] - 20) {
      insights.push({ type: 'warning', icon: 'trending_down', message: 'Adherence is declining over the past 3 days. Early intervention recommended.' });
    }

    // Chronic conditions pattern
    const chronicDiagnoses = Object.entries(diagnosisCounts).filter(([_, c]) => c >= 2);
    if (chronicDiagnoses.length > 0) {
      insights.push({ 
        type: 'info', icon: 'monitor_heart',
        message: `Recurring conditions detected: ${chronicDiagnoses.map(([d]) => d).join(', ')}. These may indicate chronic issues requiring long-term management.`
      });
    }

    // Visit frequency
    if (completedAppointments > 5) {
      insights.push({ type: 'info', icon: 'event_repeat', message: `${completedAppointments} consultations completed. Regular check-ups are helping with continuity of care.` });
    }

    // Follow-up suggestion
    if (upcomingAppointments === 0 && completedAppointments > 0) {
      insights.push({ type: 'suggestion', icon: 'event_upcoming', message: 'No upcoming appointments scheduled. Consider booking a follow-up consultation.' });
    }

    res.json({
      adherence: { rate: adherenceRate, taken, missed, pending, total: allLogs.length },
      weeklyTrend,
      appointments: { completed: completedAppointments, upcoming: upcomingAppointments, total: appointments.length },
      diagnoses: diagnosisCounts,
      carePlans: { active: activePlans, completed: completedPlans, total: carePlans.length },
      insights,
      recordCount: records.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get doctor dashboard analytics
exports.getDoctorAnalytics = async (req, res) => {
  try {
    const doctorId = req.user._id;

    // Get all patients via appointments
    const appointments = await Appointment.find({ doctorId })
      .populate('patientId', 'name email age gender chronicConditions');
    
    const patientMap = {};
    appointments.forEach(apt => {
      if (apt.patientId) {
        const id = apt.patientId._id || apt.patientId;
        if (!patientMap[id]) patientMap[id] = apt.patientId;
      }
    });
    const patients = Object.values(patientMap);
    const patientIds = Object.keys(patientMap);

    // Aggregate adherence per patient
    const patientStats = [];
    for (const pid of patientIds) {
      const logs = await MedicationLog.find({ patientId: pid });
      const taken = logs.filter(l => l.status === 'taken').length;
      const completed = logs.filter(l => l.status !== 'pending').length;
      const rate = completed > 0 ? Math.round((taken / completed) * 100) : null;
      const patient = patientMap[pid];
      
      patientStats.push({
        patientId: pid,
        name: patient?.name || 'Unknown',
        age: patient?.age,
        gender: patient?.gender,
        chronicConditions: patient?.chronicConditions || [],
        adherenceRate: rate,
        totalDoses: logs.length,
        riskLevel: rate === null ? 'unknown' : rate < 50 ? 'high' : rate < 75 ? 'medium' : 'low'
      });
    }

    // Sort by risk
    patientStats.sort((a, b) => {
      const riskOrder = { high: 0, medium: 1, low: 2, unknown: 3 };
      return (riskOrder[a.riskLevel] || 3) - (riskOrder[b.riskLevel] || 3);
    });

    // Overview stats
    const totalAppointments = appointments.length;
    const completedAppointments = appointments.filter(a => a.status === 'completed').length;
    const todayAppointments = appointments.filter(a => {
      const d = new Date(a.date);
      return d.toDateString() === new Date().toDateString() && a.status === 'scheduled';
    }).length;

    const highRiskCount = patientStats.filter(p => p.riskLevel === 'high').length;

    // Active care plans
    const carePlans = await CarePlan.find({ doctorId });
    const activePlans = carePlans.filter(p => p.status === 'active').length;

    res.json({
      overview: {
        totalPatients: patients.length,
        todayAppointments,
        totalAppointments,
        completedAppointments,
        highRiskPatients: highRiskCount,
        activeCarePlans: activePlans
      },
      patientStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
