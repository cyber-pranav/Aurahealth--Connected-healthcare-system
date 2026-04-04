import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Appointments from './pages/Appointments';
import Consultation from './pages/Consultation';
import MedicationTracker from './pages/MedicationTracker';
import Chat from './pages/Chat';
import Layout from './components/Layout';
import Landing from './pages/Landing';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><span className="material-symbols-outlined text-primary text-6xl animate-spin">progress_activity</span></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <span className="material-symbols-outlined text-primary text-6xl animate-spin">progress_activity</span>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={
          user?.role === 'DOCTOR' ? <DoctorDashboard /> : <PatientDashboard />
        } />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/consultation/:appointmentId" element={
          <ProtectedRoute roles={['DOCTOR']}><Consultation /></ProtectedRoute>
        } />
        <Route path="/medications" element={
          <ProtectedRoute roles={['PATIENT']}><MedicationTracker /></ProtectedRoute>
        } />
        <Route path="/chat" element={<Chat />} />
      </Route>
    </Routes>
  );
}

export default App;
