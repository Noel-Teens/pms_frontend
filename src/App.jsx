import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import { lazy, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Loading component
const LoadingSpinner = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Lazy load pages for better performance
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const AcceptInvite = lazy(() => import('@/pages/AcceptInvite'));

// Admin Pages - Lazy loaded
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'));
const UserDetail = lazy(() => import('@/pages/admin/UserDetail'));
const CreateUser = lazy(() => import('@/pages/admin/CreateUser'));
const PaperAssignment = lazy(() => import('@/pages/admin/PaperAssignment'));
const PaperReview = lazy(() => import('@/pages/admin/PaperReview'));
const VersionDetail = lazy(() => import('@/pages/admin/VersionDetail'));
const DeadlineManagement = lazy(() => import('@/pages/admin/DeadlineManagement'));

// User Pages - Lazy loaded
const UserDashboard = lazy(() => import('@/pages/user/Dashboard'));
const PapersList = lazy(() => import('@/pages/user/PapersList'));
const PaperworkDetail = lazy(() => import('@/pages/paperworks/PaperworkDetail'));
const PaperworkSubmit = lazy(() => import('@/pages/paperworks/PaperworkSubmit'));
const CreatePaperwork = lazy(() => import('@/pages/user/CreatePaperwork'));

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
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
          path="/accept-invite/:token"
          element={<AcceptInvite />}
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
    </Suspense>
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
