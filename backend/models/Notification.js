const mongoose = require("../mock-db");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: [
      'APPOINTMENT', 'MEDICATION_REMINDER', 'ADHERENCE_ALERT', 'GENERAL',
      'VIDEO_CALL', 'CARE_PLAN_UPDATE', 'PRESCRIPTION_UPDATE', 'FOLLOW_UP_OVERDUE',
      'AI_INSIGHT', 'CAREGIVER_ALERT', 'DOCTOR_NOTE'
    ] 
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  readStatus: { type: Boolean, default: false },
  
  // Context linking
  relatedId: { type: String },
  relatedType: { type: String }, // 'appointment', 'prescription', 'carePlan', etc.
  
  // Action URL for click-through
  actionUrl: { type: String },
  
  // Icon for display
  icon: { type: String, default: 'notifications' },
  
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
