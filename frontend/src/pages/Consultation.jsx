import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Consultation() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    consultationNotes: '',
    diagnoses: '',
    prescriptions: [{ name: '', dosage: '', frequency: '1', durationDays: '7' }]
  });

  useEffect(() => {
    loadAppointment();
  }, []);

  const loadAppointment = async () => {
    try {
      const res = await api.get('/clinic/appointments');
      const apt = res.data.find(a => a._id === appointmentId);
      setAppointment(apt);
    } catch (err) {
      console.error('Failed to load', err);
    } finally {
      setLoading(false);
    }
  };

  const addPrescription = () => {
    setForm(prev => ({
      ...prev,
      prescriptions: [...prev.prescriptions, { name: '', dosage: '', frequency: '1', durationDays: '7' }]
    }));
  };

  const removePrescription = (index) => {
    setForm(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== index)
    }));
  };

  const updatePrescription = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.map((p, i) => i === index ? { ...p, [field]: value } : p)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/clinic/consultations', {
        patientId: appointment.patientId._id,
        consultationNotes: form.consultationNotes,
        diagnoses: form.diagnoses.split(',').map(d => d.trim()).filter(Boolean),
        prescriptions: form.prescriptions.filter(p => p.name).map(p => ({
          name: p.name,
          dosage: p.dosage,
          frequency: parseInt(p.frequency),
          durationDays: parseInt(p.durationDays)
        }))
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error('Submission failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-64 skeleton" />
        <div className="h-64 skeleton rounded-3xl" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center h-[60vh] animate-fade-in">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined filled text-primary text-4xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">Consultation Saved!</h2>
          <p className="text-on-surface-variant">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-5xl text-error/40">error</span>
        <p className="text-on-surface mt-4">Appointment not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Patient Info Header */}
      <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/20 shadow-elevation-1">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined filled text-secondary text-3xl">person</span>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-on-surface">{appointment.patientId?.name || 'Patient'}</h1>
            <p className="text-sm text-on-surface-variant">
              {appointment.patientId?.gender ? `${appointment.patientId.gender} • ` : ''}
              {appointment.patientId?.age ? `${appointment.patientId.age} years • ` : ''}
              {new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <span className="material-symbols-outlined text-primary text-3xl filled">clinical_notes</span>
        </div>
      </div>

      {/* Consultation Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Notes */}
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/20 shadow-elevation-1">
          <h2 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined filled text-primary">edit_note</span>
            Consultation Notes
          </h2>
          <textarea
            value={form.consultationNotes}
            onChange={(e) => setForm(prev => ({ ...prev, consultationNotes: e.target.value }))}
            rows={5}
            className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/40
              text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 
              transition-all resize-none"
            placeholder="Document your findings, observations, and recommendations..."
            required
          />
          <div className="mt-4">
            <label className="block text-sm font-medium text-on-surface mb-2">Diagnoses (comma-separated)</label>
            <input
              type="text"
              value={form.diagnoses}
              onChange={(e) => setForm(prev => ({ ...prev, diagnoses: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/40
                text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Hypertension, Type 2 Diabetes"
            />
          </div>
        </div>

        {/* Prescriptions */}
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/20 shadow-elevation-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined filled text-secondary">medication</span>
              Prescriptions
            </h2>
            <button type="button" onClick={addPrescription}
              className="px-3 py-1.5 bg-secondary-container text-on-secondary-container rounded-xl text-xs font-semibold
                hover:bg-secondary-container/70 transition-all flex items-center gap-1">
              <span className="material-symbols-outlined text-base">add</span>
              Add
            </button>
          </div>

          <div className="space-y-4">
            {form.prescriptions.map((rx, i) => (
              <div key={i} className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 
                animate-fade-in relative">
                {form.prescriptions.length > 1 && (
                  <button type="button" onClick={() => removePrescription(i)}
                    className="absolute top-3 right-3 p-1 text-error hover:bg-error-container/30 rounded-lg transition-all">
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">Medication Name</label>
                    <input type="text" value={rx.name} onChange={(e) => updatePrescription(i, 'name', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40
                        text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="Metformin" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-on-surface-variant mb-1">Dosage</label>
                    <input type="text" value={rx.dosage} onChange={(e) => updatePrescription(i, 'dosage', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40
                        text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="500mg" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-on-surface-variant mb-1">x/Day</label>
                      <input type="number" min="1" max="6" value={rx.frequency} 
                        onChange={(e) => updatePrescription(i, 'frequency', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40
                          text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-on-surface-variant mb-1">Days</label>
                      <input type="number" min="1" value={rx.durationDays} 
                        onChange={(e) => updatePrescription(i, 'durationDays', e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40
                          text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={submitting}
          className="w-full py-4 bg-primary text-on-primary rounded-2xl font-semibold text-base
            hover:bg-primary/90 transition-all duration-200 shadow-elevation-2 hover:shadow-elevation-3
            disabled:opacity-50 flex items-center justify-center gap-2">
          {submitting ? (
            <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
          ) : (
            <>
              <span className="material-symbols-outlined text-xl">save</span>
              Save Consultation & Prescriptions
            </>
          )}
        </button>
      </form>
    </div>
  );
}
