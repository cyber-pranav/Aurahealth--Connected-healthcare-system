const mongoose = require('mongoose');

const medicationLogSchema = new mongoose.Schema({
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledTime: { type: Date, required: true }, // When they were supposed to take it
  takenAt: { type: Date }, // When they actually took it
  status: { type: String, enum: ['pending', 'taken', 'missed'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('MedicationLog', medicationLogSchema);
