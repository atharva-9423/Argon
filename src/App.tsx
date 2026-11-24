import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  Calendar,
  KeyRound,
  LayoutGrid,
  Menu,
  Palette,
  Rocket,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { ArgonProvider, useArgon } from './context/ArgonContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ToastSystem } from './components/ui/ToastSystem';
import { DashboardView } from './views/DashboardView';
import { LearningPathView } from './views/LearningPathView';
import { LiveSessionsView } from './views/LiveSessionsView';
import { ProjectsView } from './views/ProjectsView';
import { TeamsView } from './views/TeamsView';
import { ChallengesView } from './views/ChallengesView';
import { HackathonView } from './views/HackathonView';
import { EventsView } from './views/EventsView';
import { LeaderboardView } from './views/LeaderboardView';
import { CertificatesView } from './views/CertificatesView';
import { ProfileView } from './views/ProfileView';
import { SettingsView } from './views/SettingsView';
import { AdminView } from './views/AdminView';
import { LoginView } from './views/LoginView';

const MainShell: React.FC = () => {
  const {
    isAuthenticated,
    isAdmin,
    currentUser,
    changeCurrentMemberPassword,
    activeTab,
    setActiveTab,
    themeMode,
    materialMotion,
    materialPalette,
  } = useArgon();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // First-login password change prompt state
  const [dismissedPwdPromptForUser, setDismissedPwdPromptForUser] = useState<string | null>(null);
  const [curPwd, setCurPwd] = useState('');
  const [nextPwd, setNextPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [savingPwd, setSavingPwd] = useState(false);

  const isMaterial = themeMode === 'google-material';
  const useExpressiveSpring = isMaterial && materialMotion === 'expressive';

  if (!isAuthenticated) {
    return (
      <>
        <LoginView />
        <ToastSystem />
      </>
    );
  }

  const showFirstLoginModal = Boolean(
    currentUser?.mustChangePassword && dismissedPwdPromptForUser !== currentUser.id
  );

  const handleFirstLoginPasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    if (nextPwd !== confirmPwd) {
      setPwdError('New passwords do not match.');
      return;
    }
    setSavingPwd(true);
    try {
      const res = await changeCurrentMemberPassword(curPwd, nextPwd);
      if (!res.ok) {
        setPwdError(res.error || 'Could not update password.');
      } else {
        setCurPwd('');
        setNextPwd('');
        setConfirmPwd('');
      }
    } finally {
      setSavingPwd(false);
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'learning-path':
        return <LearningPathView />;
      case 'live-sessions':
        return <LiveSessionsView />;
      case 'projects':
        return <ProjectsView />;
      case 'teams':
        return <TeamsView />;
      case 'challenges':
        return <ChallengesView />;
      case 'hackathon':
        return <HackathonView />;
      case 'events':
        return <EventsView />;
      case 'leaderboard':
        return <LeaderboardView />;
      case 'certificates':
        return <CertificatesView />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      case 'admin':
        return isAdmin ? <AdminView /> : <DashboardView />;
    }
  };

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: isMaterial ? materialPalette.surface : '#000000',
      }}
    >
      <Sidebar mobileOpen={mobileNavOpen} onCloseMobile={() => setMobileNavOpen(false)} />

      {/* Outer Black Frame holding the Warm Paper (#F6F4F1) Rounded Canvas Container */}
      <div className="lg:pl-[76px] lg:py-3.5 lg:pr-3.5 min-h-screen flex flex-col">
        <div
          className={`flex-1 flex flex-col overflow-x-clip transition-all duration-300 ${
            isMaterial ? 'lg:rounded-[32px]' : 'bg-[#F6F4F1] lg:rounded-[28px]'
          }`}
          style={{
            backgroundColor: isMaterial ? materialPalette.surface : '#F6F4F1',
            color: isMaterial ? materialPalette.onSurface : '#000000',
          }}
        >
          <TopBar onOpenMobileNav={() => setMobileNavOpen(true)} />

          <main className="flex-1 px-3 sm:px-6 lg:px-8 pt-1.5 sm:pt-2 pb-24 lg:pb-8">
            <div className="max-w-[1320px] mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeTab}-${themeMode}`}
                  initial={
                    useExpressiveSpring
                      ? { opacity: 0, y: 18, scale: 0.975 }
                      : { opacity: 0, y: 8 }
                  }
                  animate={
                    useExpressiveSpring
                      ? { opacity: 1, y: 0, scale: 1 }
                      : { opacity: 1, y: 0 }
                  }
                  exit={
                    useExpressiveSpring
                      ? { opacity: 0, y: -12, scale: 0.985 }
                      : { opacity: 0, y: -6 }
                  }
                  transition={
                    useExpressiveSpring
                      ? { type: 'spring', stiffness: 360, damping: 24, mass: 0.85 }
                      : { duration: 0.16, ease: [0.16, 1, 0.3, 1] }
                  }
                >
                  {renderActiveView()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>

          <footer
            className="hidden sm:block px-5 sm:px-8 py-4 mt-auto"
            style={{
              borderTop: isMaterial
                ? `1px solid ${materialPalette.outlineVariant}55`
                : '1px solid #E4DED2',
            }}
          >
            <div className="max-w-[1320px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#55524C]">
              <p>ARGON | AVCOE Tech Community · Interactive Student Platform</p>
              <p>
                {isMaterial
                  ? `Material You Expressive · Seed ${materialPalette.seedHex.toUpperCase()}`
                  : 'AVCOE Technical Club & Hackathon Portal'}
              </p>
            </div>
          </footer>
        </div>
      </div>

      {/* Compact Fixed Mobile Bottom Navigation Bar (< lg) */}
      <nav
        aria-label="Mobile quick navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t-[1.5px] border-[#000000] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
        style={{
          backgroundColor: isMaterial ? materialPalette.surfaceCard : '#000000',
        }}
      >
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {[
            { id: 'dashboard' as const, label: 'Home', icon: LayoutGrid },
            { id: 'hackathon' as const, label: 'Hackathon', icon: Rocket },
            { id: 'events' as const, label: 'Events', icon: Calendar },
            isAdmin
              ? { id: 'admin' as const, label: 'Admin', icon: ShieldCheck }
              : { id: 'teams' as const, label: 'Team', icon: Users },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className="flex flex-col items-center justify-center py-1.5 rounded-[12px] transition-colors cursor-pointer"
                style={{
                  backgroundColor: active
                    ? isMaterial
                      ? materialPalette.primaryContainer
                      : '#F95C4B'
                    : 'transparent',
                  color: active
                    ? isMaterial
                      ? materialPalette.onPrimaryContainer
                      : '#F6F4F1'
                    : isMaterial
                    ? materialPalette.onSurfaceVariant
                    : '#E4DED2',
                }}
              >
                <Icon size={18} strokeWidth={active ? 2.3 : 1.8} />
                <span className="text-[10px] font-bold mt-0.5 leading-none">{item.label}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="flex flex-col items-center justify-center py-1.5 rounded-[12px] transition-colors cursor-pointer"
            style={{
              color: isMaterial ? materialPalette.onSurfaceVariant : '#E4DED2',
            }}
          >
            <Menu size={18} strokeWidth={1.9} />
            <span className="text-[10px] font-bold mt-0.5 leading-none">More</span>
          </button>
        </div>
      </nav>

      {/* First-Login Default Password Update Modal */}
      {showFirstLoginModal && currentUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="first-login-pwd-title"
        >
          <div className="w-full max-w-md rounded-[22px] bg-[#F6F4F1] border-[1.5px] border-[#000000] overflow-hidden">
            <div className="px-6 py-4 bg-[#000000] text-[#F6F4F1] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[10px] bg-[#F95C4B] text-[#F6F4F1] flex items-center justify-center shrink-0">
                  <KeyRound size={16} />
                </div>
                <div>
                  <h3 id="first-login-pwd-title" className="text-sm font-bold">
                    Update Your Default Password
                  </h3>
                  <p className="text-[11px] text-[#E4DED2]">
                    Replace your admin-issued temporary password with a private one.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDismissedPwdPromptForUser(currentUser.id)}
                aria-label="Remind me later"
                className="p-1.5 rounded-[8px] bg-[#1F1E1C] text-[#F6F4F1] hover:bg-[#F95C4B] transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleFirstLoginPasswordUpdate} className="p-6 space-y-3.5">
              {pwdError && (
                <div className="p-3 rounded-[12px] bg-[#F95C4B] border border-[#000000] text-[#F6F4F1] text-xs font-semibold flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{pwdError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#000000] mb-1">
                  Current Default Password
                </label>
                <input
                  required
                  type="password"
                  value={curPwd}
                  onChange={(e) => setCurPwd(e.target.value)}
                  placeholder="Enter your temporary password"
                  className="w-full h-10 px-3 rounded-[10px] bg-[#E4DED2] border border-[#000000] text-xs text-[#000000] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#000000] mb-1">
                  New Personal Password (min 8 chars)
                </label>
                <input
                  required
                  minLength={8}
                  type="password"
                  value={nextPwd}
                  onChange={(e) => setNextPwd(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full h-10 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#000000] mb-1">
                  Confirm New Password
                </label>
                <input
                  required
                  minLength={8}
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full h-10 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDismissedPwdPromptForUser(currentUser.id)}
                  className="px-4 py-2 rounded-[10px] bg-[#E4DED2] border border-[#000000] text-[#000000] text-xs font-bold cursor-pointer"
                >
                  Later
                </button>
                <button
                  type="submit"
                  disabled={savingPwd}
                  className="px-4 py-2 rounded-[10px] bg-[#F95C4B] border border-[#000000] text-[#F6F4F1] text-xs font-bold cursor-pointer hover:bg-[#E64C3B] disabled:opacity-60"
                >
                  {savingPwd ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Material 3 Expressive Floating Action Button (Only when Material theme is active) */}
      <AnimatePresence>
        {isMaterial && activeTab !== 'settings' && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.6, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 24 }}
            whileHover={{ scale: 1.06, borderRadius: '20px' }}
            whileTap={{ scale: 0.93, borderRadius: '14px' }}
            transition={{ type: 'spring', stiffness: 420, damping: 22 }}
            onClick={() => setActiveTab('settings')}
            className="fixed bottom-6 left-6 lg:left-auto lg:right-8 z-40 inline-flex items-center gap-2.5 px-5 py-3.5 text-xs font-bold shadow-lg cursor-pointer"
            style={{
              backgroundColor: materialPalette.primaryContainer,
              color: materialPalette.onPrimaryContainer,
              borderRadius: '24px',
              boxShadow: `0 12px 26px -8px ${materialPalette.primary}55`,
            }}
            title="Customize Material You Dynamic Colors"
          >
            <Palette size={17} />
            <span>Dynamic Colors</span>
          </motion.button>
        )}
      </AnimatePresence>

      <ToastSystem />
    </div>
  );
};

export default function App() {
  return (
    <ArgonProvider>
      <MainShell />
    </ArgonProvider>
  );
}
