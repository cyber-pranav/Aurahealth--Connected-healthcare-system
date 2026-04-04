const mongoose = require("../mock-db");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['PATIENT', 'DOCTOR', 'CAREGIVER', 'ADMIN'], default: 'PATIENT' },
  
  // Doctor-specific fields
  specialization: { type: String },
  experienceYears: { type: Number },
  
  // Patient-specific fields
  allergies: [{ type: String }],
  chronicConditions: [{ type: String }],
  age: { type: Number },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  
  // Multi-doctor coordination: doctors who have access to this patient
  assignedDoctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Caregiver fields: patients linked to this caregiver
  linkedPatients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Caregiver relationship description
  caregiverRelation: { type: String }, // e.g. "Mother", "Spouse", "Son"

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
