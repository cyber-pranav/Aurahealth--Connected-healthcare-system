const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const MedicationLog = require('../models/MedicationLog');
const Message = require('../models/Message');
const HealthEvent = require('../models/HealthEvent');
const Notification = require('../models/Notification');

// 1. Get Doctors
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'DOCTOR' }).select('-password');
    res.json(doctors);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// 2. Book Appointment
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, notes } = req.body;
    const appointment = new Appointment({ patientId: req.user._id, doctorId, date, notes });
    await appointment.save();

    // Create timeline event
    const doctor = await User.findById(doctorId);
    const event = new HealthEvent({
      patientId: req.user._id,
      type: 'consultation',
      title: `Appointment booked with Dr. ${doctor?.name || 'Unknown'}`,
      description: notes || 'Upcoming consultation',
      date: new Date(date),
      relatedId: appointment._id,
      relatedType: 'appointment',
      metadata: { doctorName: doctor?.name, doctorId, severity: 'low' }
    });
    await event.save();

    // Notify doctor
    const notif = new Notification({
      userId: doctorId,
      title: 'New Appointment',
      message: `${req.user.name} booked an appointment for ${new Date(date).toLocaleDateString()}`,
      type: 'APPOINTMENT',
      priority: 'medium',
      relatedId: appointment._id,
      relatedType: 'appointment',
      actionUrl: '/appointments',
      icon: 'event'
    });
    await notif.save();

    res.status(201).json(appointment);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// 3. Get Appointments
exports.getAppointments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'DOCTOR') {
      query.doctorId = req.user._id;
    } else if (req.user.role === 'CAREGIVER') {
      // Get linked patients' appointments
      const caregiver = await User.findById(req.user._id);
      if (caregiver && caregiver.linkedPatients && caregiver.linkedPatients.length > 0) {
        const allAppts = [];
        for (const pid of caregiver.linkedPatients) {
          const appts = await Appointment.find({ patientId: pid })
            .populate('patientId', 'name email gender age')
            .populate('doctorId', 'name specialization')
            .sort({ date: 1 });
          allAppts.push(...appts);
        }
        return res.json(allAppts);
      }
      return res.json([]);
    } else {
      query.patientId = req.user._id;
    }
    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email gender age')
      .populate('doctorId', 'name specialization')
      .sort({ date: 1 });
    res.json(appointments);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// 4. Submit Consultation & Prescription (Doctor only)
