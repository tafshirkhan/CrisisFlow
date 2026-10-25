import CitizenReportPage from './features/incidents/pages/CitizenReportPage';
import CitizenTrackingPage from './features/incidents/pages/CitizenTrackingPage';
import { useState } from 'react';
import type { Role } from './types/app.types';
import { roleMenus } from './constants/navigation';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './features/dashboard/pages/DashboardPage';


function App() {
  const [role, setRole] = useState<Role>('Dispatcher');
  const [activeMenu, setActiveMenu] = useState('Overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = roleMenus[role];

  const changeRole = (nextRole: Role) => {
    setRole(nextRole);
    setActiveMenu(roleMenus[nextRole][0].label);
    setMobileMenuOpen(false);
  };

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
    onRoleChange={changeRole}
    onMenuSelect={setActiveMenu}
    onOpenMenu={() => setMobileMenuOpen(true)}
    onCloseMenu={() => setMobileMenuOpen(false)}
  >
    {role === 'Citizen' && activeMenu === 'Report Emergency' ? (
      <CitizenReportPage />
    ) : role === 'Citizen' && activeMenu === 'My Reports' ? (
      <CitizenTrackingPage />
    ) : (

       <DashboardPage
          role={role}
          onMenuSelect={setActiveMenu}
        />
    )}
  </AppLayout>
);
}

export default App;
