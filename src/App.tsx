import { ChakraProvider } from '@chakra-ui/react';
import { Routes, Route, HashRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { theme } from './theme';

import MemberProfilePage from './pages/MemberProfilePage';
import JoinPage from './pages/JoinPage';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedPage from './pages/TestPage';
import DevRoute from './components/debug/DevRoute';
import DirectoryPage from './pages/DirectoryPage';
import MemberProfile from './pages/MemberProfile';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import AdminRoute from './components/admin/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import ResetPasswordForm from './pages/ResetPassword';
import AdminConsolePage from './pages/admin/AdminConsolePage';

const App: React.FC = () => {
  return (
    <ChakraProvider theme={theme}>
      <HashRouter>
        <Layout>
          <Routes>
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MemberProfilePage />
                </ProtectedRoute>
              }
            />
            <Route path="/join" element={<JoinPage />} />
            <Route
              path="/password-reset-confirm/:uid/:token"
              element={<ResetPasswordForm />}
            />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/directory"
              element={
                <ProtectedRoute>
                  <DirectoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/directory/:userId"
              element={
                <ProtectedRoute>
                  <MemberProfile />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="*" element={<div>Not Found</div>} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <DevRoute>
                    <ProtectedPage />
                  </DevRoute>
                </ProtectedRoute>
              }
            />
            <Route path="/admin/console" element={<AdminConsolePage />} />
          </Routes>
        </Layout>
      </HashRouter>
    </ChakraProvider>
  );
};

export default App;
