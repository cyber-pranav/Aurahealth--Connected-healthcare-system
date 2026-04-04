const mongoose = require("../mock-db");

const healthEventSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['consultation', 'diagnosis', 'prescription', 'lab_result', 'medication_adherence', 
           'video_call', 'care_plan_update', 'vital_sign', 'report_upload', 'follow_up'],
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now, required: true },
  
  // Reference to related entities
  relatedId: { type: String }, // Generic reference to appointment, prescription, etc.
  relatedType: { type: String }, // 'appointment', 'prescription', 'carePlan', etc.
  
  // Metadata for different event types
  metadata: {
    doctorName: { type: String },
    doctorId: { type: String },
    diagnoses: [{ type: String }],
    medications: [{ type: String }],
    adherenceRate: { type: Number },
    testName: { type: String },
    testResult: { type: String },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    notes: { type: String }
  },

  // AI-generated insights
  aiInsight: { type: String },

}, { timestamps: true });

healthEventSchema.index({ patientId: 1, date: -1 });

module.exports = mongoose.model('HealthEvent', healthEventSchema);
