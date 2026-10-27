
import { useEffect, useState } from 'react';
import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import type { Role } from './types/app.types';
import { roleMenus } from './constants/navigation';
import { useAuth } from './features/auth/context/AuthContext';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import { mapUserRoleToAppRole } from './features/auth/utils/roleMapper';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import CitizenReportPage from './features/incidents/pages/CitizenReportPage';
import CitizenTrackingPage from './features/incidents/pages/CitizenTrackingPage';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';

function Dashboard() {
  const { user } = useAuth();
  const role: Role = mapUserRoleToAppRole(user!.role);

  const [activeMenu, setActiveMenu] = useState(roleMenus[role][0].label);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setActiveMenu(roleMenus[role][0].label);
    setMobileMenuOpen(false);
  }, [role]);

  const navigation = roleMenus[role];

  const pageTitle =
    activeMenu === 'Overview' || activeMenu === 'My Dashboard'
      ? `${role} dashboard`
      : activeMenu;

  return (
    <AppLayout
      role={role}
      navigation={navigation}
      activeMenu={activeMenu}
      pageTitle={pageTitle}
      mobileMenuOpen={mobileMenuOpen}
      onMenuSelect={setActiveMenu}
      onOpenMenu={() => setMobileMenuOpen(true)}
      onCloseMenu={() => setMobileMenuOpen(false)}
    >
      {role === 'Citizen' && activeMenu === 'Report Emergency' ? (
        <CitizenReportPage />
      ) : role === 'Citizen' && activeMenu === 'My Reports' ? (
        <CitizenTrackingPage />
      ) : (
        <DashboardPage role={role} onMenuSelect={setActiveMenu} />
      )}
    </AppLayout>
  );
}

function LoginRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return <LoginPage />;
}

function RegisterRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return <RegisterPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/register" element={<RegisterRoute />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
