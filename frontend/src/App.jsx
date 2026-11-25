import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './services/supabase';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { initPokecenterStartupSound } from './utils/audio';
const Home = lazy(() => import('./pages/Home'));
const Catalog = lazy(() => import('./pages/Catalog'));
const Collection = lazy(() => import('./pages/Collection'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const CardDetail = lazy(() => import('./pages/CardDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Trainers = lazy(() => import('./pages/Trainers'));
const TrainerDetail = lazy(() => import('./pages/TrainerDetail'));
const About = lazy(() => import('./pages/About'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

import BottomNavigation from './components/BottomNavigation';
import Navbar from './components/Navbar';
import LoadingSkeleton from './components/LoadingSkeleton';
import ErrorBoundary from './components/ErrorBoundary';

import './styles/components.css';
import './styles/pages.css';
import './styles/auth.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSkeleton type="page" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    // If URL hash contains recovery token from Supabase email, redirect to /reset-password
    const hash = window.location.hash || '';
    if (hash.includes('type=recovery') || (hash.includes('access_token') && !window.location.pathname.includes('/reset-password'))) {
      navigate('/reset-password' + hash, { replace: true });
    }

    // Listen for Supabase password recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/reset-password', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <Suspense fallback={<LoadingSkeleton type="page" />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route
          path="/collection"
          element={
            <ProtectedRoute>
              <Collection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wishlist"
          element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          }
        />
        <Route path="/card/:id" element={<CardDetail />} />
        <Route path="/trainers" element={<Trainers />} />
        <Route path="/trainer/:id" element={<TrainerDetail />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  useEffect(() => {
    initPokecenterStartupSound();
  }, []);

  return (
    <AuthProvider>
      <div className="app-container">
        <Navbar />
        <main className="page-container">
          <ErrorBoundary>
            <AppRoutes />
          </ErrorBoundary>
        </main>
        <BottomNavigation />
      </div>
    </AuthProvider>
  );
}

export default App;
