import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import CaregiverDashboard from './pages/CaregiverDashboard';
import Appointments from './pages/Appointments';
import Consultation from './pages/Consultation';
import MedicationTracker from './pages/MedicationTracker';
import Chat from './pages/Chat';
import HealthTimeline from './pages/HealthTimeline';
import CarePlans from './pages/CarePlans';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import NotificationsPanel from './pages/NotificationsPanel';
import VideoConsultationRoom from './pages/VideoConsultationRoom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import AuraLoader from './components/AuraLoader';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><span className="material-symbols-outlined text-primary text-6xl animate-spin">progress_activity</span></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function App() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // Artificial premium load state
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4500); // Allow sufficient time for the user to see the animations
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <AnimatePresence mode="wait"><AuraLoader /></AnimatePresence>;
  }

  if (loading) {
    return <AuraLoader />;
  }

  const getDashboard = () => {
    if (!user) return <Landing />;
    if (user.role === 'DOCTOR') return <DoctorDashboard />;
    if (user.role === 'CAREGIVER') return <CaregiverDashboard />;
    return <PatientDashboard />;
  };

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      {/* Video consultation - full screen, outside layout */}
      <Route path="/video/:appointmentId" element={
        <ProtectedRoute><VideoConsultationRoom /></ProtectedRoute>
      } />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={getDashboard()} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/consultation/:appointmentId" element={
          <ProtectedRoute roles={['DOCTOR']}><Consultation /></ProtectedRoute>
        } />
        <Route path="/medications" element={<MedicationTracker />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/timeline" element={<HealthTimeline />} />
        <Route path="/care-plans" element={<CarePlans />} />
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/notifications" element={<NotificationsPanel />} />
      </Route>
    </Routes>
  );
}

export default App;
