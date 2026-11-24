import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { onValue, ref, set } from 'firebase/database';
import { rtdb } from '../firebase-config.js';
import {
  INITIAL_BADGES,
  INITIAL_CANDIDATES,
  INITIAL_CERTIFICATES,
  INITIAL_CHALLENGES,
  INITIAL_EVENTS,
  INITIAL_ISLANDS,
  INITIAL_LEADERBOARD_STUDENTS,
  INITIAL_LEADERBOARD_TEAMS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PROFILE,
  INITIAL_PROJECTS,
  INITIAL_SESSIONS,
  INITIAL_TEAM,
} from '../data/mockData';
import {
  BadgeItem,
  CandidateStudent,
  CertificateItem,
  ChallengeItem,
  EventItem,
  EventRegistration,
  LeaderboardStudent,
  LeaderboardTeam,
  LearningIsland,
  LiveSession,
  ManagedTeam,
  ManagedUser,
  NavTab,
  NotificationItem,
  ProjectItem,
  StudentProfile,
  TeamWorkspace,
  ToastReward,
} from '../types';
import { generateDefaultPassword } from '../utils/gmailAuth';
import {
  constantTimeEqual,
  hashMemberPassword,
  isValidEmail,
  normalizeEmail,
  validateNewPassword,
  verifyMemberPassword,
} from '../utils/memberAuth';

import {
  applyMaterialCssVariables,
  buildMaterialPalette,
  MATERIAL_PRESET_SEEDS,
  MaterialDynamicPalette,
  MaterialMotionStyle,
  ThemeMode,
} from '../utils/materialTheme';

const STORAGE_KEY = 'argon_avcoe_live_state_v3';
const RTDB_ROOT_PATH = 'argonClub';
const CLEAN_SCHEMA_VERSION = 2;

const LEGACY_DEMO_USER_IDS = new Set(['stu-1', 'stu-2', 'stu-3', 'stu-4', 'stu-5', 'stu-6', 'stu-7']);
const LEGACY_DEMO_TEAM_IDS = new Set([
  'team-byteforge',
  'team-nullpointers',
  'team-codecrafters',
  'team-hackstreet',
  'team-voxelsquad',
]);
const LEGACY_DEMO_EVENT_IDS = new Set(['ev-1', 'ev-2', 'ev-3', 'ev-4']);
const LEGACY_DEMO_SESSION_IDS = new Set(['sess-1', 'sess-2', 'sess-3', 'sess-4', 'sess-5', 'sess-6']);
const LEGACY_DEMO_PROJECT_IDS = new Set(['proj-1', 'proj-2', 'proj-3', 'proj-4']);
const LEGACY_DEMO_CANDIDATE_IDS = new Set(['cand-1', 'cand-2', 'cand-3', 'cand-4']);
const LEGACY_DEMO_CHALLENGE_IDS = new Set(['ch-1', 'ch-2', 'ch-3', 'ch-4']);
const LEGACY_DEMO_BADGE_IDS = new Set([
  'badge-1',
  'badge-2',
  'badge-3',
  'badge-4',
  'badge-5',
  'badge-6',
  'badge-7',
  'badge-8',
]);
const LEGACY_DEMO_CERT_IDS = new Set(['cert-1', 'cert-2', 'cert-3']);
const LEGACY_DEMO_NOTIF_IDS = new Set(['notif-1', 'notif-2', 'notif-3']);

function toRtdbPayload(s: PersistedState) {
  return JSON.parse(
    JSON.stringify({
      cleanDataSchemaVersion: CLEAN_SCHEMA_VERSION,
      profile: s.profile,
      islands: s.islands,
      sessions: s.sessions,
      projects: s.projects,
      team: s.team,
      managedTeams: s.managedTeams,
      managedUsers: s.managedUsers,
      candidates: s.candidates,
      challenges: s.challenges,
      events: s.events,
      eventRegistrations: s.eventRegistrations,
      badges: s.badges,
      certificates: s.certificates,
      notifications: s.notifications,
      totalCommunityStudents: s.totalCommunityStudents,
      totalTeamXpBase: s.totalTeamXpBase,
      totalProjectsBase: s.totalProjectsBase,
      themeMode: s.themeMode,
      materialSeedHex: s.materialSeedHex,
      materialMotion: s.materialMotion,
    })
  );
}

function purgeLegacyDemoRecords(s: PersistedState): PersistedState {
  const realUsers = s.managedUsers.filter(
    (u) => !LEGACY_DEMO_USER_IDS.has(u.id) || (u.role === 'Admin' && Boolean(u.passwordHash))
  );
  const realTeams = s.managedTeams.filter((t) => !LEGACY_DEMO_TEAM_IDS.has(t.id));
  const realEvents = s.events.filter((e) => !LEGACY_DEMO_EVENT_IDS.has(e.id));
  const realEventIds = new Set(realEvents.map((e) => e.id));
  const realUserIds = new Set(realUsers.map((u) => u.id));
  const realTeamIds = new Set(realTeams.map((t) => t.id));

  const cleanedUsers = realUsers.map((u) =>
    u.teamId && !realTeamIds.has(u.teamId) ? { ...u, teamId: '', teamName: 'Unassigned' } : u
  );

  const realRegistrations = s.eventRegistrations.filter(
    (r) =>
      !r.id.startsWith('reg-init-') &&
      realEventIds.has(r.eventId) &&
      realUserIds.has(r.userId)
  );

  const isLegacyProfile =
    s.profile.email === 'aditya.patil@avcoe.edu.in' || s.profile.name === 'Aditya Patil';

  return {
    ...s,
    profile: isLegacyProfile ? INITIAL_PROFILE : s.profile,
    islands: INITIAL_ISLANDS,
    sessions: s.sessions.filter((x) => !LEGACY_DEMO_SESSION_IDS.has(x.id)),
    projects: s.projects.filter((x) => !LEGACY_DEMO_PROJECT_IDS.has(x.id)),
    team: LEGACY_DEMO_TEAM_IDS.has(s.team.id) ? INITIAL_TEAM : s.team,
    managedTeams: realTeams,
    managedUsers: cleanedUsers,
    candidates: s.candidates.filter((x) => !LEGACY_DEMO_CANDIDATE_IDS.has(x.id)),
    challenges: s.challenges.filter((x) => !LEGACY_DEMO_CHALLENGE_IDS.has(x.id)),
    events: realEvents,
    eventRegistrations: realRegistrations,
    badges: s.badges.filter((x) => !LEGACY_DEMO_BADGE_IDS.has(x.id)),
    certificates: s.certificates.filter((x) => !LEGACY_DEMO_CERT_IDS.has(x.id)),
    notifications: s.notifications.filter((x) => !LEGACY_DEMO_NOTIF_IDS.has(x.id)),
    totalCommunityStudents: cleanedUsers.length,
    totalTeamXpBase: cleanedUsers.reduce((acc, u) => acc + (u.allTimeXp || 0), 0),
    totalProjectsBase: s.projects.filter((x) => !LEGACY_DEMO_PROJECT_IDS.has(x.id)).length,
  };
}

function asArray<T>(value: unknown, fallback: T[]): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') {
    return Object.values(value as Record<string, T>);
  }
  return fallback;
}

