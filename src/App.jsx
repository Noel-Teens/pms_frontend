import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';

// Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard';
import UserManagement from '@/pages/admin/UserManagement';
import UserDetail from '@/pages/admin/UserDetail';
import CreateUser from '@/pages/admin/CreateUser';
import PaperAssignment from '@/pages/admin/PaperAssignment';
import PaperReview from '@/pages/admin/PaperReview';
import VersionDetail from '@/pages/admin/VersionDetail';
import DeadlineManagement from '@/pages/admin/DeadlineManagement';

// User Pages
import UserDashboard from '@/pages/user/Dashboard';
import PapersList from '@/pages/user/PapersList';
import PaperworkDetail from '@/pages/paperworks/PaperworkDetail';
import PaperworkSubmit from '@/pages/paperworks/PaperworkSubmit';
import CreatePaperwork from '@/pages/user/CreatePaperwork';

import { useAuth } from '@/hooks/useAuth';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate
              to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
              replace
            />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={
          user ? (
            <Navigate
              to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
              replace
            />
          ) : (
            <Register />
          )
        }
      />

      {/* Protected admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <Layout>
              <UserManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/create"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <Layout>
              <CreateUser />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:userId"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <Layout>
              <UserDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/papers"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <Layout>
              <PaperAssignment />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/papers/:paperId"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <Layout>
              <PaperReview />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/papers/:paperId/versions/:versionNo"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <Layout>
              <VersionDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/papers/:paperId/deadline"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <Layout>
              <DeadlineManagement />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Protected user routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="RESEARCHER">
            <Layout>
              <UserDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/papers"
        element={
          <ProtectedRoute requiredRole="RESEARCHER">
            <Layout>
              <PapersList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/papers/:id"
        element={
          <ProtectedRoute requiredRole="RESEARCHER">
            <Layout>
              <PaperworkDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/papers/:id/submit"
        element={
          <ProtectedRoute requiredRole="RESEARCHER">
            <Layout>
              <PaperworkSubmit />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/papers/create"
        element={
          <ProtectedRoute requiredRole="RESEARCHER">
            <Layout>
              <CreatePaperwork />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Root redirect */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate
              to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
              replace
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-right" />
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
