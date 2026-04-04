import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAnalytics(); }, []);

  const loadAnalytics = async () => {
    try {
      const endpoint = user.role === 'DOCTOR' ? '/analytics/doctor' : '/analytics/patient';
      const res = await api.get(endpoint);
      setAnalytics(res.data);
    } catch (err) { console.error('Analytics error:', err); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 skeleton rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-32 skeleton rounded-3xl" />)}
      </div>
    </div>
  );

  if (!analytics) return (
    <div className="text-center py-16 bg-surface-container-lowest rounded-3xl border border-outline-variant/20">
      <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">analytics</span>
      <p className="text-on-surface-variant mt-4 text-lg font-medium">Unable to load analytics</p>
    </div>
  );

  const AdherenceBar = ({ rate, label }) => (
    <div className="flex items-center gap-3">
      <span className="text-xs text-on-surface-variant w-16 truncate">{label}</span>
      <div className="flex-1 h-2.5 bg-primary/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${rate >= 80 ? 'bg-primary' : rate >= 50 ? 'bg-[#ef6c00]' : 'bg-error'}`}
          style={{ width: `${rate}%` }} />
      </div>
      <span className="text-xs font-semibold text-on-surface w-10 text-right">{rate}%</span>
    </div>
  );

  // DOCTOR VIEW
  if (user.role === 'DOCTOR') {
    const stats = analytics?.patientStats || [];
    const avgAdherence = stats.length ? Math.round(stats.reduce((s, p) => s + (p.adherenceRate || 0), 0) / stats.length) : 0;
    const highRisk = stats.filter(p => p.riskLevel === 'high');

    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined filled text-primary text-3xl">analytics</span>Practice Analytics
          </h1>
          <p className="text-on-surface-variant mt-1">Patient population insights and AI recommendations</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon="groups" color="primary" value={stats.length} label="Total Patients" />
          <StatCard icon="trending_up" color="secondary" value={`${avgAdherence}%`} label="Avg Adherence" />
          <StatCard icon="warning" color="error" value={highRisk.length} label="High Risk" />
          <StatCard icon="verified" color="tertiary" value={stats.length - highRisk.length} label="On Track" />
        </div>
        {highRisk.length > 0 && (
          <div className="bg-error-container/20 border border-error/20 rounded-3xl p-5">
            <h3 className="text-sm font-semibold text-error flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined filled">warning</span>High-Risk Patients
            </h3>
            <div className="space-y-3">
              {highRisk.map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-surface-container-lowest">
                  <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-error">person</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-on-surface">{p.name}</p>
                    <p className="text-xs text-on-surface-variant">{p.conditions?.join(', ') || 'No conditions'}</p>
                  </div>
                  <span className="text-sm font-bold text-error">{p.adherenceRate || 0}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {analytics?.insights?.length > 0 && <InsightsPanel insights={analytics.insights} />}
      </div>
    );
  }

  // PATIENT VIEW
  const { adherence = {}, weeklyTrend = [], appointments: aptStats = {}, diagnoses = {}, carePlans: cpStats = {}, insights = [] } = analytics;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined filled text-primary text-3xl">analytics</span>My Health Analytics
        </h1>
        <p className="text-on-surface-variant mt-1">Track your health metrics and progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="medication" color="primary" value={`${adherence.rate || 0}%`} label="Medication Adherence" />
        <StatCard icon="calendar_month" color="secondary" value={aptStats.total || 0} label="Total Appointments" />
        <StatCard icon="assignment" color="tertiary" value={cpStats.active || 0} label="Active Care Plans" />
        <StatCard icon="description" color="primary" value={analytics.recordCount || 0} label="Medical Records" />
      </div>

      {/* Adherence Progress Ring */}
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-elevation-1 p-5">
        <h3 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined filled text-primary">monitor_heart</span>Medication Adherence
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-primary/10" strokeWidth="10" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor"
                  className={adherence.rate >= 80 ? 'text-primary' : adherence.rate >= 50 ? 'text-[#ef6c00]' : 'text-error'}
                  strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${(adherence.rate || 0) * 2.64} 264`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-on-surface">{adherence.rate || 0}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-primary" /><span className="text-sm text-on-surface-variant">Taken: {adherence.taken || 0}</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-error" /><span className="text-sm text-on-surface-variant">Missed: {adherence.missed || 0}</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-outline-variant" /><span className="text-sm text-on-surface-variant">Pending: {adherence.pending || 0}</span></div>
            </div>
          </div>

          {/* Weekly Trend */}
          <div>
            <h4 className="text-sm font-medium text-on-surface-variant mb-3">7-Day Trend</h4>
            <div className="flex items-end gap-1 h-24">
              {weeklyTrend.map((w, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-primary/10 rounded-t-lg overflow-hidden relative" style={{ height: '80px' }}>
                    <div className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-500 ${w.rate === null ? 'bg-outline-variant/20' : w.rate >= 80 ? 'bg-primary' : w.rate >= 50 ? 'bg-[#ef6c00]' : 'bg-error'}`}
                      style={{ height: w.rate !== null ? `${w.rate}%` : '10%' }} />
                  </div>
                  <span className="text-[10px] text-on-surface-variant">{w.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Diagnoses */}
      {Object.keys(diagnoses).length > 0 && (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-elevation-1 p-5">
          <h3 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined filled text-tertiary">biotech</span>Diagnoses
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(diagnoses).map(([name, count]) => (
              <span key={name} className="px-3 py-1.5 rounded-full bg-tertiary-container/40 text-on-tertiary-container text-xs font-medium">
                {name} {count > 1 ? `(×${count})` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights */}
      {insights.length > 0 && <InsightsPanel insights={insights} />}
    </div>
  );
}

function StatCard({ icon, color, value, label }) {
  const colorMap = {
    primary: 'bg-primary-container/40 border-primary/10 text-primary',
    secondary: 'bg-secondary-container/40 border-secondary/10 text-secondary',
    tertiary: 'bg-tertiary-container/40 border-tertiary/10 text-tertiary',
    error: 'bg-error-container/40 border-error/10 text-error',
  };
  const cls = colorMap[color] || colorMap.primary;
  const [bg, border, text] = cls.split(' ');

  return (
    <div className={`p-5 rounded-3xl ${bg} border ${border}`}>
      <span className={`material-symbols-outlined filled ${text} text-2xl mb-2`}>{icon}</span>
      <p className="text-3xl font-bold text-on-surface">{value}</p>
      <p className="text-sm text-on-surface-variant mt-1">{label}</p>
    </div>
  );
}

function InsightsPanel({ insights }) {
  const iconMap = { warning: 'text-error', caution: 'text-[#ef6c00]', info: 'text-primary', positive: 'text-primary', suggestion: 'text-secondary' };
  return (
    <div className="bg-primary-container/20 border border-primary/10 rounded-3xl p-5">
      <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined filled">auto_awesome</span>AI Health Insights
      </h3>
      <div className="space-y-2">
        {insights.map((ins, i) => (
          <div key={i} className="p-3 rounded-xl bg-surface-container-lowest flex items-start gap-3">
            <span className={`material-symbols-outlined text-lg ${iconMap[ins.type] || 'text-primary'}`}>{ins.icon || 'info'}</span>
            <p className="text-sm text-on-surface flex-1">{ins.message || ins.text || ins}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
