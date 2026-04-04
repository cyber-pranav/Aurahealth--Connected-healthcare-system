import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const EVENT_CONFIG = {
  consultation: { icon: 'stethoscope', color: 'bg-primary', label: 'Consultation' },
  diagnosis: { icon: 'biotech', color: 'bg-tertiary', label: 'Diagnosis' },
  prescription: { icon: 'medication', color: 'bg-secondary', label: 'Prescription' },
  lab_result: { icon: 'science', color: 'bg-[#7c4dff]', label: 'Lab Result' },
  medication_adherence: { icon: 'monitor_heart', color: 'bg-[#00897b]', label: 'Adherence' },
  video_call: { icon: 'videocam', color: 'bg-[#1565c0]', label: 'Video Call' },
  care_plan_update: { icon: 'assignment', color: 'bg-[#ef6c00]', label: 'Care Plan' },
  vital_sign: { icon: 'ecg_heart', color: 'bg-[#c62828]', label: 'Vitals' },
  report_upload: { icon: 'upload_file', color: 'bg-[#4527a0]', label: 'Report' },
  follow_up: { icon: 'event_repeat', color: 'bg-[#2e7d32]', label: 'Follow-up' },
};

const SEVERITY_COLORS = {
  low: 'text-primary bg-primary/10', medium: 'text-[#ef6c00] bg-[#ef6c00]/10',
  high: 'text-error bg-error/10', critical: 'text-[#c62828] bg-[#c62828]/10',
};