function mergeRtdbSnapshot(prev: PersistedState, remote: Record<string, unknown>): PersistedState {
  const remoteProfile = (remote.profile as Partial<StudentProfile> | undefined) ?? {};
  const remoteTeam = (remote.team as Partial<TeamWorkspace> | undefined) ?? {};
  const rawIslands = asArray<LearningIsland>(remote.islands, prev.islands).map((isl, idx) => ({
    ...prev.islands[idx],
    ...isl,
    checkpoints: asArray<string>(isl.checkpoints, prev.islands[idx]?.checkpoints ?? []),
    lessons: asArray(isl.lessons, prev.islands[idx]?.lessons ?? []),
  }));
  const rawProjects = asArray<ProjectItem>(remote.projects, []).map((p) => ({
    ...p,
    techStack: asArray<string>(p.techStack, []),
  }));

  return {
    ...prev,
    profile: {
      ...prev.profile,
      ...remoteProfile,
      skills: asArray<string>(remoteProfile.skills, prev.profile.skills),
      interests: asArray<string>(remoteProfile.interests, prev.profile.interests),
    },
    islands: rawIslands.length > 0 ? rawIslands : prev.islands,
    sessions: remote.sessions !== undefined ? asArray<LiveSession>(remote.sessions, []) : prev.sessions,
    projects: remote.projects !== undefined ? rawProjects : prev.projects,
    team: {
      ...prev.team,
      ...remoteTeam,
      members:
        remoteTeam.members !== undefined
          ? asArray(remoteTeam.members, prev.team.members).map((m) => ({
              ...m,
              skills: asArray<string>(m.skills, []),
            }))
          : prev.team.members,
      milestones:
        remoteTeam.milestones !== undefined
          ? asArray(remoteTeam.milestones, prev.team.milestones)
          : prev.team.milestones,
    },
    managedTeams:
      remote.managedTeams !== undefined
        ? asArray<ManagedTeam>(remote.managedTeams, [])
        : prev.managedTeams,
    managedUsers:
      remote.managedUsers !== undefined
        ? asArray<ManagedUser>(remote.managedUsers, [])
        : prev.managedUsers,
    candidates:
      remote.candidates !== undefined
        ? asArray<CandidateStudent>(remote.candidates, prev.candidates).map((c) => ({
            ...c,
            skills: asArray<string>(c.skills, []),
            interests: asArray<string>(c.interests, []),
          }))
        : prev.candidates,
    challenges:
      remote.challenges !== undefined
        ? asArray<ChallengeItem>(remote.challenges, prev.challenges).map((ch) => ({
            ...ch,
            options: asArray<string>(ch.options, []),
          }))
        : prev.challenges,
    events: remote.events !== undefined ? asArray<EventItem>(remote.events, []) : prev.events,
    eventRegistrations:
      remote.eventRegistrations !== undefined
        ? asArray<EventRegistration>(remote.eventRegistrations, [])
        : prev.eventRegistrations,
    badges: remote.badges !== undefined ? asArray<BadgeItem>(remote.badges, []) : prev.badges,
    certificates:
      remote.certificates !== undefined
        ? asArray<CertificateItem>(remote.certificates, [])
        : prev.certificates,
    notifications:
      remote.notifications !== undefined
        ? asArray<NotificationItem>(remote.notifications, [])
        : prev.notifications,
    totalCommunityStudents:
      typeof remote.totalCommunityStudents === 'number'
        ? remote.totalCommunityStudents
        : prev.totalCommunityStudents,
    totalTeamXpBase:
      typeof remote.totalTeamXpBase === 'number' ? remote.totalTeamXpBase : prev.totalTeamXpBase,
    totalProjectsBase:
      typeof remote.totalProjectsBase === 'number'
        ? remote.totalProjectsBase
        : prev.totalProjectsBase,
    themeMode:
      remote.themeMode === 'argon-classic' || remote.themeMode === 'google-material'
        ? remote.themeMode
        : prev.themeMode,
    materialSeedHex:
      typeof remote.materialSeedHex === 'string' && remote.materialSeedHex.startsWith('#')
        ? remote.materialSeedHex
        : prev.materialSeedHex,
    materialMotion:
      remote.materialMotion === 'expressive' || remote.materialMotion === 'standard'
        ? remote.materialMotion
        : prev.materialMotion,
  };
}

interface PersistedState {
  profile: StudentProfile;
  islands: LearningIsland[];
  sessions: LiveSession[];
  projects: ProjectItem[];
  team: TeamWorkspace;
  managedTeams: ManagedTeam[];
  managedUsers: ManagedUser[];
  candidates: CandidateStudent[];
  challenges: ChallengeItem[];
  events: EventItem[];
  eventRegistrations: EventRegistration[];
  badges: BadgeItem[];
  certificates: CertificateItem[];
  notifications: NotificationItem[];
  totalCommunityStudents: number;
  totalTeamXpBase: number;
  totalProjectsBase: number;
  themeMode: ThemeMode;
  materialSeedHex: string;
  materialMotion: MaterialMotionStyle;
}

const INITIAL_MANAGED_TEAMS: ManagedTeam[] = [];
const INITIAL_MANAGED_USERS: ManagedUser[] = [];
const INITIAL_EVENT_REGISTRATIONS: EventRegistration[] = [];

const DEFAULT_PERSISTED: PersistedState = {
  profile: INITIAL_PROFILE,
  islands: INITIAL_ISLANDS,
  sessions: INITIAL_SESSIONS,
  projects: INITIAL_PROJECTS,
  team: INITIAL_TEAM,
  managedTeams: INITIAL_MANAGED_TEAMS,
  managedUsers: INITIAL_MANAGED_USERS,
  candidates: INITIAL_CANDIDATES,
  challenges: INITIAL_CHALLENGES,
  events: INITIAL_EVENTS,
  eventRegistrations: INITIAL_EVENT_REGISTRATIONS,
  badges: INITIAL_BADGES,
  certificates: INITIAL_CERTIFICATES,
  notifications: INITIAL_NOTIFICATIONS,
  totalCommunityStudents: 0,
  totalTeamXpBase: 0,
  totalProjectsBase: 0,
  themeMode: 'argon-classic',
  materialSeedHex: MATERIAL_PRESET_SEEDS[0].seedHex,
  materialMotion: 'expressive',
};

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PERSISTED;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      ...DEFAULT_PERSISTED,
      ...parsed,
      profile: { ...INITIAL_PROFILE, ...(parsed.profile ?? {}) },
      managedTeams: Array.isArray(parsed.managedTeams) ? parsed.managedTeams : [],
      managedUsers: Array.isArray(parsed.managedUsers) ? parsed.managedUsers : [],
      eventRegistrations: Array.isArray(parsed.eventRegistrations) ? parsed.eventRegistrations : [],
    };
  } catch {
    return DEFAULT_PERSISTED;
  }
}

export function getLevelInfo(xp: number) {
  const levelStep = 500;
  const level = Math.floor(xp / levelStep) + 1;
  const currentLevelXp = xp % levelStep;
  const nextLevelThreshold = levelStep;
  const pct = Math.min(100, Math.round((currentLevelXp / nextLevelThreshold) * 100));
  const titles = [
    'Curious Explorer',
    'Syntax Scout',
    'Web Builder',
    'Git Navigator',
    'AI Apprentice',
    'Prototype Crafter',
    'Hackathon Finalist',
    'Systems Innovator',
    'ARGON Vanguard',
  ];
  const title = titles[Math.min(level - 1, titles.length - 1)];
  return { level, currentLevelXp, nextLevelThreshold, xpToNext: nextLevelThreshold - currentLevelXp, pct, title };
}

interface ArgonContextValue extends PersistedState {
  currentUser: ManagedUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  needsAdminSetup: boolean;
  rtdbReady: boolean;
  loginMember: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string; mustChangePassword?: boolean }>;
  registerMember: (input: {
    name: string;
    email: string;
    branch: string;
    year: string;
    teamId: string;
    password: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  claimInitialAdmin: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  changeCurrentMemberPassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ ok: boolean; error?: string }>;
  logoutMember: () => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  selectedIslandId: string;
  setSelectedIslandId: (id: string) => void;
  materialPalette: MaterialDynamicPalette;
  setThemeMode: (mode: ThemeMode) => void;
  setMaterialSeedHex: (hex: string) => void;
  setMaterialMotion: (motion: MaterialMotionStyle) => void;
  toasts: ToastReward[];
  dismissToast: (id: string) => void;
  leaderboardStudents: LeaderboardStudent[];
  leaderboardTeams: LeaderboardTeam[];
  readinessPct: number;
  upcomingSessionsCount: number;
  totalEarnedXpDisplay: number;
  projectsSubmittedDisplay: number;
  awardXp: (amount: number, reason: string) => void;
  completeLesson: (islandId: string, lessonId: string) => void;
  toggleSessionRegistration: (sessionId: string) => void;
  checkInSession: (sessionId: string, code: string) => boolean;
  markRecordingWatched: (sessionId: string) => void;
  toggleProjectUpvote: (projectId: string) => void;
  submitProject: (input: {
    title: string;
    track: ProjectItem['track'];
    description: string;
    techStack: string[];
    repoUrl: string;
    demoUrl: string;
  }) => void;
  toggleMilestone: (milestoneId: string) => void;
  updateMemberRole: (memberId: string, newRole: string) => void;
  inviteCandidate: (candidateId: string) => void;
  createTeam: (name: string, tagline: string, hackathonTarget: string) => void;
  completeChallenge: (challengeId: string) => void;
  toggleEventRegistration: (eventId: string) => void;
  isRegisteredForEvent: (eventId: string) => boolean;
  confirmEventRegistration: (eventId: string, trackPreference?: string) => void;
  cancelEventRegistration: (eventId: string) => void;
  adminRemoveEventRegistration: (registrationId: string) => void;
  adminBulkAssignTeam: (userIds: string[], teamId: string) => void;
  adminAutoDistributeTeams: (userIds: string[]) => void;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  updateProfile: (patch: Partial<StudentProfile>) => void;
  resetDemoData: () => void;
  adminCreateSession: (input: {
    title: string;
    mode: LiveSession['mode'];
    track: string;
    dateLabel: string;
    timeRange: string;
    venueOrLink: string;
    instructor: string;
    durationHrs: number;
    xpReward: number;
    checkInCode: string;
    seatsTotal: number;
  }) => void;
  adminDeleteSession: (sessionId: string) => void;
  adminCreateEvent: (input: {
    title: string;
    category: EventItem['category'];
    mode: EventItem['mode'];
    dateDisplay: string;
    prizeOrOutcome: string;
    xpReward: number;
    maxParticipants: number;
    description: string;
    imageUrl?: string;
  }) => void;
  adminDeleteEvent: (eventId: string) => void;
  adminUpdateProjectStatus: (projectId: string, status: ProjectItem['status']) => void;
  adminDeleteProject: (projectId: string) => void;
  adminToggleCertificateApproval: (certId: string) => void;
  adminBroadcastAnnouncement: (title: string, detail: string, targetTab: NavTab) => void;
  adminCreateTeam: (input: {
    name: string;
    code: string;
    tagline: string;
    hackathonTarget: string;
    logoDataUrl?: string;
  }) => void;
  adminUpdateTeamLogo: (teamId: string, logoDataUrl: string | undefined) => void;
  adminDeleteTeam: (teamId: string) => void;
  adminAddUser: (input: {
    name: string;
    email: string;
    branch: string;
    year: string;
    role: ManagedUser['role'];
    teamId: string;
    defaultPassword?: string;
  }) => ManagedUser;
  adminDeleteUser: (userId: string) => void;
  adminAssignUserTeam: (userId: string, teamId: string) => void;
  adminRegenerateUserPassword: (userId: string) => string;
  adminMarkUserPasswordEmailed: (userId: string) => void;
  adminUploadBadge: (input: {
    name: string;
    category: BadgeItem['category'];
    description: string;
    rule: string;
    xpBonus: number;
    unlocked: boolean;
    imageUrl?: string;
    iconName?: BadgeItem['iconName'];
    colorScheme?: BadgeItem['colorScheme'];
  }) => void;
  adminToggleBadgeUnlock: (badgeId: string) => void;
  adminDeleteBadge: (badgeId: string) => void;
}

