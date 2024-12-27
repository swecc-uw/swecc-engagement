import React from 'react';
import { Navigate } from 'react-router-dom';

// Define the props for ProtectedRoute
interface DevRouteProps {
  children: React.ReactNode;
}

const DevRoute: React.FC<DevRouteProps> = ({ children }) => {
  const isDev = import.meta.env.MODE === 'development';
  return isDev ? <>{children}</> : <Navigate to="/" />;
};

export default DevRoute;
