const mongoose = require("../mock-db");

const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true, index: true }, // e.g. patientId_doctorId (sorted)
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String }, // Denormalized for quick display
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

// Index for efficient room history fetches
messageSchema.index({ roomId: 1, timestamp: 1 });

module.exports = mongoose.model('Message', messageSchema);
