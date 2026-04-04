import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'PATIENT',
    specialization: '', experienceYears: '',
    age: '', gender: '', allergies: '', chronicConditions: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-primary via-primary to-primary-light 
        relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative z-10 max-w-md">
          <div className="w-16 h-16 rounded-3xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-8">
            <span className="material-symbols-outlined filled text-white text-3xl">cardiology</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">Join the<br />Aura Network</h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Whether you're a patient seeking better care or a doctor streamlining your practice — Aura has you covered.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface overflow-y-auto">
        <div className="w-full max-w-lg py-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined filled text-on-primary text-xl">cardiology</span>
            </div>
            <span className="text-xl font-bold text-on-surface">Aura Health</span>
          </div>

          <h1 className="text-3xl font-bold text-on-surface mb-2">Create Account</h1>
          <p className="text-on-surface-variant mb-8">Fill in your details to get started</p>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-error-container/50 border border-error/20 flex items-center gap-3">
              <span className="material-symbols-outlined text-error">error</span>
              <p className="text-sm text-on-error-container">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Toggle */}
            <div>
              <label className="block text-sm font-medium text-on-surface mb-3">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {['PATIENT', 'DOCTOR'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role }))}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-3
                      ${formData.role === role 
                        ? 'border-primary bg-primary-container/30 shadow-sm' 
                        : 'border-outline-variant/40 hover:border-outline'
                      }`}
                  >
                    <span className={`material-symbols-outlined text-2xl ${formData.role === role ? 'filled text-primary' : 'text-on-surface-variant'}`}>
                      {role === 'PATIENT' ? 'person' : 'stethoscope'}
                    </span>
                    <span className={`text-sm font-medium ${formData.role === role ? 'text-primary' : 'text-on-surface-variant'}`}>
                      {role === 'PATIENT' ? 'Patient' : 'Doctor'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-on-surface mb-2">Full Name</label>
                <input id="register-name" type="text" value={formData.name} onChange={update('name')}
                  className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/40
                    text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="John Doe" required />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-on-surface mb-2">Email</label>
                <input id="register-email" type="email" value={formData.email} onChange={update('email')}
                  className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/40
                    text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Password</label>
              <input id="register-password" type="password" value={formData.password} onChange={update('password')}
                className="w-full px-4 py-3 rounded-2xl bg-surface-container-low border border-outline-variant/40
                  text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="••••••••" required />
            </div>

            {/* Conditional Fields */}
            {formData.role === 'DOCTOR' ? (
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-primary-container/10 border border-primary/10">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Specialization</label>
                  <input type="text" value={formData.specialization} onChange={update('specialization')}
                    className="w-full px-4 py-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/40
                      text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="Cardiology" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Years of Exp.</label>
                  <input type="number" value={formData.experienceYears} onChange={update('experienceYears')}
                    className="w-full px-4 py-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/40
                      text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="5" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-secondary-container/10 border border-secondary/10">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Age</label>
                  <input type="number" value={formData.age} onChange={update('age')}
                    className="w-full px-4 py-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/40
                      text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Gender</label>
                  <select value={formData.gender} onChange={update('gender')}
                    className="w-full px-4 py-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/40
                      text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            )}

            <button id="register-submit" type="submit" disabled={loading}
              className="w-full py-3.5 bg-primary text-on-primary rounded-2xl font-semibold text-sm
                hover:bg-primary/90 transition-all duration-200 shadow-elevation-1 hover:shadow-elevation-2
                disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
              ) : (
                <>
                  Create Account
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
