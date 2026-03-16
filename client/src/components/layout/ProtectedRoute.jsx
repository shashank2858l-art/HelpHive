import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role if unauthorized for this route
    return <Navigate to={user.role === 'admin' ? '/admin' : '/volunteer'} replace />;
  }

  // Mandatory profile completion for volunteers
  if (user.role === 'volunteer' && (!user.location || !user.pincode) && window.location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
