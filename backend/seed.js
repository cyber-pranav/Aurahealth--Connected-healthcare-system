// Standalone seed script - writes db.json directly WITHOUT loading mock-db
const bcrypt = require('bcryptjs');
const fs = require('fs');

const PASSWORD = 'Demo@1234';

const day = (d) => { const dt = new Date(); dt.setDate(dt.getDate() + d); return dt.toISOString(); };
const dayAt = (d, h, m = 0) => { const dt = new Date(); dt.setDate(dt.getDate() + d); dt.setHours(h, m, 0, 0); return dt.toISOString(); };
const now = () => new Date().toISOString();

async function seed() {
  const hash = await bcrypt.hash(PASSWORD, 10);

  const data = {
    users: [
      { _id: 'doc1', name: 'Priya Sharma', email: 'priya@aurahealth.com', password: hash, role: 'DOCTOR', specialization: 'Cardiology', experienceYears: 12, createdAt: now(), updatedAt: now() },
      { _id: 'doc2', name: 'Rahul Mehta', email: 'rahul@aurahealth.com', password: hash, role: 'DOCTOR', specialization: 'Neurology', experienceYears: 8, createdAt: now(), updatedAt: now() },
      { _id: 'doc3', name: 'Anjali Nair', email: 'anjali@aurahealth.com', password: hash, role: 'DOCTOR', specialization: 'Endocrinology', experienceYears: 15, createdAt: now(), updatedAt: now() },
      { _id: 'pat1', name: 'Arjun Kapoor', email: 'arjun@test.com', password: hash, role: 'PATIENT', age: 34, gender: 'Male', chronicConditions: ['Hypertension'], allergies: [], assignedDoctors: ['doc1', 'doc2'], createdAt: now(), updatedAt: now() },
      { _id: 'pat2', name: 'Meera Patel', email: 'meera@test.com', password: hash, role: 'PATIENT', age: 28, gender: 'Female', allergies: ['Penicillin'], chronicConditions: [], assignedDoctors: ['doc2'], createdAt: now(), updatedAt: now() },
      { _id: 'pat3', name: 'Suresh Iyer', email: 'suresh@test.com', password: hash, role: 'PATIENT', age: 52, gender: 'Male', chronicConditions: ['Type 2 Diabetes', 'Hypertension'], allergies: ['Aspirin'], assignedDoctors: ['doc1', 'doc3'], createdAt: now(), updatedAt: now() },
      { _id: 'cg1', name: 'Kavita Iyer', email: 'kavita@test.com', password: hash, role: 'CAREGIVER', caregiverRelation: 'Spouse', linkedPatients: ['pat3'], createdAt: now(), updatedAt: now() },
    ],
    appointments: [
      { _id: 'apt1', patientId: 'pat1', doctorId: 'doc1', date: dayAt(-5, 10), status: 'completed', notes: 'BP follow-up', createdAt: now(), updatedAt: now() },
      { _id: 'apt2', patientId: 'pat3', doctorId: 'doc1', date: dayAt(-3, 14), status: 'completed', notes: 'Diabetes review', createdAt: now(), updatedAt: now() },
      { _id: 'apt3', patientId: 'pat2', doctorId: 'doc2', date: dayAt(-1, 11), status: 'completed', notes: 'Headache eval', createdAt: now(), updatedAt: now() },
      { _id: 'apt4', patientId: 'pat1', doctorId: 'doc1', date: dayAt(1, 10, 30), status: 'scheduled', notes: 'BP medication adjustment', createdAt: now(), updatedAt: now() },
      { _id: 'apt5', patientId: 'pat3', doctorId: 'doc3', date: dayAt(2, 15), status: 'scheduled', notes: 'HbA1c results review', createdAt: now(), updatedAt: now() },
      { _id: 'apt6', patientId: 'pat2', doctorId: 'doc2', date: dayAt(3, 9), status: 'scheduled', notes: 'Migraine follow-up', createdAt: now(), updatedAt: now() },
      { _id: 'apt7', patientId: 'pat3', doctorId: 'doc1', date: dayAt(5, 11), status: 'scheduled', notes: 'Comprehensive checkup', createdAt: now(), updatedAt: now() },
      { _id: 'apt8', patientId: 'pat1', doctorId: 'doc2', date: dayAt(7, 14), status: 'scheduled', notes: 'Neuro screening', createdAt: now(), updatedAt: now() },
    ],
    medicalrecords: [
      { _id: 'rec1', patientId: 'pat1', doctorId: 'doc1', consultationNotes: 'BP 150/95. Started Amlodipine 5mg and Telmisartan 40mg.', diagnoses: ['Hypertension', 'Tension Headache'], createdAt: now(), updatedAt: now() },
      { _id: 'rec2', patientId: 'pat3', doctorId: 'doc1', consultationNotes: 'FBS 180mg/dL. HbA1c 8.2%. Increased Metformin.', diagnoses: ['Type 2 Diabetes', 'Hypertension', 'Dyslipidemia'], createdAt: now(), updatedAt: now() },
      { _id: 'rec3', patientId: 'pat2', doctorId: 'doc2', consultationNotes: 'Recurring migraines. CT normal. Started preventive therapy.', diagnoses: ['Migraine with Aura'], createdAt: now(), updatedAt: now() },
      { _id: 'rec4', patientId: 'pat3', doctorId: 'doc3', consultationNotes: 'Thyroid normal. LDL elevated. Adding Atorvastatin.', diagnoses: ['Dyslipidemia', 'Type 2 Diabetes'], createdAt: now(), updatedAt: now() },
    ],
    prescriptions: [
      { _id: 'rx1', recordId: 'rec1', patientId: 'pat1', doctorId: 'doc1', medicationName: 'Amlodipine', dosage: '5mg', frequency: 1, durationDays: 30, createdAt: now(), updatedAt: now() },
      { _id: 'rx2', recordId: 'rec1', patientId: 'pat1', doctorId: 'doc1', medicationName: 'Telmisartan', dosage: '40mg', frequency: 1, durationDays: 30, createdAt: now(), updatedAt: now() },
      { _id: 'rx3', recordId: 'rec2', patientId: 'pat3', doctorId: 'doc1', medicationName: 'Metformin', dosage: '1000mg', frequency: 2, durationDays: 30, createdAt: now(), updatedAt: now() },
      { _id: 'rx4', recordId: 'rec2', patientId: 'pat3', doctorId: 'doc1', medicationName: 'Glimepiride', dosage: '2mg', frequency: 1, durationDays: 30, createdAt: now(), updatedAt: now() },
      { _id: 'rx5', recordId: 'rec3', patientId: 'pat2', doctorId: 'doc2', medicationName: 'Propranolol', dosage: '40mg', frequency: 2, durationDays: 14, createdAt: now(), updatedAt: now() },
      { _id: 'rx6', recordId: 'rec4', patientId: 'pat3', doctorId: 'doc3', medicationName: 'Atorvastatin', dosage: '20mg', frequency: 1, durationDays: 30, createdAt: now(), updatedAt: now() },
    ],
    medicationlogs: [],
    messages: [
      { _id: 'msg1', roomId: 'doc1_pat1', senderId: 'pat1', senderName: 'Arjun Kapoor', content: 'Doctor, I have dizziness in mornings.', timestamp: dayAt(-2, 9), createdAt: now(), updatedAt: now() },
      { _id: 'msg2', roomId: 'doc1_pat1', senderId: 'doc1', senderName: 'Priya Sharma', content: 'Monitor your BP for 2 days and share readings.', timestamp: dayAt(-2, 9, 30), createdAt: now(), updatedAt: now() },
      { _id: 'msg3', roomId: 'doc1_pat1', senderId: 'pat1', senderName: 'Arjun Kapoor', content: 'Morning 135/88, Evening 128/82.', timestamp: dayAt(-1, 18), createdAt: now(), updatedAt: now() },
      { _id: 'msg4', roomId: 'doc1_pat3', senderId: 'doc1', senderName: 'Priya Sharma', content: 'Take Metformin with meals.', timestamp: dayAt(-3, 15), createdAt: now(), updatedAt: now() },
      { _id: 'msg5', roomId: 'doc1_pat3', senderId: 'pat3', senderName: 'Suresh Iyer', content: 'Should I reduce rice intake?', timestamp: dayAt(-3, 16), createdAt: now(), updatedAt: now() },
    ],
    notifications: [
      { _id: 'n1', userId: 'pat1', title: 'New Prescription', message: 'Dr. Priya Sharma prescribed Amlodipine 5mg and Telmisartan 40mg.', type: 'PRESCRIPTION_UPDATE', priority: 'high', readStatus: false, icon: 'medication', actionUrl: '/medications', createdAt: dayAt(-5, 10), updatedAt: now() },
      { _id: 'n2', userId: 'pat1', title: 'Upcoming Appointment', message: 'Appointment with Dr. Priya Sharma tomorrow.', type: 'APPOINTMENT', priority: 'medium', readStatus: false, icon: 'event', actionUrl: '/appointments', createdAt: dayAt(0, 8), updatedAt: now() },
      { _id: 'n3', userId: 'pat3', title: 'Consultation Complete', message: 'Dr. Priya Sharma completed your diabetes review.', type: 'PRESCRIPTION_UPDATE', priority: 'high', readStatus: true, icon: 'clinical_notes', actionUrl: '/timeline', createdAt: dayAt(-3, 14), updatedAt: now() },
      { _id: 'n4', userId: 'doc1', title: 'High-Risk Patient', message: 'Suresh Iyer has adherence rate of 45%.', type: 'ADHERENCE_ALERT', priority: 'urgent', readStatus: false, icon: 'warning', actionUrl: '/analytics', createdAt: dayAt(-1, 8), updatedAt: now() },
      { _id: 'n5', userId: 'pat3', title: 'Missed Medications', message: 'You have 2 overdue doses today.', type: 'MEDICATION_REMINDER', priority: 'high', readStatus: false, icon: 'medication', actionUrl: '/medications', createdAt: dayAt(0, 12), updatedAt: now() },
      { _id: 'n6', userId: 'cg1', title: 'Caregiver Alert', message: 'Suresh Iyer missed 2 doses today.', type: 'CAREGIVER_ALERT', priority: 'high', readStatus: false, icon: 'family_restroom', actionUrl: '/dashboard', createdAt: dayAt(0, 13), updatedAt: now() },
      { _id: 'n7', userId: 'pat2', title: 'Rx Reminder', message: 'Take Propranolol 40mg.', type: 'MEDICATION_REMINDER', priority: 'medium', readStatus: false, icon: 'medication', actionUrl: '/medications', createdAt: dayAt(0, 8), updatedAt: now() },
    ],
    careplans: [
      { _id: 'cp1', patientId: 'pat3', doctorId: 'doc1', title: 'Diabetes & Hypertension Management', description: 'Goal: HbA1c below 7%, BP below 130/80.', status: 'active', items: [
        { type: 'medication', title: 'Take Metformin 1000mg', description: 'Twice daily with meals', status: 'in_progress', dueDate: dayAt(30, 0) },
        { type: 'medication', title: 'Take Glimepiride 2mg', description: 'Once daily before breakfast', status: 'in_progress', dueDate: dayAt(30, 0) },
        { type: 'test', title: 'HbA1c Test', description: 'Fasting blood test', status: 'pending', dueDate: dayAt(14, 0) },
        { type: 'follow_up', title: 'Endocrinology Consultation', description: 'Review with Dr. Anjali', status: 'pending', dueDate: dayAt(15, 0) },
        { type: 'lifestyle', title: 'Daily 30-min Walk', description: 'Brisk walking', status: 'in_progress', dueDate: dayAt(30, 0) },
        { type: 'test', title: 'Lipid Panel', description: 'Cholesterol check', status: 'completed', dueDate: dayAt(-2, 0), completedAt: dayAt(-2, 11) },
      ], doctorNotes: [
        { doctorId: 'doc1', doctorName: 'Priya Sharma', note: 'Strict dietary control needed.', createdAt: dayAt(-3, 14) },
        { doctorId: 'doc3', doctorName: 'Anjali Nair', note: 'Elevated LDL. Added Atorvastatin.', createdAt: dayAt(-1, 16) },
      ], startDate: dayAt(-5, 0), endDate: dayAt(30, 0), createdAt: now(), updatedAt: now() },
      { _id: 'cp2', patientId: 'pat1', doctorId: 'doc1', title: 'Hypertension Control Program', description: 'BP management through medication and lifestyle.', status: 'active', items: [
        { type: 'medication', title: 'Take Amlodipine 5mg', description: 'Once daily', status: 'in_progress', dueDate: dayAt(25, 0) },
        { type: 'lifestyle', title: 'Reduce Salt Intake', description: 'Max 5g sodium/day', status: 'pending', dueDate: dayAt(30, 0) },
        { type: 'test', title: 'Kidney Function Test', description: 'Serum creatinine + eGFR', status: 'pending', dueDate: dayAt(10, 0) },
        { type: 'follow_up', title: 'BP Review', description: 'Follow-up with Dr. Priya', status: 'pending', dueDate: dayAt(15, 0) },
      ], doctorNotes: [
        { doctorId: 'doc1', doctorName: 'Priya Sharma', note: 'Monitor BP twice daily. Target: 130/80.', createdAt: dayAt(-5, 10) },
      ], startDate: dayAt(-5, 0), endDate: dayAt(30, 0), createdAt: now(), updatedAt: now() },
    ],
    healthevents: [
      { _id: 'he1', patientId: 'pat1', type: 'consultation', title: 'Consultation — Dr. Priya Sharma', description: 'BP 150/95. Started Amlodipine and Telmisartan.', date: dayAt(-5, 10), metadata: { doctorName: 'Priya Sharma', diagnoses: ['Hypertension'], severity: 'medium' }, createdAt: now(), updatedAt: now() },
      { _id: 'he2', patientId: 'pat1', type: 'diagnosis', title: 'Diagnosed: Hypertension', description: 'Stage 1 Hypertension confirmed.', date: dayAt(-5, 10), metadata: { doctorName: 'Priya Sharma', diagnoses: ['Hypertension'], severity: 'high' }, createdAt: now(), updatedAt: now() },
      { _id: 'he3', patientId: 'pat1', type: 'prescription', title: 'New: Amlodipine 5mg, Telmisartan 40mg', description: '2 medications prescribed', date: dayAt(-5, 10), metadata: { doctorName: 'Priya Sharma', medications: ['Amlodipine 5mg', 'Telmisartan 40mg'], severity: 'medium' }, createdAt: now(), updatedAt: now() },
      { _id: 'he4', patientId: 'pat3', type: 'consultation', title: 'Diabetes Review — Dr. Priya Sharma', description: 'FBS 180. HbA1c 8.2%. Increased Metformin.', date: dayAt(-3, 14), metadata: { doctorName: 'Priya Sharma', diagnoses: ['Type 2 Diabetes', 'Hypertension'], severity: 'high' }, createdAt: now(), updatedAt: now() },
      { _id: 'he5', patientId: 'pat3', type: 'prescription', title: 'Updated: Metformin 1000mg, Glimepiride 2mg', description: '2 medications for diabetes', date: dayAt(-3, 14), metadata: { doctorName: 'Priya Sharma', medications: ['Metformin 1000mg', 'Glimepiride 2mg'], severity: 'medium' }, createdAt: now(), updatedAt: now() },
      { _id: 'he6', patientId: 'pat2', type: 'consultation', title: 'Migraine Evaluation — Dr. Rahul Mehta', description: 'Recurring migraines with aura. CT normal.', date: dayAt(-1, 11), metadata: { doctorName: 'Rahul Mehta', diagnoses: ['Migraine with Aura'], severity: 'medium' }, createdAt: now(), updatedAt: now() },
      { _id: 'he7', patientId: 'pat3', type: 'lab_result', title: 'Lipid Panel Results', description: 'LDL: 160 (High), HDL: 38 (Low)', date: dayAt(-2, 11), metadata: { testName: 'Lipid Panel', severity: 'high' }, createdAt: now(), updatedAt: now() },
      { _id: 'he8', patientId: 'pat1', type: 'medication_adherence', title: 'Adherence Update: 78%', description: '7/9 doses taken.', date: dayAt(-1, 20), metadata: { adherenceRate: 78, severity: 'medium' }, createdAt: now(), updatedAt: now() },
      { _id: 'he9', patientId: 'pat3', type: 'medication_adherence', title: 'Adherence Update: 45%', description: '5/11 doses taken. Critical.', date: dayAt(0, 8), metadata: { adherenceRate: 45, severity: 'high' }, aiInsight: 'Patient misses evening doses. Consider once-daily formulation.', createdAt: now(), updatedAt: now() },
    ],
    videosessions: [],
  };

  // Generate medication logs
  const generateLogs = (patientId, rxId, freq, days, rate) => {
    const logs = [];
    for (let d = -days; d <= 0; d++) {
      for (let dose = 0; dose < freq; dose++) {
        const hour = dose === 0 ? 8 : 20;
        let status = d < 0 ? (Math.random() < rate ? 'taken' : 'missed') : 'pending';
        logs.push({ _id: `ml_${patientId}_${rxId}_${Math.abs(d)}_${dose}`, prescriptionId: rxId, patientId, scheduledTime: dayAt(d, hour), status, takenAt: status === 'taken' ? dayAt(d, hour) : null, createdAt: now(), updatedAt: now() });
      }
    }
    for (let d = 1; d <= 3; d++) {
      for (let dose = 0; dose < freq; dose++) {
        const hour = dose === 0 ? 8 : 20;
        logs.push({ _id: `ml_${patientId}_${rxId}_f${d}_${dose}`, prescriptionId: rxId, patientId, scheduledTime: dayAt(d, hour), status: 'pending', takenAt: null, createdAt: now(), updatedAt: now() });
      }
    }
    return logs;
  };

  data.medicationlogs = [
    ...generateLogs('pat1', 'rx1', 1, 5, 0.85),
    ...generateLogs('pat1', 'rx2', 1, 5, 0.75),
    ...generateLogs('pat3', 'rx3', 2, 5, 0.45),
    ...generateLogs('pat3', 'rx4', 1, 5, 0.50),
    ...generateLogs('pat3', 'rx6', 1, 3, 0.40),
    ...generateLogs('pat2', 'rx5', 2, 5, 0.65),
  ];

  fs.writeFileSync('./db.json', JSON.stringify(data, null, 2));

  console.log('✅ Database seeded!');
  console.log(`   ${data.users.length} users | ${data.appointments.length} appointments | ${data.medicalrecords.length} records`);
  console.log(`   ${data.prescriptions.length} prescriptions | ${data.medicationlogs.length} med logs`);
  console.log(`   ${data.notifications.length} notifications | ${data.careplans.length} care plans | ${data.healthevents.length} health events`);
  console.log(`\n🔑 All passwords: ${PASSWORD}`);
  console.log('   Patient: arjun@test.com | meera@test.com | suresh@test.com');
  console.log('   Doctor: priya@aurahealth.com | rahul@aurahealth.com | anjali@aurahealth.com');
  console.log('   Caregiver: kavita@test.com (linked to Suresh)');
}

seed().catch(e => { console.error('❌', e); process.exit(1); });
