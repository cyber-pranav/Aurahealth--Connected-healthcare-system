import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({ doctorId: '', date: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const apptRes = await api.get('/clinic/appointments');
      setAppointments(apptRes.data);
      if (user.role === 'PATIENT') {
        const docRes = await api.get('/clinic/doctors');
        setDoctors(docRes.data);
      }
    } catch (err) {
      console.error('Failed to load', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/clinic/appointments', bookingData);
      setShowBooking(false);
      setBookingData({ doctorId: '', date: '', notes: '' });
      loadData();
    } catch (err) {
      console.error('Booking failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-primary/10 text-primary';
      case 'completed': return 'bg-primary-container text-on-primary-container';
      case 'cancelled': return 'bg-error/10 text-error';
      default: return 'bg-surface-container text-on-surface-variant';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1,2,3].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Appointments</h1>
          <p className="text-on-surface-variant mt-1">
            {user.role === 'PATIENT' ? 'Manage your healthcare appointments' : 'View your patient schedule'}
          </p>
        </div>
        {user.role === 'PATIENT' && (
          <button
            onClick={() => setShowBooking(!showBooking)}
            className="px-5 py-2.5 bg-primary text-on-primary rounded-2xl font-semibold text-sm
              hover:bg-primary/90 transition-all duration-200 shadow-elevation-1 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Book Appointment
          </button>
        )}
      </div>

      {/* Booking Form */}
      {showBooking && (
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-elevation-2 p-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined filled text-primary">event_available</span>
            Book New Appointment
          </h2>
          <form onSubmit={handleBook} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Select Doctor</label>
                <select
                  value={bookingData.doctorId}
                  onChange={(e) => setBookingData(prev => ({ ...prev, doctorId: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/40
                    text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                >
                  <option value="">Choose a doctor...</option>
                  {doctors.map(doc => (
                    <option key={doc._id} value={doc._id}>
                      Dr. {doc.name} — {doc.specialization || 'General'}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-2">Date & Time</label>
                <input
                  type="datetime-local"
                  value={bookingData.date}
                  onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/40
                    text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Notes (Optional)</label>
              <textarea
                value={bookingData.notes}
                onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/40
                  text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                placeholder="Describe your symptoms or reason for visit..."
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting}
                className="px-6 py-2.5 bg-primary text-on-primary rounded-2xl font-semibold text-sm
                  hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2">
                {submitting ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : 
                  <><span className="material-symbols-outlined text-lg">check</span> Confirm Booking</>}
              </button>
              <button type="button" onClick={() => setShowBooking(false)}
                className="px-6 py-2.5 border border-outline-variant/40 text-on-surface-variant rounded-2xl 
                  font-medium text-sm hover:bg-surface-container-high transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Appointments List */}
      <div className="space-y-3">
        {appointments.length === 0 ? (
          <div className="text-center py-16 bg-surface-container-lowest rounded-3xl border border-outline-variant/20">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">calendar_month</span>
            <p className="text-on-surface-variant mt-4 text-lg font-medium">No appointments yet</p>
            <p className="text-on-surface-variant/60 mt-1 text-sm">Book your first appointment to get started</p>
          </div>
        ) : (
          appointments.map((apt, i) => (
            <div key={apt._id} className={`p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/20
              hover:shadow-elevation-1 transition-all duration-200 animate-slide-in stagger-${Math.min(i + 1, 5)}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-container/50 flex items-center justify-center">
                  <span className="material-symbols-outlined filled text-primary text-xl">
                    {user.role === 'PATIENT' ? 'stethoscope' : 'person'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-on-surface">
                    {user.role === 'PATIENT' 
                      ? `Dr. ${apt.doctorId?.name || 'Unknown'}`
                      : apt.patientId?.name || 'Patient'
                    }
                  </p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {user.role === 'PATIENT' 
                      ? apt.doctorId?.specialization || 'General'
                      : `${apt.patientId?.gender || ''} ${apt.patientId?.age ? `• ${apt.patientId.age} yrs` : ''}`
                    }
                  </p>
                  {apt.notes && <p className="text-xs text-on-surface-variant/70 mt-1 italic">"{apt.notes}"</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-on-surface">
                    {new Date(apt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {new Date(apt.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className={`text-xs font-medium px-3 py-1.5 rounded-full capitalize ${getStatusColor(apt.status)}`}>
                  {apt.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
