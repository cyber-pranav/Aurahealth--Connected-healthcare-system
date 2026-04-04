const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  consultationNotes: { type: String, required: true },
  diagnoses: [{ type: String }],
  fileUrls: [{ type: String }], // array of URLs to GCS bucket files like PDFs/Images
}, { timestamps: true });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
