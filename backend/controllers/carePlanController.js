const CarePlan = require('../models/CarePlan');
const HealthEvent = require('../models/HealthEvent');
const Notification = require('../models/Notification');

// Create a new care plan
exports.createCarePlan = async (req, res) => {
  try {
    const { patientId, title, description, items, startDate, endDate } = req.body;
    
    const plan = new CarePlan({
      patientId,
      doctorId: req.user._id,
      title,
      description,
      items: (items || []).map(item => ({
        ...item,
        status: 'pending'
      })),
      startDate: startDate || new Date(),
      endDate
    });
    await plan.save();

    // Create health event for timeline
    const event = new HealthEvent({
      patientId,
      type: 'care_plan_update',
      title: `New Care Plan: ${title}`,
      description: description || `Treatment plan created by Dr. ${req.user.name}`,
      date: new Date(),
      relatedId: plan._id,
      relatedType: 'carePlan',
      metadata: {
        doctorName: req.user.name,
        doctorId: req.user._id,
        severity: 'medium'
      }
    });
    await event.save();

    // Notify patient
    const notification = new Notification({
      userId: patientId,
      title: 'New Care Plan Created',
      message: `Dr. ${req.user.name} created a care plan: "${title}"`,
      type: 'CARE_PLAN_UPDATE',
      priority: 'high',
      relatedId: plan._id,
      relatedType: 'carePlan',
      actionUrl: '/care-plans',
      icon: 'assignment'
    });
    await notification.save();

    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get care plans for current user
exports.getCarePlans = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'DOCTOR') {
      query.doctorId = req.user._id;
    } else if (req.user.role === 'PATIENT') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'CAREGIVER') {
      // Caregivers see plans for their linked patients
      const User = require('../models/User');
      const caregiver = await User.findById(req.user._id);
      if (caregiver && caregiver.linkedPatients && caregiver.linkedPatients.length > 0) {
        // Get all plans for linked patients
        const allPlans = [];
        for (const pid of caregiver.linkedPatients) {
          const plans = await CarePlan.find({ patientId: pid })
            .populate('patientId', 'name email age gender')
            .populate('doctorId', 'name specialization')
            .sort({ createdAt: -1 });
          allPlans.push(...plans);
        }
        return res.json(allPlans);
      }
      return res.json([]);
    }

    const plans = await CarePlan.find(query)
      .populate('patientId', 'name email age gender')
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a care plan item status
exports.updateCarePlanItem = async (req, res) => {
  try {
    const { planId, itemIndex } = req.params;
    const { status, notes } = req.body;

    const plan = await CarePlan.findById(planId);
    if (!plan) return res.status(404).json({ error: 'Care plan not found' });

    if (plan.items && plan.items[itemIndex]) {
      plan.items[itemIndex].status = status;
      if (notes) plan.items[itemIndex].notes = notes;
      if (status === 'completed') plan.items[itemIndex].completedAt = new Date();
    }

    // Check if all items are completed
    const allDone = plan.items && plan.items.every(i => i.status === 'completed');
    if (allDone) plan.status = 'completed';

    await plan.save();
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add inter-doctor note to care plan
exports.addDoctorNote = async (req, res) => {
  try {
    const { planId } = req.params;
    const { note } = req.body;

    const plan = await CarePlan.findById(planId);
    if (!plan) return res.status(404).json({ error: 'Care plan not found' });

    if (!plan.doctorNotes) plan.doctorNotes = [];
    plan.doctorNotes.push({
      doctorId: req.user._id,
      doctorName: req.user.name,
      note,
      createdAt: new Date()
    });

    await plan.save();
    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
