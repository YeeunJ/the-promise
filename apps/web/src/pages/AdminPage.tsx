import { useState } from 'react';
import { ADMIN_TOKEN_KEY } from '../lib/constants';
import { useToast } from '../hooks/useToast';
import AdminLoginForm from '../components/AdminLoginForm';
import type { AdminSection } from '../components/admin/SectionTabs';
import { AdminTopNav } from '../components/admin/AdminTopNav';
import { ReservationsSection } from '../components/admin/ReservationsSection';
import { TeamsSection } from '../components/admin/teams/TeamsSection';
import { BuildingsSection } from '../components/admin/buildings/BuildingsSection';
import { SpacesSection } from '../components/admin/spaces/SpacesSection';
import { Toast } from '../components/ui/Toast';

function AdminPage(): JSX.Element {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(ADMIN_TOKEN_KEY),
  );
  const [isLoggedIn, setIsLoggedIn] = useState(() => token !== null);
  const [section, setSection] = useState<AdminSection>('reservations');

  const { toasts, showToast, removeToast } = useToast();

  function handleLoginSuccess(): void {
    setToken(localStorage.getItem(ADMIN_TOKEN_KEY));
    setIsLoggedIn(true);
  }

  function handleLogout(): void {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(null);
    setIsLoggedIn(false);
    setSection('reservations');
  }

  if (!isLoggedIn || token === null) {
    return <AdminLoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-canvas">
      <AdminTopNav
        section={section}
        onSectionChange={setSection}
        onLogout={handleLogout}
      />

      <main className="max-w-[1920px] mx-auto px-10 py-8">
        {section === 'reservations' && (
          <ReservationsSection authToken={token} showToast={showToast} />
        )}
        {section === 'teams' && (
          <TeamsSection authToken={token} showToast={showToast} />
        )}
        {section === 'buildings' && (
          <BuildingsSection authToken={token} showToast={showToast} />
        )}
        {section === 'spaces' && (
          <SpacesSection authToken={token} showToast={showToast} />
        )}
      </main>

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default AdminPage;
