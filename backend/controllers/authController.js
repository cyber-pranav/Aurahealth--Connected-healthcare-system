const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, specialization, experienceYears, allergies, chronicConditions, age, gender, linkedPatientEmail, caregiverRelation } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name, email, password: hashedPassword, role: role || 'PATIENT',
      specialization, experienceYears,
      allergies, chronicConditions, age, gender,
      caregiverRelation
    };

    // If registering as caregiver, link to patient
    if (role === 'CAREGIVER' && linkedPatientEmail) {
      const patient = await User.findOne({ email: linkedPatientEmail });
      if (patient) {
        userData.linkedPatients = [patient._id];
      }
    }

    const user = new User(userData);
    await user.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed.', details: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password.' });

    const token = jwt.sign(
      { _id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'fallback_secret_for_hackathon',
      { expiresIn: '7d' }
    );

    res.json({ token, user: { _id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed.', details: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user.', details: error.message });
  }
};

// Link caregiver to patient
exports.linkPatient = async (req, res) => {
  try {
    const { patientEmail } = req.body;
    const patient = await User.findOne({ email: patientEmail, role: 'PATIENT' });
    if (!patient) return res.status(404).json({ error: 'Patient not found.' });

    const caregiver = await User.findById(req.user._id);
    if (!caregiver.linkedPatients) caregiver.linkedPatients = [];
    if (!caregiver.linkedPatients.includes(patient._id)) {
      caregiver.linkedPatients.push(patient._id);
      await caregiver.save();
    }
    res.json({ message: 'Patient linked successfully.', patientId: patient._id, patientName: patient.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get linked patients for caregiver
exports.getLinkedPatients = async (req, res) => {
  try {
    const caregiver = await User.findById(req.user._id);
    if (!caregiver || !caregiver.linkedPatients) return res.json([]);
    
    const patients = [];
    for (const pid of caregiver.linkedPatients) {
      const p = await User.findById(pid).select('-password');
      if (p) patients.push(p);
    }
    res.json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
