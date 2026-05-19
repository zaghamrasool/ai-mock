import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import LandingPage from '@/src/pages/LandingPage';
import Dashboard from '@/src/pages/Dashboard';
import InterviewPage from '@/src/pages/InterviewPage';
import FeedbackPage from '@/src/pages/FeedbackPage';
import AdminPanel from '@/src/pages/AdminPanel';
import Navbar from '@/src/components/Navbar';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/" />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return isAdmin ? <>{children}</> : <Navigate to="/dashboard" />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/interview/:id" element={
              <PrivateRoute>
                <InterviewPage />
              </PrivateRoute>
            } />
            <Route path="/feedback/:id" element={
              <PrivateRoute>
                <FeedbackPage />
              </PrivateRoute>
            } />
            <Route path="/admin" element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}
