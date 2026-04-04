import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [apptRes, medRes] = await Promise.all([
        api.get('/clinic/appointments'),
        api.get('/clinic/medications/schedule')
      ]);
      setAppointments(apptRes.data);
      setMedications(medRes.data);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const upcomingAppointments = appointments
    .filter(a => new Date(a.date) >= new Date() && a.status === 'scheduled')
    .slice(0, 4);

  const todayMeds = medications.filter(m => {
    const scheduled = new Date(m.scheduledTime);
    const now = new Date();
    return scheduled.toDateString() === now.toDateString();
  });

  const adherenceRate = medications.length > 0
    ? Math.round((medications.filter(m => m.status === 'taken').length / medications.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 skeleton" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-32 skeleton rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name} 👋
        </h1>
        <p className="text-on-surface-variant mt-1">Here's your health overview for today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-primary-container/40 border border-primary/10">
          <div className="flex items-center justify-between mb-3">
            <span className="material-symbols-outlined filled text-primary text-2xl">calendar_month</span>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              Upcoming
            </span>
          </div>
          <p className="text-3xl font-bold text-on-surface">{upcomingAppointments.length}</p>
          <p className="text-sm text-on-surface-variant mt-1">Upcoming Appointments</p>
        </div>

        <div className="p-5 rounded-3xl bg-secondary-container/40 border border-secondary/10">
          <div className="flex items-center justify-between mb-3">
            <span className="material-symbols-outlined filled text-secondary text-2xl">medication</span>
            <span className="text-xs font-medium text-secondary bg-secondary/10 px-2.5 py-1 rounded-full">
              Today
            </span>
          </div>
          <p className="text-3xl font-bold text-on-surface">{todayMeds.length}</p>
          <p className="text-sm text-on-surface-variant mt-1">Medications Today</p>
        </div>

        <div className="p-5 rounded-3xl bg-tertiary-container/40 border border-tertiary/10">
          <div className="flex items-center justify-between mb-3">
            <span className="material-symbols-outlined filled text-tertiary text-2xl">monitor_heart</span>
            <span className="text-xs font-medium text-tertiary bg-tertiary/10 px-2.5 py-1 rounded-full">
              Score
            </span>
          </div>
          <p className="text-3xl font-bold text-on-surface">{adherenceRate}%</p>
          <p className="text-sm text-on-surface-variant mt-1">Medication Adherence</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-elevation-1">
          <div className="p-5 pb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined filled text-primary">event</span>
              Upcoming Appointments
            </h2>
          </div>
          <div className="px-5 pb-5 space-y-3">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">event_busy</span>
                <p className="text-on-surface-variant mt-2 text-sm">No upcoming appointments</p>
              </div>
            ) : (
              upcomingAppointments.map((apt, i) => (
                <div key={apt._id} className={`p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container-high/50 
                  transition-all duration-200 animate-slide-in stagger-${i + 1}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-primary-container flex items-center justify-center">
                      <span className="material-symbols-outlined filled text-primary">stethoscope</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-on-surface">
                        Dr. {apt.doctorId?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {apt.doctorId?.specialization || 'General'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-on-surface">
                        {new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {new Date(apt.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Medications */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-elevation-1">
          <div className="p-5 pb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined filled text-secondary">medication</span>
              Today's Medications
            </h2>
          </div>
          <div className="px-5 pb-5 space-y-3">
            {todayMeds.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">check_circle</span>
                <p className="text-on-surface-variant mt-2 text-sm">No medications scheduled today</p>
              </div>
            ) : (
              todayMeds.slice(0, 5).map((med, i) => (
                <div key={med._id} className={`p-4 rounded-2xl flex items-center gap-4
                  ${med.status === 'taken' ? 'bg-primary-container/20' : 'bg-surface-container-low'}
                  transition-all duration-200 animate-slide-in stagger-${i + 1}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                    ${med.status === 'taken' ? 'bg-primary text-on-primary' : 'bg-secondary-container text-secondary'}`}>
                    <span className="material-symbols-outlined filled text-lg">
                      {med.status === 'taken' ? 'check_circle' : 'schedule'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-on-surface">
                      {med.prescriptionId?.medicationName || 'Medication'}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {med.prescriptionId?.dosage || ''} • {new Date(med.scheduledTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full
                    ${med.status === 'taken' ? 'bg-primary/10 text-primary' : 
                      med.status === 'missed' ? 'bg-error/10 text-error' : 
                      'bg-outline-variant/30 text-on-surface-variant'}`}>
                    {med.status === 'taken' ? 'Taken' : med.status === 'missed' ? 'Missed' : 'Pending'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
