import { useState, useEffect } from 'react';
import api from '../services/api';

export default function MedicationTracker() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('today');

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      const res = await api.get('/clinic/medications/schedule');
      setMedications(res.data);
    } catch (err) {
      console.error('Failed to load', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLog = async (logId, status) => {
    try {
      await api.post('/clinic/medications/log', { logId, status });
      loadMedications();
    } catch (err) {
      console.error('Failed to log', err);
    }
  };

  const now = new Date();
  const filterMeds = (meds) => {
    switch (filter) {
      case 'today':
        return meds.filter(m => new Date(m.scheduledTime).toDateString() === now.toDateString());
      case 'upcoming':
        return meds.filter(m => new Date(m.scheduledTime) > now && m.status === 'pending');
      case 'all':
      default:
        return meds;
    }
  };

  const filteredMeds = filterMeds(medications);
  const totalTaken = medications.filter(m => m.status === 'taken').length;
  const totalMissed = medications.filter(m => m.status === 'missed').length;
  const adherenceRate = medications.length > 0 
    ? Math.round((totalTaken / medications.length) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 skeleton" />
        <div className="h-32 skeleton rounded-3xl" />
        <div className="h-24 skeleton rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Medication Tracker</h1>
        <p className="text-on-surface-variant mt-1">Track your medications and stay on schedule</p>
      </div>

      {/* Adherence Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-primary-container/40 border border-primary/10">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined filled text-primary text-2xl">trending_up</span>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">Adherence</span>
          </div>
          <p className="text-3xl font-bold text-on-surface">{adherenceRate}%</p>
          <div className="mt-2 h-2 rounded-full bg-primary/10 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" 
              style={{ width: `${adherenceRate}%` }} />
          </div>
        </div>
        <div className="p-5 rounded-3xl bg-secondary-container/40 border border-secondary/10">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined filled text-secondary text-2xl">check_circle</span>
            <span className="text-xs font-medium text-secondary bg-secondary/10 px-2.5 py-1 rounded-full">Taken</span>
          </div>
          <p className="text-3xl font-bold text-on-surface">{totalTaken}</p>
          <p className="text-sm text-on-surface-variant mt-1">Doses completed</p>
        </div>
        <div className="p-5 rounded-3xl bg-error-container/40 border border-error/10">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined filled text-error text-2xl">cancel</span>
            <span className="text-xs font-medium text-error bg-error/10 px-2.5 py-1 rounded-full">Missed</span>
          </div>
          <p className="text-3xl font-bold text-on-surface">{totalMissed}</p>
          <p className="text-sm text-on-surface-variant mt-1">Doses missed</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'today', label: 'Today', icon: 'today' },
          { key: 'upcoming', label: 'Upcoming', icon: 'schedule' },
          { key: 'all', label: 'All', icon: 'list' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5
              ${filter === tab.key 
                ? 'bg-secondary-container text-on-secondary-container shadow-sm' 
                : 'text-on-surface-variant hover:bg-surface-container-high/50'
              }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Medication List */}
      <div className="space-y-3">
        {filteredMeds.length === 0 ? (
          <div className="text-center py-16 bg-surface-container-lowest rounded-3xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">medication</span>
            <p className="text-on-surface-variant mt-4 text-lg font-medium">No medications found</p>
            <p className="text-on-surface-variant/60 mt-1 text-sm">
              {filter === 'today' ? 'No medications scheduled for today' : 'Your schedule is empty'}
            </p>
          </div>
        ) : (
          filteredMeds.map((med, i) => {
            const scheduledDate = new Date(med.scheduledTime);
            const isPast = scheduledDate < now;
            
            return (
              <div key={med._id} className={`p-5 rounded-2xl bg-surface-container-lowest border transition-all duration-200
                animate-slide-in stagger-${Math.min(i + 1, 5)}
                ${med.status === 'taken' 
                  ? 'border-primary/20 bg-primary-container/10' 
                  : med.status === 'missed' 
                  ? 'border-error/20 bg-error-container/10'
                  : 'border-outline-variant/20 hover:shadow-elevation-1'
                }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center
                    ${med.status === 'taken' ? 'bg-primary text-on-primary' : 
                      med.status === 'missed' ? 'bg-error text-on-error' :
                      'bg-secondary-container text-secondary'}`}>
                    <span className="material-symbols-outlined filled text-xl">
                      {med.status === 'taken' ? 'check_circle' : 
                       med.status === 'missed' ? 'cancel' : 'medication'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-on-surface">
                      {med.prescriptionId?.medicationName || 'Medication'}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {med.prescriptionId?.dosage || ''} • Scheduled: {scheduledDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-on-surface-variant/60 mt-0.5">
                      {scheduledDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  
                  {med.status === 'pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleLog(med._id, 'taken')}
                        className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-semibold
                          hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm">
                        <span className="material-symbols-outlined text-base">check</span>
                        Taken
                      </button>
                      <button onClick={() => handleLog(med._id, 'missed')}
                        className="px-4 py-2 rounded-xl border border-error/30 text-error text-xs font-semibold
                          hover:bg-error-container/30 transition-all flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-base">close</span>
                        Missed
                      </button>
                    </div>
                  )}
                  
                  {med.status !== 'pending' && (
                    <span className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize
                      ${med.status === 'taken' ? 'bg-primary/10 text-primary' : 'bg-error/10 text-error'}`}>
                      {med.status}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
