const User = require('../models/User');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Prescription = require('../models/Prescription');
const MedicationLog = require('../models/MedicationLog');

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
    res.status(201).json(appointment);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// 3. Get Appointments
exports.getAppointments = async (req, res) => {
  try {
    const query = req.user.role === 'DOCTOR' ? { doctorId: req.user._id } : { patientId: req.user._id };
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
    
    // Create record
    const record = new MedicalRecord({
      patientId,
      doctorId: req.user._id,
      consultationNotes,
      diagnoses
    });
    await record.save();

    // Create prescriptions and logs
    if (prescriptions && prescriptions.length > 0) {
      for (const p of prescriptions) {
        const pres = new Prescription({
          recordId: record._id,
          patientId,
          doctorId: req.user._id,
          medicationName: p.name,
          dosage: p.dosage,
          frequency: p.frequency, // expecting a number denoting times per day
          durationDays: p.durationDays
        });
        await pres.save();

        // Generate MedicationLogs for the duration
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
    }

    res.status(201).json({ message: 'Consultation & Prescription saved successfully.', record });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// 5. Get Medication Schedule (Patient only)
exports.getMedicationSchedule = async (req, res) => {
  try {
    const logs = await MedicationLog.find({ patientId: req.user._id })
      .populate('prescriptionId', 'medicationName dosage')
      .sort({ scheduledTime: 1 });
    res.json(logs);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// 6. Log Dose (Patient)
exports.logMedication = async (req, res) => {
  try {
    const { logId, status } = req.body; // status: 'taken' or 'missed'
    const log = await MedicationLog.findById(logId);
    if (!log) return res.status(404).json({ error: 'Log not found' });
    
    log.status = status;
    log.takenAt = status === 'taken' ? new Date() : null;
    await log.save();
    res.json(log);
  } catch (error) { res.status(500).json({ error: error.message }); }
};
