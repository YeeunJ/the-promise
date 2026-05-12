import { useState } from 'react';
import { ADMIN_TOKEN_KEY } from '../lib/constants';
import { useToast } from '../hooks/useToast';
import AdminLoginForm from '../components/AdminLoginForm';
import { SectionTabs, type AdminSection } from '../components/admin/SectionTabs';
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
    <div className="min-h-screen bg-brand-cream">
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-[1920px] mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-black">가나안교회 관리자</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl px-4 py-2 text-sm font-medium border-2 border-brand-secondary text-brand-secondary hover:bg-brand-secondary hover:text-white transition-colors duration-200"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="max-w-[1920px] mx-auto px-6 py-6">
        <SectionTabs active={section} onChange={setSection} />

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
