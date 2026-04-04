const Notification = require('../models/Notification');
const MedicationLog = require('../models/MedicationLog');
const Appointment = require('../models/Appointment');
const CarePlan = require('../models/CarePlan');

// Get notifications for current user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark notification as read
exports.markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    if (!notification) return res.status(404).json({ error: 'Not found' });
    
    notification.readStatus = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark all as read
exports.markAllRead = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id, readStatus: false });
    for (const n of notifications) {
      n.readStatus = true;
      await n.save();
    }
    res.json({ message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user._id, readStatus: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate smart notifications (called periodically or on-demand)
exports.generateSmartNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const created = [];

    if (req.user.role === 'PATIENT') {
      // Check missed medications today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayLogs = await MedicationLog.find({ patientId: userId });
      const todayMeds = todayLogs.filter(l => {
        const st = new Date(l.scheduledTime);
        return st >= today && st < tomorrow;
      });
      
      const missedCount = todayMeds.filter(m => {
        const st = new Date(m.scheduledTime);
        return st < new Date() && m.status === 'pending';
      }).length;

      if (missedCount > 0) {
        const n = new Notification({
          userId,
          title: 'Missed Medications',
          message: `You have ${missedCount} dose${missedCount > 1 ? 's' : ''} that ${missedCount > 1 ? 'are' : 'is'} overdue today. Please take your medications on time.`,
          type: 'MEDICATION_REMINDER',
          priority: missedCount > 2 ? 'urgent' : 'high',
          actionUrl: '/medications',
          icon: 'medication'
        });
        await n.save();
        created.push(n);
      }

      // Check overdue follow-ups
      const carePlans = await CarePlan.find({ patientId: userId, status: 'active' });
      for (const plan of carePlans) {
        if (plan.items) {
          const overdue = plan.items.filter(item => 
            item.status === 'pending' && item.dueDate && new Date(item.dueDate) < new Date()
          );
          if (overdue.length > 0) {
            const n = new Notification({
              userId,
              title: 'Overdue Care Plan Items',
              message: `You have ${overdue.length} overdue item${overdue.length > 1 ? 's' : ''} in "${plan.title}". Please follow up.`,
              type: 'FOLLOW_UP_OVERDUE',
              priority: 'high',
              relatedId: plan._id,
              relatedType: 'carePlan',
              actionUrl: '/care-plans',
              icon: 'assignment_late'
            });
            await n.save();
            created.push(n);
          }
        }
      }
    }

    if (req.user.role === 'DOCTOR') {
      // Check high-risk patients (low adherence)
      const appointments = await Appointment.find({ doctorId: userId });
      const patientIds = [...new Set(appointments.map(a => a.patientId?.toString() || a.patientId))];
      
      for (const pid of patientIds) {
        const logs = await MedicationLog.find({ patientId: pid });
        if (logs.length > 5) {
          const taken = logs.filter(l => l.status === 'taken').length;
          const rate = Math.round((taken / logs.length) * 100);
          if (rate < 50) {
            const User = require('../models/User');
            const patient = await User.findById(pid);
            const n = new Notification({
              userId,
              title: 'High-Risk Patient Alert',
              message: `${patient?.name || 'A patient'} has a medication adherence rate of ${rate}%. Consider a follow-up.`,
              type: 'ADHERENCE_ALERT',
              priority: 'urgent',
              icon: 'warning',
              actionUrl: '/analytics'
            });
            await n.save();
            created.push(n);
          }
        }
      }
    }

    res.json({ message: `Generated ${created.length} notifications`, notifications: created });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