exports.submitConsultation = async (req, res) => {
  try {
    const { patientId, consultationNotes, diagnoses, prescriptions } = req.body;
    
    const record = new MedicalRecord({
      patientId,
      doctorId: req.user._id,
      consultationNotes,
      diagnoses
    });
    await record.save();

    // Timeline: consultation event
    const consultEvent = new HealthEvent({
      patientId,
      type: 'consultation',
      title: `Consultation with Dr. ${req.user.name}`,
      description: consultationNotes,
      date: new Date(),
      relatedId: record._id,
      relatedType: 'medicalRecord',
      metadata: {
        doctorName: req.user.name,
        doctorId: req.user._id,
        diagnoses: diagnoses || [],
        severity: 'medium'
      }
    });
    await consultEvent.save();

    // Timeline: diagnosis events
    if (diagnoses && diagnoses.length > 0) {
      const diagEvent = new HealthEvent({
        patientId,
        type: 'diagnosis',
        title: `Diagnosed: ${diagnoses.join(', ')}`,
        description: `Dr. ${req.user.name} diagnosed the following conditions`,
        date: new Date(),
        relatedId: record._id,
        relatedType: 'medicalRecord',
        metadata: {
          doctorName: req.user.name,
          doctorId: req.user._id,
          diagnoses,
          severity: diagnoses.length > 2 ? 'high' : 'medium'
        }
      });
      await diagEvent.save();
    }

    // Create prescriptions and logs
    if (prescriptions && prescriptions.length > 0) {
      const medNames = [];
      for (const p of prescriptions) {
        const pres = new Prescription({
          recordId: record._id,
          patientId,
          doctorId: req.user._id,
          medicationName: p.name,
          dosage: p.dosage,
          frequency: p.frequency,
          durationDays: p.durationDays
        });
        await pres.save();
        medNames.push(`${p.name} ${p.dosage}`);

        const dosesPerDay = parseInt(p.frequency, 10) || 1;
        const totalDoses = dosesPerDay * p.durationDays;
        
        let currentDate = new Date();
        for (let i = 0; i < totalDoses; i++) {
           const logTime = new Date(currentDate.getTime() + (i * (24/dosesPerDay) * 60 * 60 * 1000));
           const log = new MedicationLog({
             prescriptionId: pres._id,
             patientId,
             scheduledTime: logTime
           });
           await log.save();
        }
      }

      // Timeline: prescription event
      const rxEvent = new HealthEvent({
        patientId,
        type: 'prescription',
        title: `New Prescriptions: ${medNames.join(', ')}`,
        description: `Dr. ${req.user.name} prescribed ${prescriptions.length} medication(s)`,
        date: new Date(),
        relatedId: record._id,
        relatedType: 'prescription',
        metadata: {
          doctorName: req.user.name,
          doctorId: req.user._id,
          medications: medNames,
          severity: 'medium'
        }
      });
      await rxEvent.save();
    }

    // Notify patient
    const notif = new Notification({
      userId: patientId,
      title: 'Consultation Complete',
      message: `Dr. ${req.user.name} has completed your consultation and${prescriptions?.length ? ` prescribed ${prescriptions.length} medication(s)` : ' added notes to your record'}.`,
      type: 'PRESCRIPTION_UPDATE',
      priority: 'high',
      relatedId: record._id,
      relatedType: 'medicalRecord',
      actionUrl: '/timeline',
      icon: 'clinical_notes'
    });
    await notif.save();

    res.status(201).json({ message: 'Consultation & Prescription saved successfully.', record });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// 5. Get Medication Schedule (Patient only)
exports.getMedicationSchedule = async (req, res) => {
  try {
    let patientId = req.user._id;
    if (req.user.role === 'CAREGIVER' && req.query.patientId) {
      patientId = req.query.patientId;
    }
    const logs = await MedicationLog.find({ patientId })
      .populate('prescriptionId', 'medicationName dosage')
      .sort({ scheduledTime: 1 });
    res.json(logs);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// 6. Log Dose (Patient)
exports.logMedication = async (req, res) => {
  try {
    const { logId, status } = req.body;
    const log = await MedicationLog.findById(logId);
    if (!log) return res.status(404).json({ error: 'Log not found' });
    
    log.status = status;
    log.takenAt = status === 'taken' ? new Date() : null;
    await log.save();

    // Update timeline with adherence event (batch - every 5 logs)
    const allLogs = await MedicationLog.find({ patientId: log.patientId });
    const completedLogs = allLogs.filter(l => l.status !== 'pending');
    if (completedLogs.length % 5 === 0 && completedLogs.length > 0) {
      const taken = completedLogs.filter(l => l.status === 'taken').length;
      const rate = Math.round((taken / completedLogs.length) * 100);
      const event = new HealthEvent({
        patientId: log.patientId,
        type: 'medication_adherence',
        title: `Adherence Update: ${rate}%`,
        description: `${taken}/${completedLogs.length} doses taken. ${rate >= 80 ? 'Great compliance!' : rate >= 50 ? 'Room for improvement.' : 'Critical - needs attention.'}`,
        date: new Date(),
        metadata: { adherenceRate: rate, severity: rate >= 80 ? 'low' : rate >= 50 ? 'medium' : 'high' }
      });
      await event.save();
    }

    res.json(log);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// 7. Update Appointment Status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['scheduled', 'completed', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found.' });

    const isDoctor = req.user.role === 'DOCTOR' && appointment.doctorId.toString() === req.user._id.toString();
    const isPatient = req.user.role === 'PATIENT' && appointment.patientId.toString() === req.user._id.toString();
    if (!isDoctor && !isPatient) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    appointment.status = status;
    await appointment.save();
    res.json(appointment);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// 8. Get Chat History for a room
exports.getChatHistory = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId })
      .populate('senderId', 'name role')
      .sort({ timestamp: 1 })
      .limit(100);
    res.json(messages);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// 9. Get Medical Records for a patient
exports.getMedicalRecords = async (req, res) => {
  try {
    let patientId = req.user._id;
    if (req.user.role === 'DOCTOR' && req.query.patientId) {
      patientId = req.query.patientId;
    }
    const records = await MedicalRecord.find({ patientId })
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (error) { res.status(500).json({ error: error.message }); }
};
