const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  recordId: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalRecord' }, // Optional, can be standalone
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicationName: { type: String, required: true },
  dosage: { type: String, required: true }, // e.g., '500mg'
  frequency: { type: String, required: true }, // e.g., 'Twice a day'
  durationDays: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Prescription', prescriptionSchema);