const ArgonContext = createContext<ArgonContextValue | null>(null);

export const ArgonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PersistedState>(loadInitialState);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [rtdbReady, setRtdbReady] = useState<boolean>(false);
  const [activeTab, setActiveTabState] = useState<NavTab>('dashboard');
  const [selectedIslandId, setSelectedIslandId] = useState<string>('island-1');
  const [toasts, setToasts] = useState<ToastReward[]>([]);

  const rtdbHydratedRef = useRef(false);
  const isApplyingRemoteRef = useRef(false);
  const lastSyncedJsonRef = useRef<string>('');
  const latestStateRef = useRef<PersistedState>(state);
  latestStateRef.current = state;

  const currentUser = useMemo<ManagedUser | null>(
    () => (currentUserId ? state.managedUsers.find((u) => u.id === currentUserId) ?? null : null),
    [state.managedUsers, currentUserId]
  );

  const isAuthenticated = Boolean(currentUser);
  const isAdmin = currentUser?.role === 'Admin';

  const needsAdminSetup = useMemo(
    () => !state.managedUsers.some((u) => u.role === 'Admin' && Boolean(u.passwordHash)),
    [state.managedUsers]
  );

  const setActiveTab = (tab: NavTab) => {
    if (tab === 'admin' && !isAdmin) {
      setActiveTabState('dashboard');
      return;
    }
    setActiveTabState(tab);
  };

  // Live subscription to Firebase Realtime Database (argon-club)
  useEffect(() => {
    const dbRef = ref(rtdb, RTDB_ROOT_PATH);
    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const remoteVal = snapshot.val() as Record<string, unknown>;
          const mergedRaw = mergeRtdbSnapshot(latestStateRef.current, remoteVal);
          const needsPurge = remoteVal.cleanDataSchemaVersion !== CLEAN_SCHEMA_VERSION;
          const merged = needsPurge ? purgeLegacyDemoRecords(mergedRaw) : mergedRaw;
          const cleanPayload = toRtdbPayload(merged);
          const remoteSerialized = JSON.stringify(cleanPayload);
          rtdbHydratedRef.current = true;
          setRtdbReady(true);

          if (needsPurge) {
            lastSyncedJsonRef.current = remoteSerialized;
            isApplyingRemoteRef.current = true;
            setState(merged);
            set(dbRef, cleanPayload).catch((err) => {
              console.warn('[ARGON RTDB] Clean migration write failed:', err);
            });
          } else if (remoteSerialized !== lastSyncedJsonRef.current) {
            lastSyncedJsonRef.current = remoteSerialized;
            isApplyingRemoteRef.current = true;
            setState(merged);
          }
        } else {
          // Initialize empty clean ARGON club structure in RTDB (zero demo data)
          const initialPayload = toRtdbPayload(DEFAULT_PERSISTED);
          lastSyncedJsonRef.current = JSON.stringify(initialPayload);
          rtdbHydratedRef.current = true;
          setRtdbReady(true);
          set(dbRef, initialPayload).catch((err) => {
            console.warn('[ARGON RTDB] Initial setup skipped:', err);
          });
        }
      },
      (error) => {
        rtdbHydratedRef.current = true;
        setRtdbReady(true);
        console.warn('[ARGON RTDB] Listener error (falling back to local cache):', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Persist to localStorage cache + sync mutations to Firebase RTDB
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }

    if (!rtdbHydratedRef.current) return;
    if (isApplyingRemoteRef.current) {
      isApplyingRemoteRef.current = false;
      return;
    }

    const payload = toRtdbPayload(state);
    const serialized = JSON.stringify(payload);
    if (serialized === lastSyncedJsonRef.current) return;

    const timer = window.setTimeout(() => {
      lastSyncedJsonRef.current = serialized;
      set(ref(rtdb, RTDB_ROOT_PATH), payload).catch((err) => {
        console.warn('[ARGON RTDB] Write failed:', err);
      });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [state]);

  const pushToast = (toast: Omit<ToastReward, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev.slice(-2), { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const recomputeIslandStatuses = (islands: LearningIsland[], newXp: number): LearningIsland[] => {
    return islands.map((island) => {
      const allDone = island.lessons.every((l) => l.completed);
      if (allDone) return { ...island, status: 'completed' };
      if (newXp >= island.requiredXp) return { ...island, status: 'active' };
      return { ...island, status: 'locked' };
    });
  };

  const awardXp = (amount: number, reason: string) => {
    setState((prev) => {
      const oldLevel = getLevelInfo(prev.profile.xp).level;
      const nextXp = prev.profile.xp + amount;
      const newLevel = getLevelInfo(nextXp).level;

      const updatedMembers = prev.team.members.map((m) =>
        m.isCurrentUser ? { ...m, xpContribution: m.xpContribution + amount } : m
      );

      const updatedIslands = recomputeIslandStatuses(prev.islands, nextXp);

      if (newLevel > oldLevel) {
        pushToast({
          type: 'levelup',
          title: `Level ${newLevel} Unlocked!`,
          subtitle: `${reason} · You reached ${getLevelInfo(nextXp).title}`,
          xpDelta: amount,
        });
      } else {
        pushToast({
          type: 'xp',
          title: reason,
          subtitle: 'Added to your ARGON XP balance',
          xpDelta: amount,
        });
      }

      return {
        ...prev,
        profile: { ...prev.profile, xp: nextXp },
        managedUsers: currentUserId
          ? prev.managedUsers.map((u) =>
              u.id === currentUserId
                ? {
                    ...u,
                    weeklyXp: u.weeklyXp + amount,
                    monthlyXp: u.monthlyXp + amount,
                    allTimeXp: u.allTimeXp + amount,
                  }
                : u
            )
          : prev.managedUsers,
        totalTeamXpBase: prev.totalTeamXpBase + amount,
        team: { ...prev.team, members: updatedMembers },
        islands: updatedIslands,
      };
    });
  };

  const completeLesson = (islandId: string, lessonId: string) => {
    const targetIsland = state.islands.find((i) => i.id === islandId);
    const targetLesson = targetIsland?.lessons.find((l) => l.id === lessonId);
    if (!targetIsland || !targetLesson || targetLesson.completed) return;

    setState((prev) => {
      const nextXp = prev.profile.xp + targetLesson.xp;
      const oldLevel = getLevelInfo(prev.profile.xp).level;
      const newLevel = getLevelInfo(nextXp).level;

      const rawIslands = prev.islands.map((isl) => {
        if (isl.id !== islandId) return isl;
        return {
          ...isl,
          lessons: isl.lessons.map((les) => (les.id === lessonId ? { ...les, completed: true } : les)),
        };
      });

      const updatedIslands = recomputeIslandStatuses(rawIslands, nextXp);
      const completedIslandNow = updatedIslands.find((i) => i.id === islandId)?.status === 'completed';

      let updatedBadges = prev.badges;
      if (completedIslandNow && (islandId === 'island-3' || islandId === 'island-4')) {
        const badgeId = islandId === 'island-3' ? 'badge-5' : 'badge-6';
        const badgeTarget = prev.badges.find((b) => b.id === badgeId && !b.unlocked);
        if (badgeTarget) {
          updatedBadges = prev.badges.map((b) =>
            b.id === badgeId ? { ...b, unlocked: true, unlockedDate: 'Today' } : b
          );
          pushToast({
            type: 'badge',
            title: `Badge Unlocked: ${badgeTarget.name}`,
            subtitle: badgeTarget.description,
            xpDelta: badgeTarget.xpBonus,
          });
        }
      }

      if (newLevel > oldLevel) {
        pushToast({
          type: 'levelup',
          title: `Level ${newLevel} Reached!`,
          subtitle: `Completed "${targetLesson.title}"`,
          xpDelta: targetLesson.xp,
        });
      } else {
        pushToast({
          type: 'xp',
          title: `Completed: ${targetLesson.title}`,
          subtitle: `${targetIsland.name} progress updated`,
          xpDelta: targetLesson.xp,
        });
      }

      const totalLessons = updatedIslands.slice(0, 4).reduce((acc, i) => acc + i.lessons.length, 0);
      const doneLessons = updatedIslands
        .slice(0, 4)
        .reduce((acc, i) => acc + i.lessons.filter((l) => l.completed).length, 0);
      const certProgress = Math.round((doneLessons / Math.max(1, totalLessons)) * 100);

      const updatedCerts = prev.certificates.map((c) =>
        c.id === 'cert-2'
          ? {
              ...c,
              progressPct: certProgress,
              status: certProgress >= 100 ? ('Earned' as const) : ('In Progress' as const),
              issuedDate: certProgress >= 100 ? 'Today' : c.issuedDate,
              credentialId: certProgress >= 100 ? 'ARGON-TRN-2026-0841' : c.credentialId,
            }
          : c
      );

      return {
        ...prev,
        profile: { ...prev.profile, xp: nextXp },
        totalTeamXpBase: prev.totalTeamXpBase + targetLesson.xp,
        team: {
          ...prev.team,
          members: prev.team.members.map((m) =>
            m.isCurrentUser ? { ...m, xpContribution: m.xpContribution + targetLesson.xp } : m
          ),
        },
        islands: updatedIslands,
        badges: updatedBadges,
        certificates: updatedCerts,
      };
    });
  };

  const toggleSessionRegistration = (sessionId: string) => {
    const target = state.sessions.find((s) => s.id === sessionId);
    if (!target) return;
    const willRegister = !target.registered;
    setState((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              registered: willRegister,
              seatsFilled: willRegister ? Math.min(s.seatsTotal, s.seatsFilled + 1) : Math.max(0, s.seatsFilled - 1),
            }
          : s
      ),
    }));
    if (willRegister) {
      awardXp(30, `Registered for ${target.title}`);
    } else {
      pushToast({
        type: 'info',
        title: 'Registration cancelled',
        subtitle: target.title,
      });
    }
  };

  const checkInSession = (sessionId: string, code: string) => {
    const target = state.sessions.find((s) => s.id === sessionId);
    if (!target || target.attended) return false;
    const normalized = code.trim().toUpperCase();
    if (normalized !== target.checkInCode.toUpperCase() && normalized !== 'QR-VERIFIED') {
      return false;
    }
    setState((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === sessionId ? { ...s, attended: true, registered: true } : s
      ),
      profile: {
        ...prev.profile,
        attendanceRate: Math.min(100, prev.profile.attendanceRate + 2),
      },
    }));
    awardXp(target.xpReward, `Checked in: ${target.title}`);
    return true;
  };

  const markRecordingWatched = (sessionId: string) => {
    const target = state.sessions.find((s) => s.id === sessionId);
    if (!target || target.watchedRecording) return;
    setState((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === sessionId ? { ...s, watchedRecording: true } : s
      ),
    }));
    awardXp(60, `Watched Archive: ${target.title}`);
  };

  const toggleProjectUpvote = (projectId: string) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId
          ? { ...p, upvoted: !p.upvoted, upvotes: p.upvoted ? p.upvotes - 1 : p.upvotes + 1 }
          : p
      ),
    }));
  };

  const submitProject = (input: {
    title: string;
    track: ProjectItem['track'];
    description: string;
    techStack: string[];
    repoUrl: string;
    demoUrl: string;
  }) => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: input.title.trim(),
      teamName: state.team.name,
      track: input.track,
      description: input.description.trim(),
      techStack: input.techStack.length ? input.techStack : ['React', 'TypeScript'],
      upvotes: 1,
      upvoted: true,
      status: 'In Review',
      repoUrl: input.repoUrl || 'https://github.com/argon-avcoe/student-mvp',
      demoUrl: input.demoUrl || 'https://demo.argon.local',
      submittedDate: 'Just now',
      xpAwarded: 250,
    };
    setState((prev) => ({
      ...prev,
      projects: [newProj, ...prev.projects],
      totalProjectsBase: prev.totalProjectsBase + 1,
    }));
    awardXp(250, `Submitted Project: ${newProj.title}`);
  };

  const toggleMilestone = (milestoneId: string) => {
    const target = state.team.milestones.find((m) => m.id === milestoneId);
    if (!target) return;
    const nextDone = !target.completed;
    setState((prev) => ({
      ...prev,
      team: {
        ...prev.team,
        milestones: prev.team.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: nextDone } : m
        ),
      },
    }));
    if (nextDone) {
      awardXp(75, `Team Milestone: ${target.label}`);
    }
  };

  const updateMemberRole = (memberId: string, newRole: string) => {
    setState((prev) => ({
      ...prev,
      team: {
        ...prev.team,
        members: prev.team.members.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
      },
    }));
    pushToast({
      type: 'info',
      title: 'Team role updated',
      subtitle: `Assigned role: ${newRole}`,
    });
  };

  const inviteCandidate = (candidateId: string) => {
    const cand = state.candidates.find((c) => c.id === candidateId);
    if (!cand || cand.invited) return;
    setState((prev) => ({
      ...prev,
      candidates: prev.candidates.map((c) => (c.id === candidateId ? { ...c, invited: true } : c)),
    }));
    pushToast({
      type: 'info',
      title: `Invite sent to ${cand.name}`,
      subtitle: `${cand.primaryRole} · ${cand.branch}`,
    });
  };

  const createTeam = (name: string, tagline: string, hackathonTarget: string) => {
    setState((prev) => ({
      ...prev,
      team: {
        ...prev.team,
        name: name.trim() || prev.team.name,
        tagline: tagline.trim() || prev.team.tagline,
        hackathonTarget: hackathonTarget.trim() || prev.team.hackathonTarget,
      },
    }));
    awardXp(100, `Workspace configured: ${name}`);
  };

  const completeChallenge = (challengeId: string) => {
    const ch = state.challenges.find((c) => c.id === challengeId);
    if (!ch || ch.completed) return;
    setState((prev) => ({
      ...prev,
      challenges: prev.challenges.map((c) => (c.id === challengeId ? { ...c, completed: true } : c)),
      profile: {
        ...prev.profile,
        streakDays: prev.profile.streakDays + 1,
      },
    }));
    awardXp(ch.xp, `Challenge Cleared: ${ch.title}`);
  };

  const isRegisteredForEvent = (eventId: string): boolean => {
    if (!currentUser) return false;
    return state.eventRegistrations.some(
      (r) => r.eventId === eventId && r.userId === currentUser.id
    );
  };

  const confirmEventRegistration = (eventId: string, trackPreference?: string) => {
    const ev = state.events.find((e) => e.id === eventId);
    if (!ev || !currentUser) return;
    const already = state.eventRegistrations.some(
      (r) => r.eventId === eventId && r.userId === currentUser.id
    );
    if (already) return;

    const nowLabel = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });

    const newReg: EventRegistration = {
      id: `reg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      eventId: ev.id,
      eventTitle: ev.title,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      branch: currentUser.branch,
      year: currentUser.year,
      teamId: currentUser.teamId,
      teamName: currentUser.teamName || 'Unassigned',
      trackPreference: trackPreference?.trim() || 'General Track',
      registeredAt: nowLabel,
    };

    setState((prev) => ({
      ...prev,
      eventRegistrations: [newReg, ...prev.eventRegistrations],
      events: prev.events.map((e) =>
        e.id === eventId
          ? {
              ...e,
              registered: true,
              participantsCount: Math.min(e.maxParticipants, e.participantsCount + 1),
            }
          : e
      ),
    }));

    awardXp(50, `Registered: ${ev.title}`);
  };

  const cancelEventRegistration = (eventId: string) => {
    const ev = state.events.find((e) => e.id === eventId);
    if (!ev || !currentUser) return;
    const exists = state.eventRegistrations.some(
      (r) => r.eventId === eventId && r.userId === currentUser.id
    );
    if (!exists) return;

    setState((prev) => ({
      ...prev,
      eventRegistrations: prev.eventRegistrations.filter(
        (r) => !(r.eventId === eventId && r.userId === currentUser.id)
      ),
      events: prev.events.map((e) =>
        e.id === eventId
          ? {
              ...e,
              registered: false,
              participantsCount: Math.max(0, e.participantsCount - 1),
            }
          : e
      ),
    }));

    pushToast({
      type: 'info',
      title: 'Registration cancelled',
      subtitle: `${ev.title} removed from your schedule`,
    });
  };

  const toggleEventRegistration = (eventId: string) => {
    if (isRegisteredForEvent(eventId)) {
      cancelEventRegistration(eventId);
    } else {
      confirmEventRegistration(eventId);
    }
  };

  const adminRemoveEventRegistration = (registrationId: string) => {
    const target = state.eventRegistrations.find((r) => r.id === registrationId);
    if (!target) return;
    setState((prev) => ({
      ...prev,
      eventRegistrations: prev.eventRegistrations.filter((r) => r.id !== registrationId),
      events: prev.events.map((e) =>
        e.id === target.eventId
          ? { ...e, participantsCount: Math.max(0, e.participantsCount - 1) }
          : e
      ),
    }));
    pushToast({
      type: 'info',
      title: 'Registration removed',
      subtitle: `${target.userName} removed from ${target.eventTitle}`,
    });
  };

  const markAllNotificationsRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  const markNotificationRead = (id: string) => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  };

  const updateProfile = (patch: Partial<StudentProfile>) => {
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, ...patch },
      managedUsers: currentUserId
        ? prev.managedUsers.map((u) =>
            u.id === currentUserId
              ? {
                  ...u,
                  name: patch.name?.trim() || u.name,
                  branch: patch.branch?.trim() || u.branch,
                  year: patch.year?.trim() || u.year,
                }
              : u
          )
        : prev.managedUsers,
    }));
    pushToast({
      type: 'info',
      title: 'Profile updated',
      subtitle: 'Saved and synced to Firebase Realtime Database',
    });
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    pushToast({
      type: 'info',
      title: 'Local cache cleared',
      subtitle: 'Re-synced directly with live Firebase Realtime Database',
    });
  };

  const adminCreateSession = (input: {
    title: string;
    mode: LiveSession['mode'];
    track: string;
    dateLabel: string;
    timeRange: string;
    venueOrLink: string;
    instructor: string;
    durationHrs: number;
    xpReward: number;
    checkInCode: string;
    seatsTotal: number;
  }) => {
    const cleanTitle = input.title.trim();
    if (!cleanTitle) return;
    const newSession: LiveSession = {
      id: `sess-${Date.now()}`,
      title: cleanTitle,
      mode: input.mode,
      track: input.track.trim() || 'Full-Stack Engineering',
      dateLabel: input.dateLabel.trim() || 'Sat, Upcoming',
      timeRange: input.timeRange.trim() || '10:00 AM – 12:00 PM',
      venueOrLink: input.venueOrLink.trim() || (input.mode === 'Online' ? 'Google Meet · ARGON Room' : 'AVCOE Lab 204'),
      instructor: input.instructor.trim() || 'ARGON Core Mentor',
      instructorRole: 'Club Mentor · AVCOE',
      durationHrs: Math.max(1, Number(input.durationHrs) || 2),
      xpReward: Math.max(20, Number(input.xpReward) || 100),
      tier: 'Free Core Training',
      registered: false,
      attended: false,
      checkInCode: (input.checkInCode.trim() || `ARG-${Math.floor(100 + Math.random() * 900)}`).toUpperCase(),
      seatsTotal: Math.max(10, Number(input.seatsTotal) || 60),
      seatsFilled: 1,
      isPast: false,
    };
    setState((prev) => ({
      ...prev,
      sessions: [newSession, ...prev.sessions],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: `New Session: ${newSession.title}`,
          detail: `${newSession.mode} · ${newSession.dateLabel} · Code ${newSession.checkInCode}`,
          timeAgo: 'Just now',
          read: false,
          targetTab: 'live-sessions',
        },
        ...prev.notifications,
      ],
    }));
    pushToast({
      type: 'info',
      title: 'Session published',
      subtitle: `${newSession.title} is now live for students`,
    });
  };

  const adminDeleteSession = (sessionId: string) => {
    setState((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((s) => s.id !== sessionId),
    }));
    pushToast({
      type: 'info',
      title: 'Session removed',
      subtitle: 'Updated live session schedule',
    });
  };

  const adminCreateEvent = (input: {
    title: string;
    category: EventItem['category'];
    mode: EventItem['mode'];
    dateDisplay: string;
    prizeOrOutcome: string;
    xpReward: number;
    maxParticipants: number;
    description: string;
    imageUrl?: string;
  }) => {
    const cleanTitle = input.title.trim();
    if (!cleanTitle) return;
    const futureIso = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    const newEvent: EventItem = {
      id: `evt-${Date.now()}`,
      title: cleanTitle,
      category: input.category,
      mode: input.mode,
      targetDateIso: futureIso,
      dateDisplay: input.dateDisplay.trim() || 'Upcoming · AVCOE Campus',
      prizeOrOutcome: input.prizeOrOutcome.trim() || 'Certificates + Club XP',
      xpReward: Math.max(25, Number(input.xpReward) || 150),
      registered: false,
      participantsCount: 1,
      maxParticipants: Math.max(20, Number(input.maxParticipants) || 120),
      imageUrl: input.imageUrl || INITIAL_EVENTS[0]?.imageUrl || '',
      description:
        input.description.trim() ||
        'Official ARGON technical event published by club administrators.',
    };
    setState((prev) => ({
      ...prev,
      events: [newEvent, ...prev.events],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          title: `New ${newEvent.category}: ${newEvent.title}`,
          detail: `${newEvent.dateDisplay} · ${newEvent.prizeOrOutcome}`,
          timeAgo: 'Just now',
          read: false,
          targetTab:
            newEvent.category === 'Internal Hackathon' ||
            newEvent.category === 'National Hackathon' ||
            newEvent.category === 'Innovation Challenge'
              ? 'hackathon'
              : 'events',
        },
        ...prev.notifications,
      ],
    }));
    pushToast({
      type: 'info',
      title: `${newEvent.category} published`,
      subtitle: `${newEvent.title} is now live`,
    });
  };

  const adminDeleteEvent = (eventId: string) => {
    setState((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== eventId),
      eventRegistrations: prev.eventRegistrations.filter((r) => r.eventId !== eventId),
    }));
    pushToast({
      type: 'info',
      title: 'Event removed',
      subtitle: 'Event listing and registrations deleted',
    });
  };

  const adminUpdateProjectStatus = (projectId: string, status: ProjectItem['status']) => {
    const target = state.projects.find((p) => p.id === projectId);
    if (!target) return;
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === projectId ? { ...p, status } : p)),
    }));
    pushToast({
      type: status === 'Hackathon Winner' ? 'badge' : 'info',
      title: `Project marked ${status}`,
      subtitle: target.title,
    });
  };

  const adminDeleteProject = (projectId: string) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== projectId),
      totalProjectsBase: Math.max(0, prev.totalProjectsBase - 1),
    }));
    pushToast({
      type: 'info',
      title: 'Project removed',
      subtitle: 'Submission deleted from showcase',
    });
  };

  const adminToggleCertificateApproval = (certId: string) => {
    const target = state.certificates.find((c) => c.id === certId);
    if (!target) return;
    const willEarn = target.status !== 'Earned';
    setState((prev) => ({
      ...prev,
      certificates: prev.certificates.map((c) =>
        c.id === certId
          ? {
              ...c,
              status: willEarn ? 'Earned' : 'In Progress',
              progressPct: willEarn ? 100 : Math.min(85, c.progressPct),
              issuedDate: willEarn ? 'Today (Admin Approved)' : undefined,
              credentialId: willEarn
                ? c.credentialId || `ARGON-ADM-${Math.floor(1000 + Math.random() * 9000)}`
                : undefined,
            }
          : c
      ),
    }));
    pushToast({
      type: willEarn ? 'badge' : 'info',
      title: willEarn ? 'Certificate issued' : 'Certificate set to In Progress',
      subtitle: target.title,
    });
  };

  const adminBroadcastAnnouncement = (title: string, detail: string, targetTab: NavTab) => {
    const cleanTitle = title.trim();
    const cleanDetail = detail.trim();
    if (!cleanTitle || !cleanDetail) return;
    const item: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: cleanTitle,
      detail: cleanDetail,
      timeAgo: 'Just now',
      read: false,
      targetTab,
    };
    setState((prev) => ({
      ...prev,
      notifications: [item, ...prev.notifications],
    }));
    pushToast({
      type: 'info',
      title: 'Announcement broadcast',
      subtitle: 'Delivered to student notifications bell',
    });
  };

  const adminCreateTeam = (input: {
    name: string;
    code: string;
    tagline: string;
    hackathonTarget: string;
    logoDataUrl?: string;
  }) => {
    const cleanName = input.name.trim();
    if (!cleanName) return;
    const newTeam: ManagedTeam = {
      id: `team-${Date.now()}`,
      name: cleanName,
      code:
        input.code.trim().toUpperCase() ||
        `${cleanName.slice(0, 2).toUpperCase()}-${Math.floor(10 + Math.random() * 89)}`,
      tagline: input.tagline.trim() || 'AVCOE builders shipping hackathon prototypes.',
      hackathonTarget: input.hackathonTarget.trim() || 'ARGON Winter Hackathon 2026',
      logoDataUrl: input.logoDataUrl,
      accentColor: '#F95C4B',
      weeklyXp: 150,
      monthlyXp: 450,
      allTimeXp: 450,
      projectsShipped: 0,
      badgesCount: 1,
    };
    setState((prev) => ({
      ...prev,
      managedTeams: [newTeam, ...prev.managedTeams],
    }));
    pushToast({
      type: 'info',
      title: `Team created: ${newTeam.name}`,
      subtitle: newTeam.logoDataUrl ? 'Custom team logo assigned' : `Code ${newTeam.code}`,
    });
  };

  const adminUpdateTeamLogo = (teamId: string, logoDataUrl: string | undefined) => {
    setState((prev) => {
      const target = prev.managedTeams.find((t) => t.id === teamId);
      const isUserTeam = Boolean(target?.isUserTeam || prev.team.id === teamId);
      return {
        ...prev,
        managedTeams: prev.managedTeams.map((t) =>
          t.id === teamId ? { ...t, logoDataUrl } : t
        ),
        team: isUserTeam ? { ...prev.team, logoDataUrl } : prev.team,
      };
    });
    pushToast({
      type: 'info',
      title: logoDataUrl ? 'Team logo updated' : 'Team logo removed',
      subtitle: 'Synced across Leaderboard and Team Workspace',
    });
  };

  const adminDeleteTeam = (teamId: string) => {
    setState((prev) => ({
      ...prev,
      managedTeams: prev.managedTeams.filter((t) => t.id !== teamId),
      managedUsers: prev.managedUsers.map((u) =>
        u.teamId === teamId ? { ...u, teamId: '', teamName: 'Unassigned' } : u
      ),
      eventRegistrations: prev.eventRegistrations.map((r) =>
        r.teamId === teamId ? { ...r, teamId: '', teamName: 'Unassigned' } : r
      ),
    }));
    pushToast({
      type: 'info',
      title: 'Team deleted',
      subtitle: 'Assigned users moved to Unassigned',
    });
  };

  const adminAddUser = (input: {
    name: string;
    email: string;
    branch: string;
    year: string;
    role: ManagedUser['role'];
    teamId: string;
    defaultPassword?: string;
  }): ManagedUser => {
    const cleanName = input.name.trim();
    const matchedTeam = state.managedTeams.find((t) => t.id === input.teamId);
    const initials = cleanName
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'ST';
    const password = input.defaultPassword?.trim() || generateDefaultPassword();
    const newUser: ManagedUser = {
      id: `stu-${Date.now()}`,
      name: cleanName,
      email: normalizeEmail(input.email),
      branch: input.branch.trim() || 'Computer Engg.',
      year: input.year.trim() || 'SE',
      role: input.role,
      teamId: matchedTeam?.id || '',
      teamName: matchedTeam?.name || 'Unassigned',
      defaultPassword: password,
      mustChangePassword: true,
      weeklyXp: 100,
      monthlyXp: 100,
      allTimeXp: 100,
      questsCompleted: 1,
      badgesCount: 1,
      streakDays: 1,
      initials,
    };

    setState((prev) => ({
      ...prev,
      managedUsers: [newUser, ...prev.managedUsers],
      totalCommunityStudents: prev.totalCommunityStudents + 1,
    }));

    // Derive salted PBKDF2 hash asynchronously so login verification uses hashed credentials
    hashMemberPassword(password)
      .then(({ hash, salt }) => {
        setState((prev) => ({
          ...prev,
          managedUsers: prev.managedUsers.map((u) =>
            u.id === newUser.id ? { ...u, passwordHash: hash, passwordSalt: salt } : u
          ),
        }));
      })
      .catch(() => {
        // Fallback handled during login if Web Crypto is unavailable
      });

    pushToast({
      type: 'info',
      title: `User added: ${newUser.name}`,
      subtitle: `Default password generated (${newUser.defaultPassword})`,
    });

    return newUser;
  };

  const adminDeleteUser = (userId: string) => {
    const target = state.managedUsers.find((u) => u.id === userId);
    if (!target) return;
    if (currentUserId === userId) {
      setCurrentUserId(null);
      setActiveTabState('dashboard');
    }
    setState((prev) => ({
      ...prev,
      managedUsers: prev.managedUsers.filter((u) => u.id !== userId),
      eventRegistrations: prev.eventRegistrations.filter((r) => r.userId !== userId),
      totalCommunityStudents: Math.max(0, prev.totalCommunityStudents - 1),
    }));
    pushToast({
      type: 'info',
      title: `User removed: ${target.name}`,
      subtitle: 'Removed from directory, leaderboard, and event rosters',
    });
  };

  const adminAssignUserTeam = (userId: string, teamId: string) => {
    const matchedTeam = state.managedTeams.find((t) => t.id === teamId);
    const nextTeamId = matchedTeam?.id || '';
    const nextTeamName = matchedTeam?.name || 'Unassigned';
    setState((prev) => ({
      ...prev,
      managedUsers: prev.managedUsers.map((u) =>
        u.id === userId ? { ...u, teamId: nextTeamId, teamName: nextTeamName } : u
      ),
      eventRegistrations: prev.eventRegistrations.map((r) =>
        r.userId === userId ? { ...r, teamId: nextTeamId, teamName: nextTeamName } : r
      ),
    }));
    pushToast({
      type: 'info',
      title: 'Team assignment updated',
      subtitle: `Assigned to ${nextTeamName} (synced to Firebase RTDB)`,
    });
  };

  const adminBulkAssignTeam = (userIds: string[], teamId: string) => {
    if (userIds.length === 0) return;
    const idSet = new Set(userIds);
    const matchedTeam = state.managedTeams.find((t) => t.id === teamId);
    const nextTeamId = matchedTeam?.id || '';
    const nextTeamName = matchedTeam?.name || 'Unassigned';
    setState((prev) => ({
      ...prev,
      managedUsers: prev.managedUsers.map((u) =>
        idSet.has(u.id) ? { ...u, teamId: nextTeamId, teamName: nextTeamName } : u
      ),
      eventRegistrations: prev.eventRegistrations.map((r) =>
        idSet.has(r.userId) ? { ...r, teamId: nextTeamId, teamName: nextTeamName } : r
      ),
    }));
    pushToast({
      type: 'badge',
      title: `Assigned ${userIds.length} member${userIds.length === 1 ? '' : 's'}`,
      subtitle: `Moved to ${nextTeamName} and synced to Firebase RTDB`,
    });
  };

  const adminAutoDistributeTeams = (userIds: string[]) => {
    if (userIds.length === 0 || state.managedTeams.length === 0) return;
    const teams = state.managedTeams;
    const assignmentMap = new Map<string, { teamId: string; teamName: string }>();
    // Count current team sizes to balance evenly
    const counts = new Map<string, number>();
    teams.forEach((t) => {
      counts.set(
        t.id,
        state.managedUsers.filter((u) => u.teamId === t.id).length
      );
    });

    userIds.forEach((uid) => {
      let chosen = teams[0];
      let minCount = counts.get(chosen.id) ?? 0;
      for (const t of teams) {
        const c = counts.get(t.id) ?? 0;
        if (c < minCount) {
          chosen = t;
          minCount = c;
        }
      }
      assignmentMap.set(uid, { teamId: chosen.id, teamName: chosen.name });
      counts.set(chosen.id, minCount + 1);
    });

    setState((prev) => ({
      ...prev,
      managedUsers: prev.managedUsers.map((u) => {
        const next = assignmentMap.get(u.id);
        return next ? { ...u, teamId: next.teamId, teamName: next.teamName } : u;
      }),
      eventRegistrations: prev.eventRegistrations.map((r) => {
        const next = assignmentMap.get(r.userId);
        return next ? { ...r, teamId: next.teamId, teamName: next.teamName } : r;
      }),
    }));

    pushToast({
      type: 'badge',
      title: `Auto-assigned ${userIds.length} student${userIds.length === 1 ? '' : 's'}`,
      subtitle: `Balanced evenly across ${teams.length} teams in Firebase RTDB`,
    });
  };

  const adminRegenerateUserPassword = (userId: string): string => {
    const nextPwd = generateDefaultPassword();
    setState((prev) => ({
      ...prev,
      managedUsers: prev.managedUsers.map((u) =>
        u.id === userId
          ? {
              ...u,
              defaultPassword: nextPwd,
              passwordHash: undefined,
              passwordSalt: undefined,
              mustChangePassword: true,
              passwordEmailedAt: undefined,
            }
          : u
      ),
    }));
    hashMemberPassword(nextPwd)
      .then(({ hash, salt }) => {
        setState((prev) => ({
          ...prev,
          managedUsers: prev.managedUsers.map((u) =>
            u.id === userId ? { ...u, passwordHash: hash, passwordSalt: salt } : u
          ),
        }));
      })
      .catch(() => {});
    pushToast({
      type: 'info',
      title: 'Default password regenerated',
      subtitle: `New password: ${nextPwd}`,
    });
    return nextPwd;
  };

  const adminMarkUserPasswordEmailed = (userId: string) => {
    const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setState((prev) => ({
      ...prev,
      managedUsers: prev.managedUsers.map((u) =>
        u.id === userId ? { ...u, passwordEmailedAt: `Sent at ${nowLabel}` } : u
      ),
    }));
    pushToast({
      type: 'badge',
      title: 'Credentials email sent via Gmail',
      subtitle: 'Default password delivered to user inbox',
    });
  };

  const adminUploadBadge = (input: {
    name: string;
    category: BadgeItem['category'];
    description: string;
    rule: string;
    xpBonus: number;
    unlocked: boolean;
    imageUrl?: string;
    iconName?: BadgeItem['iconName'];
    colorScheme?: BadgeItem['colorScheme'];
  }) => {
    const cleanName = input.name.trim();
    if (!cleanName) return;
    const newBadge: BadgeItem = {
      id: `badge-${Date.now()}`,
      name: cleanName,
      category: input.category,
      description:
        input.description.trim() ||
        'Custom achievement badge uploaded by ARGON club administrators.',
      rule: input.rule.trim() || 'Awarded by ARGON Core Admin Team',
      unlocked: input.unlocked,
      unlockedDate: input.unlocked ? 'Today' : undefined,
      colorScheme: input.colorScheme || 'orange',
      iconName: input.iconName || 'trophy',
      imageUrl: input.imageUrl,
      xpBonus: Math.max(25, Number(input.xpBonus) || 150),
    };
    setState((prev) => ({
      ...prev,
      badges: [newBadge, ...prev.badges],
    }));
    pushToast({
      type: 'badge',
      title: `Badge uploaded: ${newBadge.name}`,
      subtitle: 'Now live in Certificates & Badges vault',
    });
  };

  const adminToggleBadgeUnlock = (badgeId: string) => {
    setState((prev) => ({
      ...prev,
      badges: prev.badges.map((b) =>
        b.id === badgeId
          ? {
              ...b,
              unlocked: !b.unlocked,
              unlockedDate: !b.unlocked ? 'Today' : undefined,
            }
          : b
      ),
    }));
  };

  const adminDeleteBadge = (badgeId: string) => {
    setState((prev) => ({
      ...prev,
      badges: prev.badges.filter((b) => b.id !== badgeId),
    }));
    pushToast({
      type: 'info',
      title: 'Badge deleted',
      subtitle: 'Removed from badge vault',
    });
  };

  const loginMember = async (
    emailInput: string,
    passwordInput: string
  ): Promise<{ ok: boolean; error?: string; mustChangePassword?: boolean }> => {
    const cleanEmail = normalizeEmail(emailInput);
    if (!isValidEmail(cleanEmail)) {
      return { ok: false, error: 'Please enter a valid email address.' };
    }
    if (!passwordInput.trim()) {
      return { ok: false, error: 'Please enter your password.' };
    }

    const user = state.managedUsers.find((u) => normalizeEmail(u.email) === cleanEmail);
    if (!user) {
      return { ok: false, error: 'Invalid email or password.' };
    }

    let matched = false;
    if (user.passwordHash && user.passwordSalt) {
      matched = await verifyMemberPassword(passwordInput, user.passwordHash, user.passwordSalt);
    } else if (user.defaultPassword) {
      matched = constantTimeEqual(passwordInput.trim(), user.defaultPassword.trim());
      if (matched) {
        // Upgrade legacy default password record to salted PBKDF2 hash
        const { hash, salt } = await hashMemberPassword(passwordInput.trim());
        setState((prev) => ({
          ...prev,
          managedUsers: prev.managedUsers.map((u) =>
            u.id === user.id ? { ...u, passwordHash: hash, passwordSalt: salt } : u
          ),
        }));
      }
    }

    if (!matched) {
      return { ok: false, error: 'Invalid email or password.' };
    }

    const nowIso = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      managedUsers: prev.managedUsers.map((u) =>
        u.id === user.id ? { ...u, lastLoginAt: nowIso } : u
      ),
    }));
    setCurrentUserId(user.id);
    setActiveTabState('dashboard');
    pushToast({
      type: 'info',
      title: `Welcome back, ${user.name.split(' ')[0]}!`,
      subtitle: `${user.role} · ${user.teamName || 'AVCOE Member'}`,
    });
    return { ok: true, mustChangePassword: Boolean(user.mustChangePassword) };
  };

  const registerMember = async (input: {
    name: string;
    email: string;
    branch: string;
    year: string;
    teamId: string;
    password: string;
  }): Promise<{ ok: boolean; error?: string }> => {
    const cleanName = input.name.trim();
    const cleanEmail = normalizeEmail(input.email);
    if (cleanName.length < 2) {
      return { ok: false, error: 'Please enter your full name.' };
    }
    if (!isValidEmail(cleanEmail)) {
      return { ok: false, error: 'Please enter a valid email address.' };
    }
    const pwdErr = validateNewPassword(input.password);
    if (pwdErr) {
      return { ok: false, error: pwdErr };
    }
    if (state.managedUsers.some((u) => normalizeEmail(u.email) === cleanEmail)) {
      return { ok: false, error: 'An account with this email already exists. Please sign in.' };
    }

    const { hash, salt } = await hashMemberPassword(input.password);
    const matchedTeam = state.managedTeams.find((t) => t.id === input.teamId);
    const initials =
      cleanName
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'ST';

    const newMember: ManagedUser = {
      id: `stu-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      branch: input.branch.trim() || 'Computer Engg.',
      year: input.year.trim() || 'SE',
      role: 'Student',
      teamId: matchedTeam?.id || '',
      teamName: matchedTeam?.name || 'Unassigned',
      defaultPassword: '',
      passwordHash: hash,
      passwordSalt: salt,
      mustChangePassword: false,
      lastLoginAt: new Date().toISOString(),
      weeklyXp: 100,
      monthlyXp: 100,
      allTimeXp: 100,
      questsCompleted: 1,
      badgesCount: 1,
      streakDays: 1,
      initials,
    };

    setState((prev) => ({
      ...prev,
      managedUsers: [newMember, ...prev.managedUsers],
      totalCommunityStudents: prev.totalCommunityStudents + 1,
    }));
    setCurrentUserId(newMember.id);
    setActiveTabState('dashboard');
    pushToast({
      type: 'badge',
      title: `Welcome to ARGON, ${cleanName.split(' ')[0]}!`,
      subtitle: 'Member account created and synced to Firebase',
    });
    return { ok: true };
  };

  const claimInitialAdmin = async (input: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ ok: boolean; error?: string }> => {
    if (!needsAdminSetup) {
      return { ok: false, error: 'Admin account has already been configured. Please sign in.' };
    }
    const cleanName = input.name.trim();
    const cleanEmail = normalizeEmail(input.email);
    if (cleanName.length < 2) {
      return { ok: false, error: 'Please enter the admin name.' };
    }
    if (!isValidEmail(cleanEmail)) {
      return { ok: false, error: 'Please enter a valid admin email.' };
    }
    const pwdErr = validateNewPassword(input.password);
    if (pwdErr) {
      return { ok: false, error: pwdErr };
    }

    const { hash, salt } = await hashMemberPassword(input.password);
    const existingAdmin = state.managedUsers.find((u) => u.role === 'Admin');
    const adminId = existingAdmin?.id || `adm-${Date.now()}`;
    const initials =
      cleanName
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'AD';

    setState((prev) => {
      if (existingAdmin) {
        return {
          ...prev,
          managedUsers: prev.managedUsers.map((u) =>
            u.id === existingAdmin.id
              ? {
                  ...u,
                  name: cleanName,
                  email: cleanEmail,
                  initials,
                  defaultPassword: '',
                  passwordHash: hash,
                  passwordSalt: salt,
                  mustChangePassword: false,
                  lastLoginAt: new Date().toISOString(),
                }
              : u
          ),
        };
      }
      const newAdmin: ManagedUser = {
        id: adminId,
        name: cleanName,
        email: cleanEmail,
        branch: 'AI & DS',
        year: 'BE',
        role: 'Admin',
        teamId: prev.managedTeams[0]?.id || '',
        teamName: prev.managedTeams[0]?.name || 'Core Team',
        defaultPassword: '',
        passwordHash: hash,
        passwordSalt: salt,
        mustChangePassword: false,
        lastLoginAt: new Date().toISOString(),
        weeklyXp: 500,
        monthlyXp: 1500,
        allTimeXp: 3000,
        questsCompleted: 12,
        badgesCount: 5,
        streakDays: 7,
        initials,
      };
      return {
        ...prev,
        managedUsers: [newAdmin, ...prev.managedUsers],
      };
    });

    setCurrentUserId(adminId);
    setActiveTabState('admin');
    pushToast({
      type: 'badge',
      title: 'Admin account configured',
      subtitle: 'Password hashed and saved to Firebase RTDB',
    });
    return { ok: true };
  };

  const changeCurrentMemberPassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ ok: boolean; error?: string }> => {
    if (!currentUser) {
      return { ok: false, error: 'You must be signed in to change your password.' };
    }
    const pwdErr = validateNewPassword(newPassword);
    if (pwdErr) {
      return { ok: false, error: pwdErr };
    }

    let validCurrent = false;
    if (currentUser.passwordHash && currentUser.passwordSalt) {
      validCurrent = await verifyMemberPassword(
        currentPassword,
        currentUser.passwordHash,
        currentUser.passwordSalt
      );
    } else if (currentUser.defaultPassword) {
      validCurrent = constantTimeEqual(currentPassword.trim(), currentUser.defaultPassword.trim());
    }

    if (!validCurrent) {
      return { ok: false, error: 'Current password is incorrect.' };
    }

    const { hash, salt } = await hashMemberPassword(newPassword);
    setState((prev) => ({
      ...prev,
      managedUsers: prev.managedUsers.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              defaultPassword: '',
              passwordHash: hash,
              passwordSalt: salt,
              mustChangePassword: false,
            }
          : u
      ),
    }));

    pushToast({
      type: 'badge',
      title: 'Password updated',
      subtitle: 'Your new password has been securely saved',
    });
    return { ok: true };
  };

  const logoutMember = () => {
    setCurrentUserId(null);
    setActiveTabState('dashboard');
    pushToast({
      type: 'info',
      title: 'Signed out',
      subtitle: 'You have been logged out of ARGON',
    });
  };

  const activeProfile = useMemo<StudentProfile>(() => {
    if (!currentUser) return state.profile;
    return {
      ...state.profile,
      name: currentUser.name,
      email: currentUser.email,
      branch: currentUser.branch,
      year: `${currentUser.year} · ${currentUser.role}`,
      xp: currentUser.allTimeXp,
      streakDays: currentUser.streakDays,
    };
  }, [state.profile, currentUser]);

  const activeTeam = useMemo<TeamWorkspace>(() => {
    if (!currentUser?.teamId) {
      return {
        ...state.team,
        id: '',
        name: 'No Team Assigned',
        code: '—',
        logoDataUrl: undefined,
        members: [],
      };
    }
    const matched = state.managedTeams.find((t) => t.id === currentUser.teamId);
    if (!matched) {
      return {
        ...state.team,
        id: '',
        name: 'No Team Assigned',
        code: '—',
        logoDataUrl: undefined,
        members: [],
      };
    }
    const teammates = state.managedUsers
      .filter((u) => u.teamId === matched.id)
      .map((u, idx) => ({
        id: u.id,
        name: u.name,
        branch: u.branch,
        year: u.year,
        role: u.role,
        skills: [],
        xpContribution: u.allTimeXp,
        initials: u.initials,
        accentColor: idx % 2 === 0 ? '#F95C4B' : '#000000',
        isCurrentUser: u.id === currentUser.id,
      }));
    return {
      ...state.team,
      id: matched.id,
      name: matched.name,
      code: matched.code,
      tagline: matched.tagline,
      hackathonTarget: matched.hackathonTarget,
      logoDataUrl: matched.logoDataUrl,
      accentColor: matched.accentColor,
      members: teammates,
    };
  }, [currentUser, state.managedTeams, state.managedUsers, state.team]);

  const leaderboardStudents = useMemo<LeaderboardStudent[]>(() => {
    return state.managedUsers.map((s) => {
      const isActiveMember = currentUser ? s.id === currentUser.id : false;
      return {
        id: s.id,
        name: s.name,
        branch: s.branch,
        teamName: s.teamName || 'Unassigned',
        weeklyXp: s.weeklyXp,
        monthlyXp: s.monthlyXp,
        allTimeXp: s.allTimeXp,
        questsCompleted: s.questsCompleted,
        badgesCount: s.badgesCount,
        streakDays: s.streakDays,
        initials: s.initials,
        isCurrentUser: isActiveMember,
      };
    });
  }, [state.managedUsers, currentUser]);

  const leaderboardTeams = useMemo<LeaderboardTeam[]>(() => {
    return state.managedTeams.map((t) => {
      const members = state.managedUsers.filter((u) => u.teamId === t.id);
      const weeklyXp = members.reduce((sum, u) => sum + (u.weeklyXp || 0), 0);
      const monthlyXp = members.reduce((sum, u) => sum + (u.monthlyXp || 0), 0);
      const allTimeXp = members.reduce((sum, u) => sum + (u.allTimeXp || 0), 0);
      const projectsShipped = state.projects.filter((p) => p.teamName === t.name).length;
      const isUserTeam = Boolean(currentUser?.teamId && currentUser.teamId === t.id);
      return {
        id: t.id,
        name: t.name,
        code: t.code,
        logoDataUrl: t.logoDataUrl,
        membersCount: members.length,
        weeklyXp,
        monthlyXp,
        allTimeXp,
        projectsShipped,
        badgesCount: t.badgesCount || 0,
        isUserTeam,
      };
    });
  }, [state.managedTeams, state.managedUsers, state.projects, currentUser]);

  const readinessPct = useMemo(() => {
    const done = state.team.milestones.filter((m) => m.completed).length;
    const total = state.team.milestones.length;
    return Math.round((done / Math.max(1, total)) * 100);
  }, [state.team.milestones]);

  const upcomingSessionsCount = useMemo(
    () => state.sessions.filter((s) => !s.isPast).length,
    [state.sessions]
  );

  const totalEarnedXpDisplay = useMemo(
    () => state.managedUsers.reduce((sum, u) => sum + (u.allTimeXp || 0), 0),
    [state.managedUsers]
  );

  const materialPalette = useMemo(() => {
    const preset = MATERIAL_PRESET_SEEDS.find(
      (p) => p.seedHex.toLowerCase() === state.materialSeedHex.toLowerCase()
    );
    return buildMaterialPalette(
      state.materialSeedHex,
      preset?.name ?? 'Custom Dynamic Seed',
      preset?.id ?? 'custom'
    );
  }, [state.materialSeedHex]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.theme = state.themeMode;
    document.documentElement.dataset.motion = state.materialMotion;
    applyMaterialCssVariables(materialPalette);
  }, [state.themeMode, state.materialMotion, materialPalette]);

  const setThemeMode = (mode: ThemeMode) => {
    setState((prev) => ({ ...prev, themeMode: mode }));
    pushToast({
      type: 'info',
      title: mode === 'google-material' ? 'Google Material Theme Active' : 'ARGON Paper & Coral Active',
      subtitle:
        mode === 'google-material'
          ? 'Material You Expressive UI, spring motion, and dynamic colors enabled'
          : 'Restored Paper, Stone, Coral & Black editorial palette',
    });
  };

  const setMaterialSeedHex = (hex: string) => {
    setState((prev) => ({ ...prev, materialSeedHex: hex }));
  };

  const setMaterialMotion = (motion: MaterialMotionStyle) => {
    setState((prev) => ({ ...prev, materialMotion: motion }));
  };

  const memberEvents = useMemo<EventItem[]>(() => {
    return state.events.map((ev) => {
      const liveRegCount = state.eventRegistrations.filter((r) => r.eventId === ev.id).length;
      return {
        ...ev,
        participantsCount: liveRegCount,
        registered: currentUser
          ? state.eventRegistrations.some(
              (r) => r.eventId === ev.id && r.userId === currentUser.id
            )
          : false,
      };
    });
  }, [state.events, state.eventRegistrations, currentUser]);

  const value: ArgonContextValue = {
    ...state,
    team: activeTeam,
    events: memberEvents,
    profile: activeProfile,
    totalCommunityStudents: state.managedUsers.length,
    currentUser,
    isAuthenticated,
    isAdmin,
    needsAdminSetup,
    rtdbReady,
    loginMember,
    registerMember,
    claimInitialAdmin,
    changeCurrentMemberPassword,
    logoutMember,
    activeTab,
    setActiveTab,
    selectedIslandId,
    setSelectedIslandId,
    materialPalette,
    setThemeMode,
    setMaterialSeedHex,
    setMaterialMotion,
    toasts,
    dismissToast,
    leaderboardStudents,
    leaderboardTeams,
    readinessPct,
    upcomingSessionsCount,
    totalEarnedXpDisplay,
    projectsSubmittedDisplay: state.projects.length,
    awardXp,
    completeLesson,
    toggleSessionRegistration,
    checkInSession,
    markRecordingWatched,
    toggleProjectUpvote,
    submitProject,
    toggleMilestone,
    updateMemberRole,
    inviteCandidate,
    createTeam,
    completeChallenge,
    toggleEventRegistration,
    isRegisteredForEvent,
    confirmEventRegistration,
    cancelEventRegistration,
    adminRemoveEventRegistration,
    adminBulkAssignTeam,
    adminAutoDistributeTeams,
    markAllNotificationsRead,
    markNotificationRead,
    updateProfile,
    resetDemoData,
    adminCreateSession,
    adminDeleteSession,
    adminCreateEvent,
    adminDeleteEvent,
    adminUpdateProjectStatus,
    adminDeleteProject,
    adminToggleCertificateApproval,
    adminBroadcastAnnouncement,
    adminCreateTeam,
    adminUpdateTeamLogo,
    adminDeleteTeam,
    adminAddUser,
    adminDeleteUser,
    adminAssignUserTeam,
    adminRegenerateUserPassword,
    adminMarkUserPasswordEmailed,
    adminUploadBadge,
    adminToggleBadgeUnlock,
    adminDeleteBadge,
  };

  return <ArgonContext.Provider value={value}>{children}</ArgonContext.Provider>;
};

export function useArgon() {
  const ctx = useContext(ArgonContext);
  if (!ctx) throw new Error('useArgon must be used within ArgonProvider');
  return ctx;
}