export default function HealthTimeline() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');

  useEffect(() => {
    if (user.role === 'DOCTOR') loadPatients();
    else if (user.role === 'CAREGIVER') loadLinkedPatients();
    else loadTimeline();
  }, []);

  useEffect(() => { if (selectedPatient) loadTimeline(selectedPatient); }, [selectedPatient]);

  const loadPatients = async () => {
    try {
      const res = await api.get('/clinic/appointments');
      const map = new Map();
      res.data.forEach(a => { if (a.patientId && !map.has(a.patientId._id)) map.set(a.patientId._id, a.patientId); });
      setPatients(Array.from(map.values()));
      if (map.size > 0) setSelectedPatient(Array.from(map.values())[0]._id);
      else setLoading(false);
    } catch { setLoading(false); }
  };

  const loadLinkedPatients = async () => {
    try {
      const res = await api.get('/auth/linked-patients');
      setPatients(res.data);
      if (res.data.length > 0) setSelectedPatient(res.data[0]._id);
      else setLoading(false);
    } catch { setLoading(false); }
  };

  const loadTimeline = async (patientId) => {
    setLoading(true);
    try {
      const url = patientId ? `/timeline?patientId=${patientId}` : '/timeline';
      const res = await api.get(url);
      setEvents(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = filterType === 'all' ? events : events.filter(e => e.type === filterType);
  const groupByDate = (items) => {
    const groups = {};
    items.forEach(ev => {
      const d = new Date(ev.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      if (!groups[d]) groups[d] = [];
      groups[d].push(ev);
    });
    return groups;
  };
  const grouped = groupByDate(filtered);
  const eventTypes = ['all', ...new Set(events.map(e => e.type))];

  if (loading) return <div className="space-y-6 animate-pulse"><div className="h-8 w-48 skeleton" />{[1,2,3].map(i=><div key={i} className="h-24 skeleton rounded-2xl"/>)}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined filled text-primary text-3xl">timeline</span>Health Timeline
        </h1>
        <p className="text-on-surface-variant mt-1">Complete chronological view of health events</p>
      </div>

      {(user.role === 'DOCTOR' || user.role === 'CAREGIVER') && patients.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-on-surface-variant">Patient:</span>
          <select value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
            {patients.map(p => <option key={p._id} value={p._id}>{p.name} {p.age ? `(${p.age} yrs)` : ''}</option>)}
          </select>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {eventTypes.map(type => {
          const cfg = EVENT_CONFIG[type] || {};
          return (
            <button key={type} onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5
                ${filterType === type ? 'bg-secondary-container text-on-secondary-container shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high/50 border border-outline-variant/30'}`}>
              {type !== 'all' && <span className="material-symbols-outlined text-sm">{cfg.icon || 'circle'}</span>}
              {type === 'all' ? 'All Events' : cfg.label || type}
            </button>
          );
        })}
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 bg-surface-container-lowest rounded-3xl border border-outline-variant/20">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">timeline</span>
          <p className="text-on-surface-variant mt-4 text-lg font-medium">No health events yet</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary text-lg">calendar_today</span>
                <h3 className="text-sm font-semibold text-on-surface">{date}</h3>
                <div className="flex-1 h-px bg-outline-variant/20" />
                <span className="text-xs text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">{items.length} event{items.length > 1 ? 's' : ''}</span>
              </div>
              <div className="relative pl-10 space-y-4">
                <div className="timeline-line" />
                {items.map((ev, i) => {
                  const cfg = EVENT_CONFIG[ev.type] || { icon: 'circle', color: 'bg-outline', label: ev.type };
                  const severity = ev.metadata?.severity;
                  const isExpanded = expandedId === ev._id;
                  return (
                    <div key={ev._id || i} className={`relative animate-slide-in stagger-${Math.min(i+1,5)}`}>
                      <div className={`absolute -left-10 top-4 w-5 h-5 rounded-full ${cfg.color} flex items-center justify-center z-10 shadow-sm`}>
                        <span className="material-symbols-outlined filled text-white text-[11px]">{cfg.icon}</span>
                      </div>
                      <button onClick={() => setExpandedId(isExpanded ? null : ev._id)}
                        className={`w-full text-left p-4 rounded-2xl bg-surface-container-lowest border transition-all duration-200 hover:shadow-elevation-1 ${isExpanded ? 'border-primary/30 shadow-elevation-1' : 'border-outline-variant/20'}`}>
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.color} text-white`}>{cfg.label}</span>
                              {severity && <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SEVERITY_COLORS[severity] || ''}`}>{severity}</span>}
                            </div>
                            <h4 className="text-sm font-semibold text-on-surface mt-2">{ev.title}</h4>
                            {ev.description && <p className={`text-xs text-on-surface-variant mt-1 ${isExpanded ? '' : 'line-clamp-2'}`}>{ev.description}</p>}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-on-surface-variant">{new Date(ev.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                            <span className={`material-symbols-outlined text-on-surface-variant/50 text-base mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-outline-variant/20 animate-fade-in">
                            {ev.metadata?.doctorName && <div className="flex items-center gap-2 mb-2"><span className="material-symbols-outlined text-sm text-on-surface-variant">person</span><span className="text-xs text-on-surface-variant">Dr. {ev.metadata.doctorName}</span></div>}
                            {ev.metadata?.diagnoses?.length > 0 && <div className="flex items-center gap-2 mb-2 flex-wrap"><span className="material-symbols-outlined text-sm text-on-surface-variant">biotech</span>{ev.metadata.diagnoses.map((d,idx)=><span key={idx} className="text-xs bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-full">{d}</span>)}</div>}
                            {ev.metadata?.medications?.length > 0 && <div className="flex items-center gap-2 mb-2 flex-wrap"><span className="material-symbols-outlined text-sm text-on-surface-variant">medication</span>{ev.metadata.medications.map((m,idx)=><span key={idx} className="text-xs bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full">{m}</span>)}</div>}
                            {ev.metadata?.adherenceRate !== undefined && <div className="flex items-center gap-2 mb-2"><span className="material-symbols-outlined text-sm text-on-surface-variant">monitor_heart</span><span className="text-xs text-on-surface-variant">Adherence: {ev.metadata.adherenceRate}%</span><div className="flex-1 h-1.5 bg-primary/10 rounded-full overflow-hidden max-w-[100px]"><div className="h-full bg-primary rounded-full" style={{width:`${ev.metadata.adherenceRate}%`}}/></div></div>}
                            {ev.aiInsight && <div className="mt-3 p-3 rounded-xl bg-primary-container/30 border border-primary/10"><div className="flex items-center gap-1.5 mb-1"><span className="material-symbols-outlined text-sm text-primary">auto_awesome</span><span className="text-xs font-semibold text-primary">AI Insight</span></div><p className="text-xs text-on-surface-variant">{ev.aiInsight}</p></div>}
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
