import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/components.css';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="protected-route-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
