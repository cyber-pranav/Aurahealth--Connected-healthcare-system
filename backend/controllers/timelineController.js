const HealthEvent = require('../models/HealthEvent');

// Get health timeline for a patient
exports.getTimeline = async (req, res) => {
  try {
    let patientId = req.user._id;
    
    // Doctors can view any patient's timeline
    if (req.user.role === 'DOCTOR' && req.query.patientId) {
      patientId = req.query.patientId;
    }
    // Caregivers can view linked patient timelines
    if (req.user.role === 'CAREGIVER' && req.query.patientId) {
      const User = require('../models/User');
      const caregiver = await User.findById(req.user._id);
      if (caregiver && caregiver.linkedPatients && caregiver.linkedPatients.includes(req.query.patientId)) {
        patientId = req.query.patientId;
      }
    }

    const events = await HealthEvent.find({ patientId })
      .sort({ date: -1 })
      .limit(100);
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a health event (used by system or doctors)
exports.addEvent = async (req, res) => {
  try {
    const { patientId, type, title, description, metadata } = req.body;
    
    const event = new HealthEvent({
      patientId,
      type,
      title,
      description,
      date: new Date(),
      metadata: {
        ...metadata,
        doctorName: req.user.name,
        doctorId: req.user._id
      }
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
