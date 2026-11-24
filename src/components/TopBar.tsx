import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  BookOpen,
  LogOut,
  Menu,
  Rocket,
  Search,
  Settings,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react';
import { getLevelInfo, useArgon } from '../context/ArgonContext';
import { NavTab } from '../types';

const PAGE_TITLES: Record<NavTab, string> = {
  dashboard: 'Student Dashboard',
  'learning-path': 'Learning Adventure Map',
  'live-sessions': 'Hybrid Training & Sessions',
  projects: 'Projects Showcase',
  teams: 'Team Workspace',
  challenges: 'Coding Challenges',
  hackathon: 'Hackathon Hub',
  events: 'Events & Hackathons',
  leaderboard: 'Community Leaderboard',
  certificates: 'Certificates & Badges',
  profile: 'Student Profile',
  settings: 'Settings & Themes',
  admin: 'Admin Panel',
};

interface TopBarProps {
  onOpenMobileNav: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileNav }) => {
  const {
    activeTab,
    setActiveTab,
    setSelectedIslandId,
    profile,
    currentUser,
    isAdmin,
    logoutMember,
    islands,
    sessions,
    events,
    projects,
    challenges,
    notifications,
    markAllNotificationsRead,
    markNotificationRead,
    themeMode,
    materialPalette,
  } = useArgon();

  const isMaterial = themeMode === 'google-material';

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const dropdownContainerRef = useRef<HTMLDivElement | null>(null);

  const levelInfo = getLevelInfo(profile.xp);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchFocused(false);
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(e.target as Node)
      ) {
        setNotifOpen(false);
        setProfileOpen(false);
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results: { id: string; title: string; subtitle: string; tab: NavTab; islandId?: string }[] = [];

    islands.forEach((isl) => {
      if (isl.name.toLowerCase().includes(q) || isl.subtitle.toLowerCase().includes(q)) {
        results.push({
          id: isl.id,
          title: `Level ${isl.level}: ${isl.name}`,
          subtitle: 'Learning Path Island',
          tab: 'learning-path',
          islandId: isl.id,
        });
      }
    });
    sessions.forEach((s) => {
      if (s.title.toLowerCase().includes(q) || s.instructor.toLowerCase().includes(q)) {
        results.push({
          id: s.id,
          title: s.title,
          subtitle: `${s.mode} Session · ${s.dateLabel}`,
          tab: 'live-sessions',
        });
      }
    });
    events.forEach((ev) => {
      if (ev.title.toLowerCase().includes(q) || ev.category.toLowerCase().includes(q)) {
        results.push({
          id: ev.id,
          title: ev.title,
          subtitle: `${ev.category} · ${ev.dateDisplay}`,
          tab: 'hackathon',
        });
      }
    });
    projects.forEach((p) => {
      if (p.title.toLowerCase().includes(q) || p.teamName.toLowerCase().includes(q)) {
        results.push({
          id: p.id,
          title: p.title,
          subtitle: `Project by ${p.teamName}`,
          tab: 'projects',
        });
      }
    });
    challenges.forEach((c) => {
      if (c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)) {
        results.push({
          id: c.id,
          title: c.title,
          subtitle: `${c.category} · +${c.xp} XP`,
          tab: 'challenges',
        });
      }
    });

    return results.slice(0, 6);
  }, [searchQuery, islands, sessions, events, projects, challenges]);

  const handleJump = (tab: NavTab, islandId?: string) => {
    if (islandId) setSelectedIslandId(islandId);
    setActiveTab(tab);
    setSearchQuery('');
    setSearchFocused(false);
  };

  return (
    <header
      ref={dropdownContainerRef}
      className="sticky top-0 z-20 px-3 sm:px-8 py-2.5 sm:pt-5 sm:pb-3 transition-colors duration-200 border-b border-black/10 lg:border-b-0"
      style={{
        backgroundColor: isMaterial ? `${materialPalette.surface}F2` : 'rgba(246, 244, 241, 0.96)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="max-w-[1320px] mx-auto flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Left: Compact brand & current section header */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="lg:hidden w-9 h-9 rounded-[11px] bg-[#E4DED2] border border-[#000000] text-[#000000] flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu size={17} />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="flex items-baseline gap-1.5 text-left cursor-pointer truncate min-w-0"
          >
            <span className="hidden sm:inline text-sm font-medium text-[#57534C]">Welcome to</span>
            <span
              className="text-[17px] sm:text-[18px] font-extrabold tracking-[-0.03em] shrink-0"
              style={{ color: isMaterial ? materialPalette.primary : '#F95C4B' }}
            >
              ARGON
            </span>
            {activeTab !== 'dashboard' && (
              <span className="text-xs font-semibold text-[#57534C] truncate">
                / {PAGE_TITLES[activeTab]}
              </span>
            )}
          </button>
        </div>

        {/* Right: Search Input with Coral Square Button + Outlined Bell + Profile */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <div className="relative hidden md:block w-[260px] xl:w-[320px]">
            <div
              className="flex items-center h-11 rounded-[14px] pl-4 pr-1.5 transition-colors"
              style={{
                backgroundColor: isMaterial ? materialPalette.surfaceCard : '#F6F4F1',
                border: isMaterial
                  ? `1px solid ${materialPalette.outlineVariant}`
                  : '1.25px solid #000000',
              }}
            >
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full bg-transparent text-[13.5px] text-[#000000] placeholder:text-[#6E6960] focus:outline-none"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 text-[#57534C] hover:text-[#000000] cursor-pointer"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => searchInputRef.current?.focus()}
                aria-label="Search ARGON"
                className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[#F6F4F1] shrink-0 transition-transform active:scale-95 cursor-pointer"
                style={{
                  backgroundColor: isMaterial ? materialPalette.primary : '#F95C4B',
                }}
              >
                <Search size={15} strokeWidth={2.4} />
              </button>
            </div>

            {searchFocused && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 mt-2 argon-card p-2 z-40 shadow-xl">
                {searchResults.length === 0 ? (
                  <p className="text-xs text-[#57534C] px-3 py-4 text-center">
                    No results found for "{searchQuery}".
                  </p>
                ) : (
                  <ul className="divide-y divide-black/15">
                    {searchResults.map((res) => (
                      <li key={res.id}>
                        <button
                          type="button"
                          onClick={() => handleJump(res.tab, res.islandId)}
                          className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[#F6F4F1] transition-colors flex items-center justify-between gap-2 cursor-pointer"
                        >
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-[#000000] truncate">
                              {res.title}
                            </p>
                            <p className="text-[11px] text-[#57534C] truncate">{res.subtitle}</p>
                          </div>
                          <span className="text-[11px] font-bold text-[#F95C4B] shrink-0">
                            Open
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotifOpen((o) => !o);
                setProfileOpen(false);
              }}
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-[#000000] hover:bg-[#E4DED2] transition-colors cursor-pointer"
              style={{
                backgroundColor: isMaterial ? materialPalette.surfaceCard : '#F6F4F1',
                border: isMaterial
                  ? `1px solid ${materialPalette.outlineVariant}`
                  : '1.25px solid #000000',
              }}
              aria-label="Open notifications"
            >
              <Bell size={17} strokeWidth={1.9} />
              {unreadCount > 0 && (
                <span
                  className="absolute top-1.5 right-2 w-2.5 h-2.5 rounded-full border-2 border-[#F6F4F1]"
                  style={{
                    backgroundColor: isMaterial ? materialPalette.primary : '#F95C4B',
                  }}
                />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 argon-card p-3 z-40 shadow-xl">
                <div className="flex items-center justify-between px-2 pb-2.5 border-b border-black/15">
                  <span className="text-sm font-bold text-[#000000]">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-xs font-bold text-[#F95C4B] hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="mt-2 space-y-1 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-[#57534C] text-center py-6">
                      No club announcements yet.
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          markNotificationRead(n.id);
                          setActiveTab(n.targetTab);
                          setNotifOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition-colors cursor-pointer ${
                          n.read
                            ? 'hover:bg-[#F6F4F1]/65'
                            : 'bg-[#F6F4F1] border border-black/15 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-[#000000]">{n.title}</span>
                          <span className="text-[11px] text-[#57534C] shrink-0">{n.timeAgo}</span>
                        </div>
                        <p className="text-xs text-[#3C3934] mt-0.5 leading-relaxed">{n.detail}</p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((o) => !o);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border-[1.25px] border-[#000000] shrink-0"
              />
              <div className="hidden sm:block leading-tight">
                <span className="block text-[13.5px] font-bold text-[#000000] whitespace-nowrap">
                  {profile.name}
                </span>
                <span className="block text-[11px] text-[#57534C] whitespace-nowrap">
                  {currentUser?.role || 'Member'} · Lv.{levelInfo.level}
                </span>
              </div>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 argon-card p-2 z-40 shadow-xl">
                <div className="px-3 py-2.5 border-b border-black/15">
                  <p className="text-sm font-bold text-[#000000] truncate">{profile.name}</p>
                  <p className="text-[11px] text-[#4C4841] truncate">{profile.email}</p>
                  <p className="text-[11px] text-[#4C4841] mt-0.5">
                    {profile.branch} · {currentUser?.teamName || 'AVCOE'}
                  </p>
                  <div className="mt-2.5">
                    <div className="flex justify-between text-[11px] font-semibold text-[#4C4841] mb-1">
                      <span>Level {levelInfo.level} · {levelInfo.title}</span>
                      <span className="font-mono text-[#000000]">{profile.xp.toLocaleString()} XP</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-black/15 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#F95C4B]"
                        style={{ width: `${levelInfo.pct}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-1.5 space-y-0.5">
                  {[
                    ...(isAdmin
                      ? [{ label: 'Admin Panel', tab: 'admin' as NavTab, icon: ShieldCheck }]
                      : []),
                    { label: 'Student Profile', tab: 'profile' as NavTab, icon: User },
                    { label: 'Hackathon Hub', tab: 'hackathon' as NavTab, icon: Rocket },
                    { label: '3D Learning Adventure', tab: 'learning-path' as NavTab, icon: BookOpen },
                    { label: 'Team Workspace', tab: 'teams' as NavTab, icon: Users },
                    { label: 'Settings & Themes', tab: 'settings' as NavTab, icon: Settings },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.tab);
                          setProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#000000] hover:bg-[#F6F4F1] transition-colors cursor-pointer"
                      >
                        <Icon size={14} className="text-[#000000]" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}

                  <div className="pt-1 mt-1 border-t border-black/15">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        logoutMember();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-[#F95C4B] hover:bg-[#F6F4F1] transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
