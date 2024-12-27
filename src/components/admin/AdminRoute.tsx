import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Define the props for ProtectedRoute
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAdmin } = useAuth();

  return isAdmin ? <>{children}</> : <Navigate to="/" />;
};

export default AdminRoute;
