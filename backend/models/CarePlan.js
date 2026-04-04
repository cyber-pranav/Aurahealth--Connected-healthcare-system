const mongoose = require("../mock-db");

const carePlanSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['active', 'completed', 'paused', 'cancelled'], default: 'active' },
  
  // Structured plan items
  items: [{
    type: { type: String, enum: ['medication', 'follow_up', 'test', 'lifestyle', 'referral'] },
    title: { type: String },
    description: { type: String },
    dueDate: { type: Date },
    status: { type: String, enum: ['pending', 'in_progress', 'completed', 'overdue'], default: 'pending' },
    completedAt: { type: Date },
    notes: { type: String }
  }],
  
  // Inter-doctor notes for collaboration
  doctorNotes: [{
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    doctorName: { type: String },
    note: { type: String },
    createdAt: { type: Date }
  }],
  
  startDate: { type: Date },
  endDate: { type: Date },
  
}, { timestamps: true });

module.exports = mongoose.model('CarePlan', carePlanSchema);
