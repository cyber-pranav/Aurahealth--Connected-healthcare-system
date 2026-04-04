import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const apptRes = await api.get('/clinic/appointments');
      setAppointments(apptRes.data);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  const todayAppointments = appointments.filter(a => {
    const aptDate = new Date(a.date);
    const now = new Date();
    return aptDate.toDateString() === now.toDateString() && a.status === 'scheduled';
  });

  const upcomingAppointments = appointments
    .filter(a => new Date(a.date) >= new Date() && a.status === 'scheduled')
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const completedCount = appointments.filter(a => a.status === 'completed').length;

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
      <div>
        <h1 className="text-2xl font-bold text-on-surface">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, Dr. {user?.name} 🩺
        </h1>
        <p className="text-on-surface-variant mt-1">Here's your practice overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-primary-container/40 border border-primary/10">
          <div className="flex items-center justify-between mb-3">
            <span className="material-symbols-outlined filled text-primary text-2xl">today</span>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">Today</span>
          </div>
          <p className="text-3xl font-bold text-on-surface">{todayAppointments.length}</p>
          <p className="text-sm text-on-surface-variant mt-1">Today's Patients</p>
        </div>

        <div className="p-5 rounded-3xl bg-secondary-container/40 border border-secondary/10">
          <div className="flex items-center justify-between mb-3">
            <span className="material-symbols-outlined filled text-secondary text-2xl">event_available</span>
            <span className="text-xs font-medium text-secondary bg-secondary/10 px-2.5 py-1 rounded-full">Queue</span>
          </div>
          <p className="text-3xl font-bold text-on-surface">{upcomingAppointments.length}</p>
          <p className="text-sm text-on-surface-variant mt-1">Upcoming Appointments</p>
        </div>

        <div className="p-5 rounded-3xl bg-tertiary-container/40 border border-tertiary/10">
          <div className="flex items-center justify-between mb-3">
            <span className="material-symbols-outlined filled text-tertiary text-2xl">task_alt</span>
            <span className="text-xs font-medium text-tertiary bg-tertiary/10 px-2.5 py-1 rounded-full">Done</span>
          </div>
          <p className="text-3xl font-bold text-on-surface">{completedCount}</p>
          <p className="text-sm text-on-surface-variant mt-1">Completed Consultations</p>
        </div>
      </div>

      {/* Patient Queue */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-elevation-1">
        <div className="p-5 pb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined filled text-primary">groups</span>
            Patient Queue
          </h2>
          <span className="text-xs font-medium text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full">
            {upcomingAppointments.length} patients
          </span>
        </div>
        <div className="px-5 pb-5 space-y-3">
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-10">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">person_off</span>
              <p className="text-on-surface-variant mt-3">No patients in queue</p>
              <p className="text-xs text-on-surface-variant/60 mt-1">Your schedule is clear</p>
            </div>
          ) : (
            upcomingAppointments.slice(0, 8).map((apt, i) => (
              <div key={apt._id} className={`p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container-high/50 
                transition-all duration-200 animate-slide-in stagger-${Math.min(i + 1, 5)}`}>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-secondary-container flex items-center justify-center">
                    <span className="material-symbols-outlined filled text-secondary">person</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-on-surface">
                      {apt.patientId?.name || 'Patient'}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {apt.patientId?.gender ? `${apt.patientId.gender}, ` : ''}{apt.patientId?.age ? `${apt.patientId.age} yrs` : ''}
                    </p>
                  </div>
                  <div className="text-right mr-2">
                    <p className="text-sm font-medium text-on-surface">
                      {new Date(apt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {new Date(apt.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/consultation/${apt._id}`)}
                    className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold
                      hover:bg-primary/90 transition-all duration-200 shadow-sm flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">clinical_notes</span>
                    Consult
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
