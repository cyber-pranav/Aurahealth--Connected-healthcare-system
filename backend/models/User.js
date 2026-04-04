const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['PATIENT', 'DOCTOR', 'ADMIN'], default: 'PATIENT' },
  
  // Specific blocks based on role (using a mixed/flexible schema for simplicity in MVP)
  specialization: { type: String }, // For DOCTOR
  experienceYears: { type: Number }, // For DOCTOR
  
  allergies: [{ type: String }], // For PATIENT
  chronicConditions: [{ type: String }], // For PATIENT
  age: { type: Number }, // For PATIENT
  gender: { type: String, enum: ['Male', 'Female', 'Other'] }, // For PATIENT

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
