import React from 'react';
import { motion } from 'motion/react';
import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  Code2,
  LayoutGrid,
  LogOut,
  Radio,
  Rocket,
  Settings,
  ShieldCheck,
  Trophy,
  User,
  Users,
  X,
} from 'lucide-react';
import { useArgon } from '../context/ArgonContext';
import { NavTab } from '../types';

export const PRIMARY_NAV_ITEMS: {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'learning-path', label: 'Learning Path', icon: BookOpen },
  { id: 'live-sessions', label: 'Live Sessions', icon: Radio },
  { id: 'projects', label: 'Projects', icon: Code2 },
  { id: 'teams', label: 'Teams', icon: Users },
  { id: 'challenges', label: 'Challenges', icon: Trophy },
  { id: 'hackathon', label: 'Hackathon', icon: Rocket },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'leaderboard', label: 'Leaderboard', icon: BarChart3 },
  { id: 'certificates', label: 'Certificates & Badges', icon: Award },
];

export const UTILITY_NAV_ITEMS: {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
}[] = [
  { id: 'admin', label: 'Admin Panel', icon: ShieldCheck },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, isAdmin, logoutMember, themeMode, materialPalette } = useArgon();
  const isMaterial = themeMode === 'google-material';

  const visibleUtilityItems = UTILITY_NAV_ITEMS.filter((item) => item.id !== 'admin' || isAdmin);

  const handleSelect = (id: NavTab) => {
    setActiveTab(id);
    onCloseMobile();
  };

  const renderRailButton = (item: {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <div key={item.id} className="relative group flex justify-center">
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => handleSelect(item.id)}
          aria-label={item.label}
          aria-current={isActive ? 'page' : undefined}
          className={`w-11 h-11 flex items-center justify-center transition-all duration-150 cursor-pointer ${
            isMaterial ? 'rounded-2xl' : 'rounded-[13px]'
          }`}
          style={{
            backgroundColor: isActive
              ? isMaterial
                ? materialPalette.primaryContainer
                : '#F95C4B'
              : 'transparent',
            color: isActive
              ? isMaterial
                ? materialPalette.onPrimaryContainer
                : '#F6F4F1'
              : isMaterial
              ? materialPalette.onSurfaceVariant
              : '#E4DED2',
          }}
        >
          <Icon size={20} strokeWidth={isActive ? 2.2 : 1.75} />
        </motion.button>

        {/* Hover Tooltip Pill */}
        <span
          role="tooltip"
          className="pointer-events-none opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-150 absolute left-[58px] top-1/2 -translate-y-1/2 z-50 px-3 py-1.5 rounded-[10px] text-xs font-semibold whitespace-nowrap shadow-md"
          style={{
            backgroundColor: isMaterial ? materialPalette.onSurface : '#000000',
            color: '#F6F4F1',
            border: isMaterial ? 'none' : '1px solid #E4DED2',
          }}
        >
          {item.label}
        </span>
      </div>
    );
  };

  const allMobileItems = [...PRIMARY_NAV_ITEMS, ...visibleUtilityItems];

  return (
    <>
      {/* EXACT SLIM BLACK ICON RAIL SIDEBAR */}
      <aside
        className="hidden lg:flex fixed top-0 left-0 bottom-0 w-[76px] z-30 flex-col items-center justify-between py-5 select-none"
        style={{
          backgroundColor: isMaterial ? materialPalette.surface : '#000000',
        }}
        aria-label="Primary sidebar navigation"
      >
        {/* Top Primary Icon Group */}
        <nav className="flex flex-col items-center gap-1.5 w-full px-2">
          {PRIMARY_NAV_ITEMS.map(renderRailButton)}
        </nav>

        {/* Bottom Utility + 3D Map Launch Group */}
        <div className="flex flex-col items-center gap-1.5 w-full px-2 pt-3">
          <div
            className="w-7 h-px mb-1"
            style={{
              backgroundColor: isMaterial
                ? `${materialPalette.outlineVariant}88`
                : 'rgba(228,222,210,0.22)',
            }}
          />
          {visibleUtilityItems.map(renderRailButton)}

          {/* Bottom-most Sign Out Action */}
          <div className="relative group flex justify-center mt-1">
            <button
              type="button"
              onClick={logoutMember}
              aria-label="Sign Out"
              className="w-10 h-10 rounded-[12px] flex items-center justify-center transition-colors cursor-pointer hover:bg-white/10"
              style={{
                color: isMaterial ? materialPalette.primary : '#F95C4B',
              }}
            >
              <LogOut size={18} strokeWidth={1.9} />
            </button>
            <span
              role="tooltip"
              className="pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 absolute left-[58px] top-1/2 -translate-y-1/2 z-50 px-3 py-1.5 rounded-[10px] text-xs font-semibold whitespace-nowrap bg-[#000000] text-[#F6F4F1] border border-[#E4DED2] shadow-md"
            >
              Sign Out
            </span>
          </div>
        </div>
      </aside>

      {/* Mobile Black Rounded Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex p-3">
          <div
            className="fixed inset-0 bg-black/55 transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div
            className="relative w-[268px] max-w-[85vw] h-full z-10 rounded-[24px] p-4 flex flex-col justify-between overflow-hidden"
            style={{
              backgroundColor: isMaterial ? materialPalette.surfaceCard : '#000000',
              color: isMaterial ? materialPalette.onSurface : '#F6F4F1',
            }}
          >
            <div className="flex items-center justify-between px-2 pb-4 border-b border-[#E4DED2]/20">
              <div>
                <span className="text-lg font-extrabold tracking-tight text-[#F95C4B]">ARGON</span>
                <span className="block text-[11px] text-[#E4DED2]">AVCOE Tech Community</span>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-2 rounded-xl hover:bg-white/10 text-[#E4DED2]"
                aria-label="Close navigation menu"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-1">
              {allMobileItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[13px] text-[13.5px] font-semibold transition-colors cursor-pointer"
                    style={{
                      backgroundColor: isActive
                        ? isMaterial
                          ? materialPalette.primaryContainer
                          : '#F95C4B'
                        : 'transparent',
                      color: isActive
                        ? isMaterial
                          ? materialPalette.onPrimaryContainer
                          : '#F6F4F1'
                        : isMaterial
                        ? materialPalette.onSurfaceVariant
                        : '#E4DED2',
                    }}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-[#E4DED2]/20">
              <button
                type="button"
                onClick={() => {
                  onCloseMobile();
                  logoutMember();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[13px] text-[13.5px] font-bold text-[#F95C4B] hover:bg-white/10 transition-colors cursor-pointer"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
