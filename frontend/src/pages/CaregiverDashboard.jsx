import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function CaregiverDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [linkedPatients, setLinkedPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medications, setMedications] = useState([]);
  const [linkEmail, setLinkEmail] = useState('');
  const [linkMsg, setLinkMsg] = useState('');

  useEffect(() => { loadLinkedPatients(); }, []);

  const loadLinkedPatients = async () => {
    try {
      const res = await api.get('/auth/linked-patients');
      setLinkedPatients(res.data);
      if (res.data.length > 0) selectPatient(res.data[0]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const selectPatient = async (patient) => {
    setSelectedPatient(patient);
    try {
      const res = await api.get(`/clinic/medications/schedule?patientId=${patient._id}`);
      setMedications(res.data);
    } catch (e) { console.error(e); }
  };

  const linkPatient = async () => {
    if (!linkEmail.trim()) return;
    try {
      const res = await api.post('/auth/link-patient', { patientEmail: linkEmail.trim() });
      setLinkMsg(`✅ ${res.data.patientName} linked successfully!`);
      setLinkEmail('');
      loadLinkedPatients();
    } catch (e) { setLinkMsg(`❌ ${e.response?.data?.error || 'Failed to link'}`); }
  };

  const todayMeds = medications.filter(m => {
    const d = new Date(m.scheduledTime);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });
  const taken = todayMeds.filter(m => m.status === 'taken').length;
  const missed = todayMeds.filter(m => m.status === 'missed' || (m.status === 'pending' && new Date(m.scheduledTime) < new Date())).length;
  const adherence = todayMeds.length > 0 ? Math.round((taken / todayMeds.length) * 100) : 0;

  if (loading) return <div className="space-y-6 animate-pulse"><div className="h-8 w-48 skeleton" /><div className="grid grid-cols-3 gap-4">{[1,2,3].map(i=><div key={i} className="h-32 skeleton rounded-3xl"/>)}</div></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">
          Welcome, {user?.name} 🤝
        </h1>
        <p className="text-on-surface-variant mt-1">Caregiver Dashboard — monitor your loved ones</p>
      </div>

      {/* Link Patient */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-elevation-1 p-5">
        <h2 className="text-sm font-semibold text-on-surface mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined filled text-primary">link</span>Link a Patient
        </h2>
        <div className="flex gap-2">
          <input type="email" value={linkEmail} onChange={e => setLinkEmail(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary transition-all" placeholder="Patient's email address" />
          <button onClick={linkPatient}
            className="px-5 py-2.5 bg-primary text-on-primary rounded-2xl text-sm font-semibold hover:bg-primary/90 transition-all">Link</button>
        </div>
        {linkMsg && <p className="text-sm mt-2">{linkMsg}</p>}
      </div>

      {linkedPatients.length === 0 ? (
        <div className="text-center py-16 bg-surface-container-lowest rounded-3xl border border-outline-variant/20">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">family_restroom</span>
          <p className="text-on-surface-variant mt-4 text-lg font-medium">No linked patients</p>
          <p className="text-on-surface-variant/60 mt-1 text-sm">Link a patient using their email above</p>
        </div>
      ) : (
        <>
          {/* Patient Selector */}
          <div className="flex flex-wrap gap-3">
            {linkedPatients.map(p => (
              <button key={p._id} onClick={() => selectPatient(p)}
                className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all flex items-center gap-2
                  ${selectedPatient?._id === p._id ? 'bg-secondary-container text-on-secondary-container shadow-sm' : 'bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-high'}`}>
                <span className="material-symbols-outlined text-lg">{selectedPatient?._id === p._id ? 'person' : 'person_outline'}</span>
                {p.name}
              </button>
            ))}
          </div>

          {selectedPatient && (
            <>
              {/* Patient Info + Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-primary-container/40 border border-primary/10">
                  <span className="material-symbols-outlined filled text-primary text-2xl mb-2">person</span>
                  <p className="text-lg font-bold text-on-surface">{selectedPatient.name}</p>
                  <p className="text-xs text-on-surface-variant">{selectedPatient.age ? `${selectedPatient.age} yrs` : ''} {selectedPatient.gender || ''}</p>
                </div>
                <div className="p-5 rounded-3xl bg-secondary-container/40 border border-secondary/10">
                  <span className="material-symbols-outlined filled text-secondary text-2xl mb-2">medication</span>
                  <p className="text-3xl font-bold text-on-surface">{todayMeds.length}</p>
                  <p className="text-sm text-on-surface-variant mt-1">Doses Today</p>
                </div>
                <div className="p-5 rounded-3xl bg-tertiary-container/40 border border-tertiary/10">
                  <span className="material-symbols-outlined filled text-tertiary text-2xl mb-2">check_circle</span>
                  <p className="text-3xl font-bold text-on-surface">{taken}</p>
                  <p className="text-sm text-on-surface-variant mt-1">Taken</p>
                </div>
                <div className={`p-5 rounded-3xl ${missed > 0 ? 'bg-error-container/40 border-error/10' : 'bg-primary-container/40 border-primary/10'} border`}>
                  <span className={`material-symbols-outlined filled ${missed > 0 ? 'text-error' : 'text-primary'} text-2xl mb-2`}>{missed > 0 ? 'warning' : 'verified'}</span>
                  <p className="text-3xl font-bold text-on-surface">{missed}</p>
                  <p className="text-sm text-on-surface-variant mt-1">Missed</p>
                </div>
              </div>

              {/* Adherence bar */}
              <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-elevation-1 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-on-surface">Today's Adherence</h3>
                  <span className={`text-lg font-bold ${adherence >= 80 ? 'text-primary' : adherence >= 50 ? 'text-[#ef6c00]' : 'text-error'}`}>{adherence}%</span>
                </div>
                <div className="w-full h-3 bg-primary/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${adherence >= 80 ? 'bg-primary' : adherence >= 50 ? 'bg-[#ef6c00]' : 'bg-error'}`} style={{ width: `${adherence}%` }} />
                </div>
              </div>

              {/* Med list */}
              <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-elevation-1 p-5">
                <h3 className="text-sm font-semibold text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined filled text-secondary">medication</span>Today's Medication Schedule
                </h3>
                {todayMeds.length === 0 ? (
                  <p className="text-on-surface-variant text-center py-8">No medications scheduled today</p>
                ) : (
                  <div className="space-y-2">
                    {todayMeds.map((med, i) => (
                      <div key={med._id || i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low/50">
                        <span className={`material-symbols-outlined text-lg ${med.status === 'taken' ? 'text-primary filled' : med.status === 'missed' || (med.status === 'pending' && new Date(med.scheduledTime) < new Date()) ? 'text-error' : 'text-on-surface-variant'}`}>
                          {med.status === 'taken' ? 'check_circle' : med.status === 'missed' ? 'cancel' : 'radio_button_unchecked'}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-on-surface">{med.prescriptionId?.medicationName || 'Medication'} {med.prescriptionId?.dosage || ''}</p>
                          <p className="text-xs text-on-surface-variant">{new Date(med.scheduledTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${med.status === 'taken' ? 'bg-primary/10 text-primary' : med.status === 'missed' ? 'bg-error/10 text-error' : 'bg-surface-container text-on-surface-variant'}`}>
                          {med.status === 'pending' && new Date(med.scheduledTime) < new Date() ? 'overdue' : med.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick links */}
              <div className="flex flex-wrap gap-3">
                <button onClick={() => navigate('/timeline')} className="px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl text-sm font-medium text-on-surface hover:shadow-elevation-1 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">timeline</span>View Timeline
                </button>
                <button onClick={() => navigate('/care-plans')} className="px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl text-sm font-medium text-on-surface hover:shadow-elevation-1 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">assignment</span>Care Plans
                </button>
                <button onClick={() => navigate('/analytics')} className="px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl text-sm font-medium text-on-surface hover:shadow-elevation-1 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">analytics</span>Analytics
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
