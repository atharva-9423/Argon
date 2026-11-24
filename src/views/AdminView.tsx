import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Award,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  ImagePlus,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Megaphone,
  Plus,
  Radio,
  RefreshCw,
  Rocket,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  Trophy,
  Unlock,
  Upload,
  UserPlus,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { HexBadge3D } from '../components/ui/ClayMedallion';
import { useArgon } from '../context/ArgonContext';
import { BadgeItem, EventItem, LiveSession, ManagedUser, NavTab, ProjectItem } from '../types';
import {
  generateDefaultPassword,
  getGmailAccessToken,
  initGmailAuth,
  readAndCompressImageFile,
  sendPasswordEmailViaGmail,
  signInWithGoogleForGmail,
  signOutGmail,
} from '../utils/gmailAuth';

type AdminSection =
  | 'overview'
  | 'registrations'
  | 'users'
  | 'teams'
  | 'hackathons-events'
  | 'badges-certs'
  | 'projects-broadcast';

const GoogleSignInButton: React.FC<{
  onClick: () => void;
  loading?: boolean;
  label?: string;
}> = ({ onClick, loading = false, label = 'Sign in with Google' }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={loading}
    className="inline-flex items-center justify-center gap-2.5 h-10 px-4 rounded-[10px] bg-white text-[#1F1F1F] border border-[#747775] text-xs font-semibold hover:bg-[#F8F9FA] active:bg-[#F1F3F4] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
  >
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className="w-[18px] h-[18px] shrink-0"
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
    <span>{loading ? 'Connecting Google...' : label}</span>
  </button>
);

export const AdminView: React.FC = () => {
  const {
    sessions,
    events,
    eventRegistrations,
    projects,
    badges,
    certificates,
    notifications,
    managedTeams,
    managedUsers,
    totalCommunityStudents,
    awardXp,
    setActiveTab,
    adminCreateSession,
    adminDeleteSession,
    adminCreateEvent,
    adminDeleteEvent,
    adminRemoveEventRegistration,
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
    adminBulkAssignTeam,
    adminAutoDistributeTeams,
    adminRegenerateUserPassword,
    adminMarkUserPasswordEmailed,
    adminUploadBadge,
    adminToggleBadgeUnlock,
    adminDeleteBadge,
    themeMode,
    materialPalette,
  } = useArgon();

  const isMaterial = themeMode === 'google-material';

  const [section, setSection] = useState<AdminSection>('overview');
  const [mobileFormOpen, setMobileFormOpen] = useState<Record<string, boolean>>({});
  const toggleMobileForm = (key: string) =>
    setMobileFormOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  // Gmail OAuth state (access token stays strictly in memory inside gmailAuth.ts)
  const [gmailUserEmail, setGmailUserEmail] = useState<string | null>(null);
  const [gmailConnected, setGmailConnected] = useState<boolean>(Boolean(getGmailAccessToken()));
  const [gmailSigningIn, setGmailSigningIn] = useState(false);
  const [gmailAuthError, setGmailAuthError] = useState<string | null>(null);

  // Email Confirmation Modal state (Mandatory before calling Gmail send API)
  const [emailModalUser, setEmailModalUser] = useState<ManagedUser | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSendError, setEmailSendError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = initGmailAuth(
      (user) => {
        setGmailUserEmail(user.email || 'Connected Google Account');
        setGmailConnected(true);
        setGmailAuthError(null);
      },
      () => {
        setGmailConnected(false);
        setGmailUserEmail(null);
      }
    );
    return () => unsub();
  }, []);

  const handleConnectGmail = async () => {
    setGmailSigningIn(true);
    setGmailAuthError(null);
    setEmailSendError(null);
    try {
      const { user } = await signInWithGoogleForGmail();
      setGmailUserEmail(user.email || 'Connected Google Account');
      setGmailConnected(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google Sign-In was cancelled or failed.';
      setGmailAuthError(msg);
      setEmailSendError(msg);
    } finally {
      setGmailSigningIn(false);
    }
  };

  const handleDisconnectGmail = async () => {
    await signOutGmail();
    setGmailConnected(false);
    setGmailUserEmail(null);
  };

  const openEmailConfirmation = (user: ManagedUser) => {
    setEmailSendError(null);
    setEmailModalUser(user);
  };

  const handleConfirmSendEmail = async () => {
    if (!emailModalUser) return;
    setSendingEmail(true);
    setEmailSendError(null);
    try {
      await sendPasswordEmailViaGmail({
        toEmail: emailModalUser.email,
        recipientName: emailModalUser.name,
        teamName: emailModalUser.teamName,
        role: emailModalUser.role,
        defaultPassword: emailModalUser.defaultPassword,
      });
      adminMarkUserPasswordEmailed(emailModalUser.id);
      if (lastCreatedUser?.id === emailModalUser.id) {
        setLastCreatedUser((prev) =>
          prev ? { ...prev, passwordEmailedAt: 'Just sent via Gmail' } : null
        );
      }
      setEmailModalUser(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send email via Gmail.';
      if (msg === 'NEEDS_GMAIL_AUTH') {
        setGmailConnected(false);
        setEmailSendError('Your Gmail session expired or is not connected. Please sign in with Google below and try again.');
      } else {
        setEmailSendError(msg);
      }
    } finally {
      setSendingEmail(false);
    }
  };

  // === USERS FORM & DIRECTORY STATE ===
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserBranch, setNewUserBranch] = useState('Computer Engg.');
  const [newUserYear, setNewUserYear] = useState('SE');
  const [newUserRole, setNewUserRole] = useState<ManagedUser['role']>('Student');
  const [newUserTeamId, setNewUserTeamId] = useState<string>(managedTeams[0]?.id || '');
  const [newUserPassword, setNewUserPassword] = useState<string>(() => generateDefaultPassword());
  const [lastCreatedUser, setLastCreatedUser] = useState<ManagedUser | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userTeamFilter, setUserTeamFilter] = useState<string>('ALL');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);

  // === TEAMS & LOGOS STATE ===
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [teamTagline, setTeamTagline] = useState('');
  const [teamHackathon, setTeamHackathon] = useState('ARGON Winter Hackathon 2026');
  const [teamLogoPreview, setTeamLogoPreview] = useState<string | undefined>(undefined);
  const [teamLogoError, setTeamLogoError] = useState<string | null>(null);
  const [confirmDeleteTeamId, setConfirmDeleteTeamId] = useState<string | null>(null);

  // === HACKATHON FORM STATE ===
  const [hackTitle, setHackTitle] = useState('');
  const [hackCategory, setHackCategory] = useState<
    'Internal Hackathon' | 'National Hackathon' | 'Innovation Challenge'
  >('Internal Hackathon');
  const [hackMode, setHackMode] = useState<EventItem['mode']>('Offline · AVCOE Campus');
  const [hackDate, setHackDate] = useState('Apr 18 – Apr 19 · 9:00 AM');
  const [hackPrize, setHackPrize] = useState('₹30,000 Pool + SIH Wildcard');
  const [hackMaxSeats, setHackMaxSeats] = useState('180');
  const [hackXp, setHackXp] = useState('250');
  const [hackDesc, setHackDesc] = useState('');
  const [hackBannerUrl, setHackBannerUrl] = useState<string | undefined>(undefined);

  // === POST EVENT FORM STATE ===
  const [evtTitle, setEvtTitle] = useState('');
  const [evtCategory, setEvtCategory] = useState<'Coding Competition' | 'Guest Lecture'>(
    'Coding Competition'
  );
  const [evtMode, setEvtMode] = useState<EventItem['mode']>('Hybrid · Online + Lab');
  const [evtDate, setEvtDate] = useState('May 04 · 3:00 PM');
  const [evtPrize, setEvtPrize] = useState('Merit Certificates + Swag Kit');
  const [evtMaxSeats, setEvtMaxSeats] = useState('120');
  const [evtXp, setEvtXp] = useState('150');
  const [evtDesc, setEvtDesc] = useState('');
  const [evtBannerUrl, setEvtBannerUrl] = useState<string | undefined>(undefined);

  // === SCHEDULE LIVE SESSION FORM STATE ===
  const [sessTitle, setSessTitle] = useState('');
  const [sessTrack, setSessTrack] = useState('Web & Full-Stack');
  const [sessMode, setSessMode] = useState<LiveSession['mode']>('Offline');
  const [sessInstructor, setSessInstructor] = useState('Prof. Deshmukh & Core Team');
  const [sessDate, setSessDate] = useState('Sat, 28 Mar');
  const [sessTime, setSessTime] = useState('11:00 AM – 01:00 PM');
  const [sessVenue, setSessVenue] = useState('AVCOE Seminar Hall B');
  const [sessCode, setSessCode] = useState('ARG-LAB9');
  const [sessXp, setSessXp] = useState('120');

  // === UPLOAD BADGE FORM STATE ===
  const [badgeName, setBadgeName] = useState('');
  const [badgeCategory, setBadgeCategory] = useState<BadgeItem['category']>('Hackathon');
  const [badgeDesc, setBadgeDesc] = useState('');
  const [badgeRule, setBadgeRule] = useState('Ship a verified prototype in ARGON Hackathon');
  const [badgeXp, setBadgeXp] = useState('200');
  const [badgeColor, setBadgeColor] = useState<BadgeItem['colorScheme']>('orange');
  const [badgeIcon, setBadgeIcon] = useState<BadgeItem['iconName']>('trophy');
  const [badgeUnlocked, setBadgeUnlocked] = useState(true);
  const [badgeImagePreview, setBadgeImagePreview] = useState<string | undefined>(undefined);
  const [badgeUploadError, setBadgeUploadError] = useState<string | null>(null);

  // === OVERVIEW XP GRANT & PROJECTS & BROADCAST STATE ===
  const [xpAmount, setXpAmount] = useState('150');
  const [xpReason, setXpReason] = useState('Lab Mentor Bonus · AVCOE Sprint');
  const [projQuery, setProjQuery] = useState('');
  const [projStatusFilter, setProjStatusFilter] = useState<'All' | ProjectItem['status']>('All');
  const [bcTitle, setBcTitle] = useState('');
  const [bcDetail, setBcDetail] = useState('');
  const [bcTarget, setBcTarget] = useState<NavTab>('hackathon');

  // === HACKATHON ROSTERS & TEAM ASSIGNMENT STATE ===
  const [rosterEventId, setRosterEventId] = useState<string>('ALL');
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterTeamFilter, setRosterTeamFilter] = useState<string>('ALL');
  const [selectedRosterUserIds, setSelectedRosterUserIds] = useState<string[]>([]);
  const [bulkTargetTeamId, setBulkTargetTeamId] = useState<string>(managedTeams[0]?.id || '');
  const [quickTeamName, setQuickTeamName] = useState('');
  const [quickTeamCode, setQuickTeamCode] = useState('');
  const [quickTeamLogo, setQuickTeamLogo] = useState<string | undefined>(undefined);
  const [quickTeamError, setQuickTeamError] = useState<string | null>(null);

  useEffect(() => {
    if (!bulkTargetTeamId && managedTeams.length > 0) {
      setBulkTargetTeamId(managedTeams[0].id);
    }
  }, [managedTeams, bulkTargetTeamId]);

  const rosterEntries = useMemo(() => {
    const q = rosterSearch.trim().toLowerCase();
    return eventRegistrations
      .map((reg) => {
        const liveUser = managedUsers.find((u) => u.id === reg.userId);
        const teamId = liveUser ? liveUser.teamId : reg.teamId;
        const liveTeam = managedTeams.find((t) => t.id === teamId);
        return {
          ...reg,
          teamId,
          teamName: liveTeam?.name || liveUser?.teamName || reg.teamName || 'Unassigned',
          teamLogo: liveTeam?.logoDataUrl,
          teamCode: liveTeam?.code,
        };
      })
      .filter((reg) => {
        if (rosterEventId !== 'ALL' && reg.eventId !== rosterEventId) return false;
        if (rosterTeamFilter === 'UNASSIGNED' && reg.teamId) return false;
        if (
          rosterTeamFilter !== 'ALL' &&
          rosterTeamFilter !== 'UNASSIGNED' &&
          reg.teamId !== rosterTeamFilter
        ) {
          return false;
        }
        if (
          q &&
          !reg.userName.toLowerCase().includes(q) &&
          !reg.userEmail.toLowerCase().includes(q) &&
          !reg.eventTitle.toLowerCase().includes(q) &&
          !reg.teamName.toLowerCase().includes(q) &&
          !(reg.trackPreference || '').toLowerCase().includes(q)
        ) {
          return false;
        }
        return true;
      });
  }, [eventRegistrations, managedUsers, managedTeams, rosterEventId, rosterTeamFilter, rosterSearch]);

  const rosterUniqueUserIds = useMemo(
    () => Array.from(new Set(rosterEntries.map((r) => r.userId))),
    [rosterEntries]
  );

  const rosterUnassignedUserIds = useMemo(
    () => Array.from(new Set(rosterEntries.filter((r) => !r.teamId).map((r) => r.userId))),
    [rosterEntries]
  );

  const toggleRosterUserSelection = (userId: string) => {
    setSelectedRosterUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleQuickTeamLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQuickTeamError(null);
    try {
      const dataUrl = await readAndCompressImageFile(file, 256);
      setQuickTeamLogo(dataUrl);
    } catch (err) {
      setQuickTeamError(err instanceof Error ? err.message : 'Invalid logo image.');
    }
    e.target.value = '';
  };

  const handleQuickCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTeamName.trim()) return;
    const selectedEv = events.find((ev) => ev.id === rosterEventId);
    adminCreateTeam({
      name: quickTeamName,
      code: quickTeamCode,
      tagline: `Squad formed for ${selectedEv?.title || 'ARGON Hackathon'}`,
      hackathonTarget: selectedEv?.title || 'ARGON Hackathon 2026',
      logoDataUrl: quickTeamLogo,
    });
    setQuickTeamName('');
    setQuickTeamCode('');
    setQuickTeamLogo(undefined);
  };

  const pendingProjects = useMemo(
    () => projects.filter((p) => p.status === 'In Review'),
    [projects]
  );

  const filteredProjects = useMemo(() => {
    const q = projQuery.trim().toLowerCase();
    return projects.filter((p) => {
      if (projStatusFilter !== 'All' && p.status !== projStatusFilter) return false;
      if (
        q &&
        !p.title.toLowerCase().includes(q) &&
        !p.teamName.toLowerCase().includes(q) &&
        !p.track.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [projects, projQuery, projStatusFilter]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return managedUsers.filter((u) => {
      if (userTeamFilter === 'UNASSIGNED' && u.teamId) return false;
      if (userTeamFilter !== 'ALL' && userTeamFilter !== 'UNASSIGNED' && u.teamId !== userTeamFilter) {
        return false;
      }
      if (
        q &&
        !u.name.toLowerCase().includes(q) &&
        !u.email.toLowerCase().includes(q) &&
        !u.teamName.toLowerCase().includes(q) &&
        !u.branch.toLowerCase().includes(q) &&
        !u.role.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [managedUsers, userSearch, userTeamFilter]);

  const hackathonEvents = useMemo(
    () =>
      events.filter(
        (e) =>
          e.category === 'Internal Hackathon' ||
          e.category === 'National Hackathon' ||
          e.category === 'Innovation Challenge'
      ),
    [events]
  );

  const generalEvents = useMemo(
    () =>
      events.filter(
        (e) => e.category === 'Coding Competition' || e.category === 'Guest Lecture'
      ),
    [events]
  );

  // Handlers
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    const created = adminAddUser({
      name: newUserName,
      email: newUserEmail,
      branch: newUserBranch,
      year: newUserYear,
      role: newUserRole,
      teamId: newUserTeamId,
      defaultPassword: newUserPassword,
    });
    setLastCreatedUser(created);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPassword(generateDefaultPassword());
  };

  const handleCopyPassword = async (userId: string, pwd: string) => {
    try {
      await navigator.clipboard.writeText(pwd);
      setCopiedUserId(userId);
      window.setTimeout(() => setCopiedUserId((curr) => (curr === userId ? null : curr)), 1800);
    } catch {
      // Clipboard blocked in restricted context
    }
  };

  const handleNewTeamLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTeamLogoError(null);
    try {
      const dataUrl = await readAndCompressImageFile(file, 256);
      setTeamLogoPreview(dataUrl);
    } catch (err) {
      setTeamLogoError(err instanceof Error ? err.message : 'Could not load image.');
    }
    e.target.value = '';
  };

  const handleExistingTeamLogoUpload = async (
    teamId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTeamLogoError(null);
    try {
      const dataUrl = await readAndCompressImageFile(file, 256);
      adminUpdateTeamLogo(teamId, dataUrl);
    } catch (err) {
      setTeamLogoError(err instanceof Error ? err.message : 'Could not upload team logo.');
    }
    e.target.value = '';
  };

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    adminCreateTeam({
      name: teamName,
      code: teamCode,
      tagline: teamTagline,
      hackathonTarget: teamHackathon,
      logoDataUrl: teamLogoPreview,
    });
    setTeamName('');
    setTeamCode('');
    setTeamTagline('');
    setTeamLogoPreview(undefined);
  };

  const handleCreateHackathon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hackTitle.trim()) return;
    adminCreateEvent({
      title: hackTitle,
      category: hackCategory,
      mode: hackMode,
      dateDisplay: hackDate,
      prizeOrOutcome: hackPrize,
      xpReward: Number(hackXp) || 250,
      maxParticipants: Number(hackMaxSeats) || 180,
      description: hackDesc,
      imageUrl: hackBannerUrl,
    });
    setHackTitle('');
    setHackDesc('');
    setHackBannerUrl(undefined);
  };

  const handlePostEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle.trim()) return;
    adminCreateEvent({
      title: evtTitle,
      category: evtCategory,
      mode: evtMode,
      dateDisplay: evtDate,
      prizeOrOutcome: evtPrize,
      xpReward: Number(evtXp) || 150,
      maxParticipants: Number(evtMaxSeats) || 120,
      description: evtDesc,
      imageUrl: evtBannerUrl,
    });
    setEvtTitle('');
    setEvtDesc('');
    setEvtBannerUrl(undefined);
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessTitle.trim()) return;
    adminCreateSession({
      title: sessTitle,
      mode: sessMode,
      track: sessTrack,
      dateLabel: sessDate,
      timeRange: sessTime,
      venueOrLink: sessVenue,
      instructor: sessInstructor,
      durationHrs: 2,
      xpReward: Number(sessXp) || 120,
      checkInCode: sessCode,
      seatsTotal: 80,
    });
    setSessTitle('');
    setSessCode(`ARG-${Math.floor(100 + Math.random() * 900)}`);
  };

  const handleBadgeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBadgeUploadError(null);
    try {
      const dataUrl = await readAndCompressImageFile(file, 256);
      setBadgeImagePreview(dataUrl);
    } catch (err) {
      setBadgeUploadError(err instanceof Error ? err.message : 'Invalid image file.');
    }
    e.target.value = '';
  };

  const handleUploadBadge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeName.trim()) return;
    adminUploadBadge({
      name: badgeName,
      category: badgeCategory,
      description: badgeDesc,
      rule: badgeRule,
      xpBonus: Number(badgeXp) || 200,
      unlocked: badgeUnlocked,
      imageUrl: badgeImagePreview,
      iconName: badgeIcon,
      colorScheme: badgeColor,
    });
    setBadgeName('');
    setBadgeDesc('');
    setBadgeImagePreview(undefined);
  };

  const handleGrantXp = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Math.max(10, Math.min(2000, Number(xpAmount) || 100));
    awardXp(num, xpReason.trim() || 'Admin XP Grant');
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcTitle.trim() || !bcDetail.trim()) return;
    adminBroadcastAnnouncement(bcTitle, bcDetail, bcTarget);
    setBcTitle('');
    setBcDetail('');
  };

  const sectionTabs: { id: AdminSection; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'registrations', label: 'Hackathon Rosters', count: eventRegistrations.length },
    { id: 'users', label: 'Users & Email', count: managedUsers.length },
    { id: 'teams', label: 'Teams & Logos', count: managedTeams.length },
    { id: 'hackathons-events', label: 'Hackathons & Events', count: events.length },
    { id: 'badges-certs', label: 'Badges & Certs', count: badges.length },
    { id: 'projects-broadcast', label: 'Projects & Broadcast' },
  ];

  const previewBadgeObj: BadgeItem = {
    id: 'preview-badge',
    name: badgeName || 'New Badge',
    category: badgeCategory,
    description: badgeDesc || 'Preview of uploaded badge artwork',
    rule: badgeRule,
    unlocked: badgeUnlocked,
    colorScheme: badgeColor,
    iconName: badgeIcon,
    imageUrl: badgeImagePreview,
    xpBonus: Number(badgeXp) || 200,
  };

  return (
    <div className="space-y-6">
      {/* 1. HEADER + SECTION NAVIGATION */}
      <section className="flex flex-col gap-4 pt-1">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 border border-[#000000]"
              style={{
                backgroundColor: isMaterial ? materialPalette.primaryContainer : '#000000',
                color: isMaterial ? materialPalette.onPrimaryContainer : '#F95C4B',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[24px] sm:text-[28px] font-bold tracking-[-0.025em] text-[#000000]">
                  Admin Panel
                </h1>
                <span className="px-2.5 py-0.5 rounded-[8px] bg-[#F95C4B] text-[#F6F4F1] text-[11px] font-bold border border-[#000000]">
                  Core Lead
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#4C4841]">
                Create hackathons, post events, manage teams &amp; logos, upload badges, and onboard users with Gmail password delivery.
              </p>
            </div>
          </div>

          {/* Persistent Compact Gmail Status / Sign-in Control */}
          <div className="flex items-center gap-2.5 shrink-0">
            {gmailConnected ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-[12px] bg-[#E4DED2] border border-[#000000]">
                <Mail size={14} className="text-[#F95C4B] shrink-0" />
                <span className="text-xs font-bold text-[#000000] max-w-[190px] truncate">
                  {gmailUserEmail}
                </span>
                <button
                  type="button"
                  onClick={handleDisconnectGmail}
                  title="Sign out Gmail"
                  className="p-1 rounded-[8px] bg-[#000000] text-[#F6F4F1] hover:bg-[#F95C4B] transition-colors cursor-pointer"
                >
                  <LogOut size={12} />
                </button>
              </div>
            ) : (
              <GoogleSignInButton
                onClick={handleConnectGmail}
                loading={gmailSigningIn}
                label="Connect Gmail"
              />
            )}
          </div>
        </div>

        {/* Section Tabs — single scrollable row on mobile */}
        <div className="flex flex-nowrap sm:flex-wrap items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1">
          {sectionTabs.map((t) => {
            const active = section === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSection(t.id)}
                className="px-3 sm:px-3.5 py-2 rounded-[11px] sm:rounded-[12px] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5 shrink-0"
                style={{
                  backgroundColor: active
                    ? isMaterial
                      ? materialPalette.primary
                      : '#000000'
                    : isMaterial
                    ? materialPalette.surfaceCard
                    : '#E4DED2',
                  color: active
                    ? '#F6F4F1'
                    : isMaterial
                    ? materialPalette.onSurface
                    : '#000000',
                  border: isMaterial
                    ? `1px solid ${active ? materialPalette.primary : materialPalette.outlineVariant}`
                    : '1.25px solid #000000',
                }}
              >
                <span>{t.label}</span>
                {typeof t.count === 'number' && (
                  <span
                    className="px-1.5 py-0.2 rounded-[6px] font-mono text-[10px] font-bold"
                    style={{
                      backgroundColor: active ? '#F95C4B' : '#F6F4F1',
                      color: active ? '#F6F4F1' : '#000000',
                    }}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. FOUR EDITORIAL KPI CARDS — compact 2x2 grid on mobile */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-4">
        {[
          {
            label: 'Managed Users',
            value: String(managedUsers.length),
            sub: `${totalCommunityStudents.toLocaleString()} campus members`,
            icon: Users,
            cardClass: 'argon-card-stone',
            isDark: false,
            chipBg: '#000000',
            chipFg: '#F6F4F1',
            target: 'users' as AdminSection,
          },
          {
            label: 'Teams & Logos',
            value: String(managedTeams.length),
            sub: `${managedTeams.filter((t) => Boolean(t.logoDataUrl)).length} custom logos uploaded`,
            icon: ShieldCheck,
            cardClass: 'argon-card-black',
            isDark: true,
            chipBg: '#F95C4B',
            chipFg: '#F6F4F1',
            target: 'teams' as AdminSection,
          },
          {
            label: 'Hackathon Rosters',
            value: String(eventRegistrations.length),
            sub: `${hackathonEvents.length} hackathons · ${events.length} total events`,
            icon: Rocket,
            cardClass: 'argon-card-coral',
            isDark: false,
            chipBg: '#000000',
            chipFg: '#F6F4F1',
            target: 'registrations' as AdminSection,
          },
          {
            label: 'Badges & Projects',
            value: String(badges.length),
            sub: `${pendingProjects.length} projects pending review`,
            icon: Award,
            cardClass: 'argon-card-stone',
            isDark: false,
            chipBg: '#F95C4B',
            chipFg: '#F6F4F1',
            target: 'badges-certs' as AdminSection,
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          const fgMain = kpi.isDark ? '#F6F4F1' : '#000000';
          const fgSub = kpi.isDark ? '#E4DED2' : '#2C2A26';
          return (
            <button
              key={kpi.label}
              type="button"
              onClick={() => setSection(kpi.target)}
              className={`${kpi.cardClass} p-3 sm:p-5 flex items-center gap-2.5 sm:gap-4 text-left cursor-pointer`}
            >
              <div
                className="w-9 h-9 sm:w-12 sm:h-12 rounded-[11px] sm:rounded-[14px] flex items-center justify-center shrink-0 border border-[#000000]"
                style={{
                  backgroundColor: isMaterial ? materialPalette.primary : kpi.chipBg,
                  color: isMaterial ? materialPalette.onPrimary : kpi.chipFg,
                }}
              >
                <Icon size={17} strokeWidth={2.1} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs font-semibold truncate" style={{ color: fgSub }}>
                  {kpi.label}
                </p>
                <p
                  className="text-[20px] sm:text-[24px] font-extrabold font-mono tracking-[-0.03em] tabular-nums leading-tight mt-0.5"
                  style={{ color: fgMain }}
                >
                  {kpi.value}
                </p>
                <p className="hidden sm:block text-[11px] truncate mt-0.5 opacity-85" style={{ color: fgSub }}>
                  {kpi.sub}
                </p>
              </div>
            </button>
          );
        })}
      </section>

      {/* 3. OVERVIEW TAB */}
      {section === 'overview' && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-8 space-y-5">
            {/* Quick Admin Action Launchpad */}
            <div className="argon-card-stone p-6">
              <h2 className="text-[18px] font-bold text-[#000000]">Quick Admin Actions</h2>
              <p className="text-xs text-[#4C4841] mt-0.5">
                Jump directly into any club management workflow.
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    title: 'Hackathon Rosters & Team Assign',
                    desc: 'View registered students per hackathon, create teams, and assign everyone.',
                    icon: ClipboardCheck,
                    tab: 'registrations' as AdminSection,
                    accent: '#F95C4B',
                  },
                  {
                    title: 'Add User & Email Password',
                    desc: 'Auto-generate default credentials, assign a team, and send via Gmail.',
                    icon: UserPlus,
                    tab: 'users' as AdminSection,
                    accent: '#000000',
                  },
                  {
                    title: 'Create Team & Assign Logo',
                    desc: 'Build squads, upload custom team emblems, and manage rosters.',
                    icon: ImagePlus,
                    tab: 'teams' as AdminSection,
                    accent: '#000000',
                  },
                  {
                    title: 'Add Hackathon / Post Event',
                    desc: 'Publish hackathons, coding contests, lectures, and live sessions.',
                    icon: Rocket,
                    tab: 'hackathons-events' as AdminSection,
                    accent: '#F95C4B',
                  },
                ].map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.title}
                      type="button"
                      onClick={() => setSection(act.tab)}
                      className="p-4 rounded-[16px] bg-[#F6F4F1] border border-[#000000] text-left flex items-start gap-3 cursor-pointer hover:bg-[#E4DED2] transition-colors"
                    >
                      <div
                        className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 border border-[#000000]"
                        style={{ backgroundColor: act.accent, color: '#F6F4F1' }}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#000000]">{act.title}</p>
                        <p className="text-xs text-[#4C4841] mt-0.5 leading-snug">{act.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Project Moderation Queue */}
            <div className="argon-card-stone p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-[18px] font-bold text-[#000000]">
                    Project Review &amp; Judging Queue
                  </h2>
                  <p className="text-xs text-[#4C4841] mt-0.5">
                    Approve deployed MVPs or crown Hackathon Winners — updates Projects Showcase live.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSection('projects-broadcast')}
                  className="text-xs font-bold text-[#F95C4B] hover:underline cursor-pointer shrink-0"
                >
                  Manage all ({projects.length})
                </button>
              </div>

              <div className="space-y-3">
                {projects.length === 0 ? (
                  <div className="p-5 rounded-[14px] bg-[#F6F4F1] border border-[#000000]/20 text-center">
                    <p className="text-xs font-bold text-[#000000]">No student projects submitted yet</p>
                    <p className="text-[11px] text-[#4C4841] mt-0.5">
                      Submitted prototypes will appear here for approval or winner selection.
                    </p>
                  </div>
                ) : (
                  projects.slice(0, 4).map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-[16px] bg-[#F6F4F1] border border-[#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-[#000000] truncate">
                          {proj.title}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-[8px] text-[10.5px] font-bold border border-[#000000] ${
                            proj.status === 'Hackathon Winner'
                              ? 'bg-[#F95C4B] text-[#F6F4F1]'
                              : proj.status === 'Deployed'
                              ? 'bg-[#000000] text-[#F6F4F1]'
                              : 'bg-[#E4DED2] text-[#000000]'
                          }`}
                        >
                          {proj.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#4C4841] mt-0.5">
                        {proj.teamName} · {proj.track} · {proj.upvotes} upvotes
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => adminUpdateProjectStatus(proj.id, 'Deployed')}
                        className="px-3 py-1.5 rounded-[10px] bg-[#000000] text-[#F6F4F1] text-xs font-semibold cursor-pointer hover:bg-[#1F1E1C] transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => adminUpdateProjectStatus(proj.id, 'Hackathon Winner')}
                        className="px-3 py-1.5 rounded-[10px] bg-[#F95C4B] text-[#F6F4F1] border border-[#000000] text-xs font-semibold inline-flex items-center gap-1 cursor-pointer hover:bg-[#E64C3B] transition-colors"
                      >
                        <Trophy size={12} />
                        <span>Winner</span>
                      </button>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Direct XP Award + Broadcast Card */}
          <aside className="lg:col-span-4 space-y-5 flex flex-col">
            <form
              onSubmit={handleGrantXp}
              className="argon-card-black p-6 flex flex-col justify-between gap-4"
            >
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-[#F95C4B] text-[#F6F4F1] text-xs font-bold">
                  <Zap size={13} />
                  <span>Direct XP Award</span>
                </span>
                <h3 className="mt-3 text-[20px] font-bold text-[#F6F4F1] leading-snug">
                  Grant Bonus XP to Active Student
                </h3>
                <p className="mt-1 text-xs text-[#E4DED2] leading-relaxed">
                  Award instant XP for offline lab mentoring, bug bounties, or hackathon demos.
                </p>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#E4DED2] mb-1">
                      XP Amount
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={2000}
                      step={10}
                      value={xpAmount}
                      onChange={(e) => setXpAmount(e.target.value)}
                      className="w-full h-10 px-3 rounded-[12px] bg-[#F6F4F1] text-[#000000] font-mono text-sm font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#E4DED2] mb-1">
                      Award Reason
                    </label>
                    <input
                      type="text"
                      value={xpReason}
                      onChange={(e) => setXpReason(e.target.value)}
                      className="w-full h-10 px-3 rounded-[12px] bg-[#F6F4F1] text-[#000000] text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="argon-btn-primary w-full py-3 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer border-0"
              >
                <Zap size={14} />
                <span>Grant +{xpAmount || 0} XP Now</span>
              </button>
            </form>

            <div className="argon-card-coral p-6 flex flex-col justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-[#000000] text-[#F6F4F1] text-xs font-bold">
                  <Megaphone size={13} />
                  <span>Club Broadcast</span>
                </span>
                <h3 className="mt-3 text-[18px] font-bold text-[#000000] leading-snug">
                  Push Live Student Alert
                </h3>
                <p className="mt-1 text-xs text-[#1F1A18] leading-relaxed">
                  Send schedule updates, hackathon room changes, or deadline reminders directly to every student’s notification bell.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setSection('projects-broadcast')}
                  className="argon-btn-dark w-full py-2.5 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send size={13} />
                  <span>Open Broadcast Composer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('hackathon')}
                  className="w-full py-2 rounded-[12px] bg-[#F6F4F1] border border-[#000000] text-[#000000] text-xs font-bold cursor-pointer hover:bg-[#E4DED2] transition-colors"
                >
                  Preview Hackathon Hub
                </button>
              </div>
            </div>
          </aside>
        </section>
      )}

      {/* 4. USERS, TEAM ASSIGNMENT & GMAIL CREDENTIALS TAB */}
      {section === 'users' && (
        <section className="space-y-5">
          {/* Gmail Integration Status Bar */}
          <div className="argon-card-black p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-[#F95C4B] text-[#F6F4F1] border border-[#F6F4F1]/20 flex items-center justify-center shrink-0">
                <Mail size={18} />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#F6F4F1]">
                  Gmail Credential Delivery
                </h2>
                <p className="text-xs text-[#E4DED2] mt-0.5">
                  {gmailConnected
                    ? `Connected as ${gmailUserEmail}. You can review and email auto-generated default passwords to any user.`
                    : 'Sign in with Google to send auto-generated default passwords directly to newly added users via Gmail.'}
                </p>
                {gmailAuthError && (
                  <p className="text-xs text-[#F95C4B] font-semibold mt-1">{gmailAuthError}</p>
                )}
              </div>
            </div>

            <div className="shrink-0">
              {gmailConnected ? (
                <button
                  type="button"
                  onClick={handleDisconnectGmail}
                  className="px-3.5 py-2 rounded-[10px] bg-[#F6F4F1] text-[#000000] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer hover:bg-[#E4DED2]"
                >
                  <LogOut size={13} />
                  <span>Disconnect Gmail</span>
                </button>
              ) : (
                <GoogleSignInButton onClick={handleConnectGmail} loading={gmailSigningIn} />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            {/* Add User Form — collapsible on mobile so directory is immediately visible */}
            <div className="xl:col-span-5 argon-card-stone p-4 sm:p-6 space-y-3.5 sm:space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-[16px] sm:text-[18px] font-bold text-[#000000]">Add New User</h2>
                  <p className="text-xs text-[#4C4841]">
                    Auto-creates a default password and assigns the user to a team.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleMobileForm('users')}
                  className="xl:hidden px-3 py-1.5 rounded-[10px] bg-[#000000] text-[#F6F4F1] text-xs font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus size={13} />
                  <span>{mobileFormOpen.users ? 'Hide Form' : 'Add User'}</span>
                </button>
                <UserPlus size={18} className="hidden xl:block text-[#F95C4B]" />
              </div>

              <form
                onSubmit={handleAddUser}
                className={`${mobileFormOpen.users ? 'block' : 'hidden xl:block'} p-4 rounded-[18px] bg-[#F6F4F1] border border-[#000000] space-y-3`}
              >
                <div>
                  <label className="block text-[11px] font-bold text-[#000000] mb-1">
                    Full Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g., Omkar Deshmukh"
                    className="w-full h-10 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#000000] mb-1">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="e.g., omkar.deshmukh@avcoe.edu.in"
                    className="w-full h-10 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">
                      Branch
                    </label>
                    <select
                      value={newUserBranch}
                      onChange={(e) => setNewUserBranch(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs font-semibold text-[#000000]"
                    >
                      <option value="Computer Engg.">Computer Engg.</option>
                      <option value="IT Engg.">IT Engg.</option>
                      <option value="AI & DS">AI &amp; DS</option>
                      <option value="E&TC Engg.">E&amp;TC Engg.</option>
                      <option value="Mechanical Engg.">Mechanical Engg.</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">Year</label>
                    <select
                      value={newUserYear}
                      onChange={(e) => setNewUserYear(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs font-semibold text-[#000000]"
                    >
                      <option value="FE">FE</option>
                      <option value="SE">SE</option>
                      <option value="TE">TE</option>
                      <option value="BE">BE</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as ManagedUser['role'])}
                      className="w-full h-9 px-2.5 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs font-semibold text-[#000000]"
                    >
                      <option value="Student">Student</option>
                      <option value="Team Lead">Team Lead</option>
                      <option value="Mentor">Mentor</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">
                      Assign Team
                    </label>
                    <select
                      value={newUserTeamId}
                      onChange={(e) => setNewUserTeamId(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs font-semibold text-[#000000]"
                    >
                      <option value="">Unassigned</option>
                      {managedTeams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Auto-Generated Default Password */}
                <div>
                  <label className="block text-[11px] font-bold text-[#000000] mb-1">
                    Default Password (Auto-Generated)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <KeyRound
                        size={13}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F95C4B]"
                      />
                      <input
                        type="text"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        className="w-full h-10 pl-8 pr-3 rounded-[10px] bg-[#E4DED2] border border-[#000000] font-mono text-xs font-bold text-[#000000] focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewUserPassword(generateDefaultPassword())}
                      title="Regenerate default password"
                      className="h-10 px-3 rounded-[10px] bg-[#000000] text-[#F6F4F1] text-xs font-bold inline-flex items-center gap-1 cursor-pointer hover:bg-[#1F1E1C] shrink-0"
                    >
                      <RefreshCw size={13} />
                      <span>New</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="argon-btn-primary w-full py-2.5 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus size={14} />
                  <span>Create User Account</span>
                </button>
              </form>

              {/* Post-Creation Immediate Email Banner */}
              {lastCreatedUser && (
                <div className="p-4 rounded-[16px] bg-[#F95C4B] border border-[#000000] space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#000000]">
                        User Created Successfully
                      </p>
                      <p className="text-sm font-bold text-[#000000] mt-0.5">
                        {lastCreatedUser.name} ({lastCreatedUser.email})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLastCreatedUser(null)}
                      aria-label="Dismiss banner"
                      className="p-1 rounded-[8px] bg-[#000000] text-[#F6F4F1] cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>

                  <div className="px-3 py-2 rounded-[10px] bg-[#F6F4F1] border border-[#000000] flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#4C4841]">Default Password:</span>
                    <span className="font-mono text-xs font-extrabold text-[#000000]">
                      {lastCreatedUser.defaultPassword}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openEmailConfirmation(lastCreatedUser)}
                    className="w-full py-2.5 rounded-[12px] bg-[#000000] text-[#F6F4F1] text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#1F1E1C]"
                  >
                    <Mail size={14} />
                    <span>
                      {lastCreatedUser.passwordEmailedAt
                        ? 'Resend Default Password via Gmail'
                        : 'Send Default Password via Gmail'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* User Directory, Team Reassignment, Password Controls & Delete */}
            <div className="xl:col-span-7 argon-card-stone p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-[18px] font-bold text-[#000000]">
                    User Directory ({filteredUsers.length})
                  </h2>
                  <p className="text-xs text-[#4C4841]">
                    Reassign teams inline, view/regenerate default passwords, email credentials, or delete users.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4C4841]"
                    />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search user or email..."
                      className="h-9 pl-8 pr-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none w-44"
                    />
                  </div>
                  <select
                    value={userTeamFilter}
                    onChange={(e) => setUserTeamFilter(e.target.value)}
                    className="h-9 px-2.5 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs font-semibold text-[#000000]"
                  >
                    <option value="ALL">All Teams</option>
                    <option value="UNASSIGNED">Unassigned</option>
                    {managedTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
                {filteredUsers.map((u) => {
                  const pwdVisible = Boolean(visiblePasswords[u.id]);
                  const confirmingDelete = confirmDeleteUserId === u.id;
                  return (
                    <div
                      key={u.id}
                      className="p-4 rounded-[16px] bg-[#F6F4F1] border border-[#000000] space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-10 h-10 rounded-[12px] bg-[#000000] text-[#F6F4F1] text-xs font-bold flex items-center justify-center shrink-0">
                            {u.initials}
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <p className="text-sm font-bold text-[#000000] truncate">{u.name}</p>
                              <span
                                className={`px-2 py-0.5 rounded-[6px] text-[10px] font-bold border border-[#000000] ${
                                  u.role === 'Admin'
                                    ? 'bg-[#F95C4B] text-[#F6F4F1]'
                                    : u.role === 'Team Lead'
                                    ? 'bg-[#000000] text-[#F6F4F1]'
                                    : 'bg-[#E4DED2] text-[#000000]'
                                }`}
                              >
                                {u.role}
                              </span>
                              {u.passwordEmailedAt && (
                                <span className="px-2 py-0.5 rounded-[6px] bg-[#E4DED2] border border-[#000000] text-[10px] font-bold text-[#000000] inline-flex items-center gap-1">
                                  <CheckCircle2 size={10} className="text-[#F95C4B]" />
                                  {u.passwordEmailedAt}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#4C4841] truncate mt-0.5">
                              {u.email} · {u.branch} ({u.year})
                            </p>
                          </div>
                        </div>

                        {/* Inline Team Assignment Select */}
                        <div className="flex items-center gap-2 shrink-0">
                          <label className="text-[10.5px] font-bold text-[#4C4841] hidden sm:inline">
                            Team:
                          </label>
                          <select
                            value={u.teamId}
                            onChange={(e) => adminAssignUserTeam(u.id, e.target.value)}
                            aria-label={`Assign team for ${u.name}`}
                            className="h-8 px-2.5 rounded-[10px] bg-[#E4DED2] border border-[#000000] text-xs font-bold text-[#000000] cursor-pointer max-w-[165px]"
                          >
                            <option value="">Unassigned</option>
                            {managedTeams.map((team) => (
                              <option key={team.id} value={team.id}>
                                {team.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Password + Actions Bar */}
                      <div className="pt-2.5 border-t border-black/15 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {u.defaultPassword ? (
                            <>
                              <span className="px-2.5 py-1 rounded-[8px] bg-[#E4DED2] border border-[#000000] font-mono text-[11px] font-bold text-[#000000]">
                                {pwdVisible ? u.defaultPassword : 'ARG-••••-••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setVisiblePasswords((prev) => ({ ...prev, [u.id]: !prev[u.id] }))
                                }
                                title={pwdVisible ? 'Hide password' : 'Show password'}
                                className="p-1.5 rounded-[8px] bg-[#E4DED2] border border-[#000000] text-[#000000] hover:bg-[#000000] hover:text-[#F6F4F1] transition-colors cursor-pointer"
                              >
                                {pwdVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleCopyPassword(u.id, u.defaultPassword)}
                                title="Copy default password"
                                className="p-1.5 rounded-[8px] bg-[#E4DED2] border border-[#000000] text-[#000000] hover:bg-[#000000] hover:text-[#F6F4F1] transition-colors cursor-pointer"
                              >
                                {copiedUserId === u.id ? <Check size={12} /> : <Copy size={12} />}
                              </button>
                            </>
                          ) : (
                            <span className="px-2.5 py-1 rounded-[8px] bg-[#E4DED2] border border-[#000000] text-[11px] font-bold text-[#000000] inline-flex items-center gap-1">
                              <Lock size={11} className="text-[#F95C4B]" />
                              <span>Personal password set</span>
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => adminRegenerateUserPassword(u.id)}
                            title="Issue new temporary default password"
                            className="p-1.5 rounded-[8px] bg-[#E4DED2] border border-[#000000] text-[#000000] hover:bg-[#000000] hover:text-[#F6F4F1] transition-colors cursor-pointer"
                          >
                            <RefreshCw size={12} />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={!u.defaultPassword}
                            onClick={() => openEmailConfirmation(u)}
                            title={
                              u.defaultPassword
                                ? 'Review and email temporary default password'
                                : 'Member set a personal password. Click reset icon first to issue a new temporary password.'
                            }
                            className="px-3 py-1.5 rounded-[10px] bg-[#F95C4B] border border-[#000000] text-[#F6F4F1] text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer hover:bg-[#E64C3B] transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
                          >
                            <Mail size={12} />
                            <span>Email Password</span>
                          </button>

                          {confirmingDelete ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  adminDeleteUser(u.id);
                                  setConfirmDeleteUserId(null);
                                }}
                                className="px-2.5 py-1.5 rounded-[10px] bg-[#000000] text-[#F6F4F1] text-[11px] font-bold cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteUserId(null)}
                                className="px-2 py-1.5 rounded-[10px] bg-[#E4DED2] border border-[#000000] text-[#000000] text-[11px] font-bold cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteUserId(u.id)}
                              aria-label={`Delete ${u.name}`}
                              className="p-1.5 rounded-[10px] bg-[#000000] text-[#F6F4F1] hover:bg-[#F95C4B] transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <div className="p-8 rounded-[16px] bg-[#F6F4F1] border border-[#000000] text-center text-xs text-[#4C4841]">
                    No users match the current filter.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. TEAMS & LOGOS TAB */}
      {section === 'teams' && (
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* Left: Make New Team + Upload Logo */}
          <div className="xl:col-span-4 argon-card-stone p-4 sm:p-6 space-y-3.5 sm:space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-[16px] sm:text-[18px] font-bold text-[#000000]">Create New Team</h2>
                <p className="text-xs text-[#4C4841]">
                  Assign a custom logo image — syncs to Leaderboard &amp; Team Workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleMobileForm('teams')}
                className="xl:hidden px-3 py-1.5 rounded-[10px] bg-[#000000] text-[#F6F4F1] text-xs font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus size={13} />
                <span>{mobileFormOpen.teams ? 'Hide' : 'New Team'}</span>
              </button>
              <Users size={18} className="hidden xl:block text-[#F95C4B]" />
            </div>

            <form
              onSubmit={handleCreateTeam}
              className={`${mobileFormOpen.teams ? 'block' : 'hidden xl:block'} p-4 rounded-[18px] bg-[#F6F4F1] border border-[#000000] space-y-3`}
            >
              {/* Logo Preview & Uploader */}
              <div className="flex items-center gap-3.5 p-3 rounded-[14px] bg-[#E4DED2] border border-[#000000]">
                <div className="w-14 h-14 rounded-[14px] bg-[#000000] text-[#F6F4F1] border border-[#000000] flex items-center justify-center overflow-hidden shrink-0">
                  {teamLogoPreview ? (
                    <img
                      src={teamLogoPreview}
                      alt="Team logo preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-mono text-sm font-bold text-[#F95C4B]">
                      {teamCode.trim().slice(0, 4).toUpperCase() || 'LOGO'}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="text-xs font-bold text-[#000000]">Team Logo (Optional)</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="px-2.5 py-1.5 rounded-[10px] bg-[#000000] text-[#F6F4F1] text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer hover:bg-[#1F1E1C]">
                      <ImagePlus size={12} />
                      <span>{teamLogoPreview ? 'Change Logo' : 'Upload Logo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleNewTeamLogoUpload}
                        className="hidden"
                      />
                    </label>
                    {teamLogoPreview && (
                      <button
                        type="button"
                        onClick={() => setTeamLogoPreview(undefined)}
                        className="px-2 py-1.5 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-[11px] font-bold text-[#000000] cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {teamLogoError && (
                <p className="text-xs font-semibold text-[#F95C4B]">{teamLogoError}</p>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#000000] mb-1">
                  Team Name *
                </label>
                <input
                  required
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., Quantum Builders"
                  className="w-full h-10 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#000000] mb-1">
                    Team Code
                  </label>
                  <input
                    type="text"
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value)}
                    placeholder="e.g., QB-09"
                    className="w-full h-9 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] font-mono text-xs font-bold text-[#000000] uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#000000] mb-1">
                    Target Hackathon
                  </label>
                  <input
                    type="text"
                    value={teamHackathon}
                    onChange={(e) => setTeamHackathon(e.target.value)}
                    className="w-full h-9 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#000000] mb-1">Tagline</label>
                <input
                  type="text"
                  value={teamTagline}
                  onChange={(e) => setTeamTagline(e.target.value)}
                  placeholder="e.g., Shipping full-stack AI tools for AVCOE"
                  className="w-full h-9 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000]"
                />
              </div>

              <button
                type="submit"
                className="argon-btn-primary w-full py-2.5 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>Create Team</span>
              </button>
            </form>
          </div>

          {/* Right: Existing Teams & Logo Assignment */}
          <div className="xl:col-span-8 argon-card-stone p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-[#000000]">
                  Club Teams ({managedTeams.length})
                </h2>
                <p className="text-xs text-[#4C4841]">
                  Assign or swap custom logos on any team and view assigned users.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSection('users')}
                className="text-xs font-bold text-[#F95C4B] hover:underline cursor-pointer"
              >
                Assign users to teams →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {managedTeams.map((team) => {
                const members = managedUsers.filter(
                  (u) => u.teamId === team.id || u.teamName === team.name
                );
                const confirmingDel = confirmDeleteTeamId === team.id;

                return (
                  <div
                    key={team.id}
                    className="p-4 rounded-[18px] bg-[#F6F4F1] border border-[#000000] flex flex-col justify-between gap-3.5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-[14px] bg-[#000000] text-[#F6F4F1] border border-[#000000] flex items-center justify-center overflow-hidden shrink-0">
                        {team.logoDataUrl ? (
                          <img
                            src={team.logoDataUrl}
                            alt={team.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-mono text-xs font-extrabold text-[#F95C4B]">
                            {team.code}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-bold text-[#000000] truncate">{team.name}</h3>
                          <span className="px-2 py-0.5 rounded-[6px] bg-[#E4DED2] border border-[#000000] font-mono text-[10px] font-bold text-[#000000]">
                            {team.code}
                          </span>
                          {team.isUserTeam && (
                            <span className="px-2 py-0.5 rounded-[6px] bg-[#F95C4B] text-[#F6F4F1] text-[10px] font-bold border border-[#000000]">
                              Active Squad
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#4C4841] mt-1 line-clamp-2">
                          {team.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Assigned Members */}
                    <div className="p-2.5 rounded-[12px] bg-[#E4DED2] border border-[#000000]">
                      <p className="text-[10.5px] font-bold text-[#000000] mb-1.5">
                        Assigned Members ({members.length})
                      </p>
                      {members.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {members.map((m) => (
                            <span
                              key={m.id}
                              className="px-2 py-0.5 rounded-[6px] bg-[#F6F4F1] border border-[#000000] text-[10.5px] font-semibold text-[#000000]"
                            >
                              {m.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-[#4C4841]">
                          No users assigned yet. Assign from Users tab.
                        </p>
                      )}
                    </div>

                    {/* Team Logo & Delete Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-1.5">
                        <label className="px-2.5 py-1.5 rounded-[10px] bg-[#000000] text-[#F6F4F1] text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer hover:bg-[#1F1E1C]">
                          <ImagePlus size={12} />
                          <span>{team.logoDataUrl ? 'Change Logo' : 'Assign Logo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleExistingTeamLogoUpload(team.id, e)}
                            className="hidden"
                          />
                        </label>

                        {team.logoDataUrl && (
                          <button
                            type="button"
                            onClick={() => adminUpdateTeamLogo(team.id, undefined)}
                            className="px-2.5 py-1.5 rounded-[10px] bg-[#E4DED2] border border-[#000000] text-[#000000] text-[11px] font-bold cursor-pointer hover:bg-[#F95C4B] hover:text-[#F6F4F1]"
                          >
                            Clear Logo
                          </button>
                        )}
                      </div>

                      {!team.isUserTeam && (
                        confirmingDel ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                adminDeleteTeam(team.id);
                                setConfirmDeleteTeamId(null);
                              }}
                              className="px-2.5 py-1.5 rounded-[10px] bg-[#F95C4B] border border-[#000000] text-[#F6F4F1] text-[11px] font-bold cursor-pointer"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteTeamId(null)}
                              className="px-2 py-1.5 rounded-[10px] bg-[#E4DED2] border border-[#000000] text-[#000000] text-[11px] font-bold cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteTeamId(team.id)}
                            aria-label={`Delete ${team.name}`}
                            className="p-1.5 rounded-[10px] bg-[#E4DED2] border border-[#000000] text-[#000000] hover:bg-[#F95C4B] hover:text-[#F6F4F1] transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 6. HACKATHONS, EVENTS & LIVE SESSIONS TAB */}
      {section === 'hackathons-events' && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            {/* Dedicated Add New Hackathon Card */}
            <div className="argon-card-stone p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[18px] font-bold text-[#000000]">Add New Hackathon</h2>
                  <p className="text-xs text-[#4C4841]">
                    Publishes directly to Hackathon Hub and student event feeds.
                  </p>
                </div>
                <Trophy size={18} className="text-[#F95C4B]" />
              </div>

              <form
                onSubmit={handleCreateHackathon}
                className="p-4 rounded-[18px] bg-[#F6F4F1] border border-[#000000] space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-bold text-[#000000] mb-1">
                    Hackathon Title *
                  </label>
                  <input
                    required
                    type="text"
                    value={hackTitle}
                    onChange={(e) => setHackTitle(e.target.value)}
                    placeholder="e.g., ARGON 24-Hour AI & Robotics Hackathon"
                    className="w-full h-10 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">
                      Hackathon Tier
                    </label>
                    <select
                      value={hackCategory}
                      onChange={(e) =>
                        setHackCategory(
                          e.target.value as
                            | 'Internal Hackathon'
                            | 'National Hackathon'
                            | 'Innovation Challenge'
                        )
                      }
                      className="w-full h-9 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs font-semibold text-[#000000]"
                    >
                      <option value="Internal Hackathon">Internal Hackathon</option>
                      <option value="National Hackathon">National Hackathon</option>
                      <option value="Innovation Challenge">Innovation Challenge</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">Mode</label>
                    <select
                      value={hackMode}
                      onChange={(e) => setHackMode(e.target.value as EventItem['mode'])}
                      className="w-full h-9 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs font-semibold text-[#000000]"
                    >
                      <option value="Offline · AVCOE Campus">Offline · AVCOE Campus</option>
                      <option value="Hybrid · Online + Lab">Hybrid · Online + Lab</option>
                      <option value="National · Online + Finals">National · Online + Finals</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">
                      Schedule Date
                    </label>
                    <input
                      type="text"
                      value={hackDate}
                      onChange={(e) => setHackDate(e.target.value)}
                      className="w-full h-9 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">
                      Prize Pool / Outcome
                    </label>
                    <input
                      type="text"
                      value={hackPrize}
                      onChange={(e) => setHackPrize(e.target.value)}
                      className="w-full h-9 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">
                      Max Seats
                    </label>
                    <input
                      type="number"
                      value={hackMaxSeats}
                      onChange={(e) => setHackMaxSeats(e.target.value)}
                      className="w-full h-9 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] font-mono text-xs font-bold text-[#000000]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">
                      XP Reward
                    </label>
                    <input
                      type="number"
                      value={hackXp}
                      onChange={(e) => setHackXp(e.target.value)}
                      className="w-full h-9 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] font-mono text-xs font-bold text-[#000000]"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="h-9 px-2.5 rounded-[10px] bg-[#E4DED2] border border-[#000000] text-[11px] font-bold text-[#000000] inline-flex items-center justify-center gap-1 cursor-pointer hover:bg-[#000000] hover:text-[#F6F4F1] transition-colors">
                      <ImagePlus size={12} />
                      <span>{hackBannerUrl ? 'Banner Set' : 'Cover Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const url = await readAndCompressImageFile(f, 640);
                          setHackBannerUrl(url);
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#000000] mb-1">
                    Tracks &amp; Rules Summary
                  </label>
                  <textarea
                    rows={2}
                    value={hackDesc}
                    onChange={(e) => setHackDesc(e.target.value)}
                    placeholder="Describe problem tracks, team size rules, and judging criteria..."
                    className="w-full p-2.5 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="argon-btn-primary w-full py-2.5 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Rocket size={14} />
                  <span>Publish Hackathon</span>
                </button>
              </form>

              <div className="space-y-2.5">
                <p className="text-xs font-bold text-[#000000]">
                  Active Hackathons ({hackathonEvents.length})
                </p>
                {hackathonEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-[14px] bg-[#F6F4F1] border border-[#000000] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#000000] truncate">{ev.title}</p>
                      <p className="text-[11px] text-[#4C4841] truncate mt-0.5">
                        {ev.category} · {ev.dateDisplay} · {ev.participantsCount}/{ev.maxParticipants}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => adminDeleteEvent(ev.id)}
                      aria-label={`Delete ${ev.title}`}
                      className="p-2 rounded-[10px] bg-[#E4DED2] border border-[#000000] text-[#000000] hover:bg-[#F95C4B] hover:text-[#F6F4F1] transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Dedicated Post Event Card */}
            <div className="argon-card-stone p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[18px] font-bold text-[#000000]">Post Club Event</h2>
                  <p className="text-xs text-[#4C4841]">
                    Publish Coding Competitions and Guest Lectures to the Events Calendar.
                  </p>
                </div>
                <Calendar size={18} className="text-[#F95C4B]" />
              </div>

              <form
                onSubmit={handlePostEvent}
                className="p-4 rounded-[18px] bg-[#F6F4F1] border border-[#000000] space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-bold text-[#000000] mb-1">
                    Event Title *
                  </label>
                  <input
                    required
                    type="text"
                    value={evtTitle}
                    onChange={(e) => setEvtTitle(e.target.value)}
                    placeholder="e.g., DSA Night Sprint & Alumni Tech Talk"
                    className="w-full h-10 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">
                      Event Category
                    </label>
                    <select
                      value={evtCategory}
                      onChange={(e) =>
                        setEvtCategory(e.target.value as 'Coding Competition' | 'Guest Lecture')
                      }
                      className="w-full h-9 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs font-semibold text-[#000000]"
                    >
                      <option value="Coding Competition">Coding Competition</option>
                      <option value="Guest Lecture">Guest Lecture</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">Mode</label>
                    <select
                      value={evtMode}
                      onChange={(e) => setEvtMode(e.target.value as EventItem['mode'])}
                      className="w-full h-9 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs font-semibold text-[#000000]"
                    >
                      <option value="Offline · AVCOE Campus">Offline · AVCOE Campus</option>
                      <option value="Hybrid · Online + Lab">Hybrid · Online + Lab</option>
                      <option value="National · Online + Finals">National · Online + Finals</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">
                      Date &amp; Time
                    </label>
                    <input
                      type="text"
                      value={evtDate}
                      onChange={(e) => setEvtDate(e.target.value)}
                      className="w-full h-9 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">
                      Outcome / Perks
                    </label>
                    <input
                      type="text"
                      value={evtPrize}
                      onChange={(e) => setEvtPrize(e.target.value)}
                      className="w-full h-9 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">
                      Max Seats
                    </label>
                    <input
                      type="number"
                      value={evtMaxSeats}
                      onChange={(e) => setEvtMaxSeats(e.target.value)}
                      className="w-full h-9 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] font-mono text-xs font-bold text-[#000000]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">
                      XP Reward
                    </label>
                    <input
                      type="number"
                      value={evtXp}
                      onChange={(e) => setEvtXp(e.target.value)}
                      className="w-full h-9 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] font-mono text-xs font-bold text-[#000000]"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <label className="h-9 px-2.5 rounded-[10px] bg-[#E4DED2] border border-[#000000] text-[11px] font-bold text-[#000000] inline-flex items-center justify-center gap-1 cursor-pointer hover:bg-[#000000] hover:text-[#F6F4F1] transition-colors">
                      <ImagePlus size={12} />
                      <span>{evtBannerUrl ? 'Banner Set' : 'Cover Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const url = await readAndCompressImageFile(f, 640);
                          setEvtBannerUrl(url);
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#000000] mb-1">
                    Event Description
                  </label>
                  <textarea
                    rows={2}
                    value={evtDesc}
                    onChange={(e) => setEvtDesc(e.target.value)}
                    placeholder="Agenda, speaker details, or registration notes..."
                    className="w-full p-2.5 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="argon-btn-dark w-full py-2.5 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar size={14} />
                  <span>Post Event</span>
                </button>
              </form>

              <div className="space-y-2.5">
                <p className="text-xs font-bold text-[#000000]">
                  Posted Events ({generalEvents.length})
                </p>
                {generalEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-[14px] bg-[#F6F4F1] border border-[#000000] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#000000] truncate">{ev.title}</p>
                      <p className="text-[11px] text-[#4C4841] truncate mt-0.5">
                        {ev.category} · {ev.dateDisplay} · {ev.participantsCount}/{ev.maxParticipants}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => adminDeleteEvent(ev.id)}
                      aria-label={`Delete ${ev.title}`}
                      className="p-2 rounded-[10px] bg-[#E4DED2] border border-[#000000] text-[#000000] hover:bg-[#F95C4B] hover:text-[#F6F4F1] transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Workshop Session Scheduler */}
          <div className="argon-card-stone p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-[#000000]">
                  Schedule Live Workshop / Session ({sessions.length})
                </h2>
                <p className="text-xs text-[#4C4841]">
                  Creates an attendance check-in code and publishes to Live Sessions immediately.
                </p>
              </div>
              <Radio size={18} className="text-[#F95C4B]" />
            </div>

            <form
              onSubmit={handleCreateSession}
              className="p-4 rounded-[18px] bg-[#F6F4F1] border border-[#000000] grid grid-cols-1 md:grid-cols-4 gap-3"
            >
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-[#000000] mb-1">
                  Session Title *
                </label>
                <input
                  required
                  type="text"
                  value={sessTitle}
                  onChange={(e) => setSessTitle(e.target.value)}
                  placeholder="e.g., Hands-On Docker & Cloud Deployments"
                  className="w-full h-9 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#000000] mb-1">Track</label>
                <input
                  type="text"
                  value={sessTrack}
                  onChange={(e) => setSessTrack(e.target.value)}
                  className="w-full h-9 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#000000] mb-1">Mode</label>
                <select
                  value={sessMode}
                  onChange={(e) => setSessMode(e.target.value as LiveSession['mode'])}
                  className="w-full h-9 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs font-semibold text-[#000000]"
                >
                  <option value="Offline">Offline (Campus Lab)</option>
                  <option value="Online">Online (Live Call)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#000000] mb-1">Instructor</label>
                <input
                  type="text"
                  value={sessInstructor}
                  onChange={(e) => setSessInstructor(e.target.value)}
                  className="w-full h-9 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#000000] mb-1">Date &amp; Venue</label>
                <input
                  type="text"
                  value={`${sessDate} · ${sessVenue}`}
                  onChange={(e) => {
                    const parts = e.target.value.split('·');
                    setSessDate(parts[0]?.trim() || e.target.value);
                    if (parts[1]) setSessVenue(parts[1].trim());
                  }}
                  className="w-full h-9 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#000000] mb-1">Code</label>
                  <input
                    type="text"
                    value={sessCode}
                    onChange={(e) => setSessCode(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-[10px] bg-[#F6F4F1] border border-[#000000] font-mono text-xs font-bold text-[#000000] uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#000000] mb-1">XP</label>
                  <input
                    type="number"
                    value={sessXp}
                    onChange={(e) => setSessXp(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-[10px] bg-[#F6F4F1] border border-[#000000] font-mono text-xs font-bold text-[#000000]"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="argon-btn-primary w-full h-9 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Publish Session</span>
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {sessions.slice(0, 6).map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-[14px] bg-[#F6F4F1] border border-[#000000] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#000000] truncate">{s.title}</p>
                    <p className="text-[11px] text-[#4C4841] truncate mt-0.5">
                      {s.mode} · {s.dateLabel} · Code{' '}
                      <strong className="font-mono text-[#000000]">{s.checkInCode}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => adminDeleteSession(s.id)}
                    aria-label={`Delete ${s.title}`}
                    className="p-2 rounded-[10px] bg-[#E4DED2] border border-[#000000] text-[#000000] hover:bg-[#F95C4B] hover:text-[#F6F4F1] transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. BADGES UPLOAD & CERTIFICATES TAB */}
      {section === 'badges-certs' && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            {/* Upload Custom Badge Form */}
            <div className="xl:col-span-5 argon-card-stone p-4 sm:p-6 space-y-3.5 sm:space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-[16px] sm:text-[18px] font-bold text-[#000000]">Upload Custom Badge</h2>
                  <p className="text-xs text-[#4C4841]">
                    Upload PNG, WebP, or SVG artwork — renders live in Achievements &amp; Badges Vault.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleMobileForm('badges')}
                  className="xl:hidden px-3 py-1.5 rounded-[10px] bg-[#000000] text-[#F6F4F1] text-xs font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus size={13} />
                  <span>{mobileFormOpen.badges ? 'Hide' : 'Upload'}</span>
                </button>
                <Upload size={18} className="hidden xl:block text-[#F95C4B]" />
              </div>

              <form
                onSubmit={handleUploadBadge}
                className={`${mobileFormOpen.badges ? 'block' : 'hidden xl:block'} p-4 rounded-[18px] bg-[#F6F4F1] border border-[#000000] space-y-3`}
              >
                {/* Live Badge Preview + File Picker */}
                <div className="p-3.5 rounded-[14px] bg-[#E4DED2] border border-[#000000] flex items-center gap-4">
                  <HexBadge3D badge={previewBadgeObj} size="md" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <p className="text-xs font-bold text-[#000000] truncate">
                      {badgeName || 'Badge Artwork Preview'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3 py-1.5 rounded-[10px] bg-[#000000] text-[#F6F4F1] text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer hover:bg-[#1F1E1C]">
                        <Upload size={12} />
                        <span>{badgeImagePreview ? 'Replace Image' : 'Upload Badge Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBadgeFileUpload}
                          className="hidden"
                        />
                      </label>
                      {badgeImagePreview && (
                        <button
                          type="button"
                          onClick={() => setBadgeImagePreview(undefined)}
                          className="px-2 py-1.5 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-[11px] font-bold text-[#000000] cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {badgeUploadError && (
                  <p className="text-xs font-semibold text-[#F95C4B]">{badgeUploadError}</p>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-[#000000] mb-1">
                    Badge Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={badgeName}
                    onChange={(e) => setBadgeName(e.target.value)}
                    placeholder="e.g., SIH National Finalist 2026"
                    className="w-full h-10 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">
                      Category
                    </label>
                    <select
                      value={badgeCategory}
                      onChange={(e) => setBadgeCategory(e.target.value as BadgeItem['category'])}
                      className="w-full h-9 px-2.5 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs font-semibold text-[#000000]"
                    >
                      <option value="Hackathon">Hackathon</option>
                      <option value="Digital Skill">Digital Skill</option>
                      <option value="Project Completion">Project Completion</option>
                      <option value="Leadership">Leadership</option>
                      <option value="Milestone & Streak">Milestone &amp; Streak</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">
                      XP Bonus
                    </label>
                    <input
                      type="number"
                      min={25}
                      max={1000}
                      step={25}
                      value={badgeXp}
                      onChange={(e) => setBadgeXp(e.target.value)}
                      className="w-full h-9 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] font-mono text-xs font-bold text-[#000000]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">
                      Tone (if no image)
                    </label>
                    <select
                      value={badgeColor}
                      onChange={(e) => setBadgeColor(e.target.value as BadgeItem['colorScheme'])}
                      className="w-full h-9 px-2.5 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs font-semibold text-[#000000]"
                    >
                      <option value="orange">Coral</option>
                      <option value="purple">Black</option>
                      <option value="amber">Paper</option>
                      <option value="teal">Black + Coral</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">
                      Fallback Icon
                    </label>
                    <select
                      value={badgeIcon}
                      onChange={(e) => setBadgeIcon(e.target.value as BadgeItem['iconName'])}
                      className="w-full h-9 px-2.5 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs font-semibold text-[#000000]"
                    >
                      <option value="trophy">Trophy</option>
                      <option value="code">Code</option>
                      <option value="zap">Lightning</option>
                      <option value="users">Team</option>
                      <option value="cpu">AI / CPU</option>
                      <option value="git">Git Branch</option>
                      <option value="shield">Shield</option>
                      <option value="book">Book</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#000000] mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={badgeDesc}
                    onChange={(e) => setBadgeDesc(e.target.value)}
                    placeholder="Short achievement summary..."
                    className="w-full h-9 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#000000] mb-1">
                    Unlock Rule
                  </label>
                  <input
                    type="text"
                    value={badgeRule}
                    onChange={(e) => setBadgeRule(e.target.value)}
                    className="w-full h-9 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000]"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-[#000000] cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={badgeUnlocked}
                    onChange={(e) => setBadgeUnlocked(e.target.checked)}
                    className="w-4 h-4 accent-[#F95C4B]"
                  />
                  <span>Award as Unlocked immediately</span>
                </label>

                <button
                  type="submit"
                  className="argon-btn-primary w-full py-2.5 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload size={14} />
                  <span>Upload Badge to Vault</span>
                </button>
              </form>
            </div>

            {/* Badge Vault Grid */}
            <div className="xl:col-span-7 argon-card-stone p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[18px] font-bold text-[#000000]">
                    Badge Vault ({badges.length})
                  </h2>
                  <p className="text-xs text-[#4C4841]">
                    Toggle unlocked status or delete uploaded badges.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('certificates')}
                  className="text-xs font-bold text-[#F95C4B] hover:underline cursor-pointer"
                >
                  Open Student Vault →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[560px] overflow-y-auto pr-1">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-[16px] bg-[#F6F4F1] border border-[#000000] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <HexBadge3D badge={b} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#000000] truncate">{b.name}</p>
                        <p className="text-[10.5px] text-[#4C4841] truncate">
                          {b.category} · +{b.xpBonus} XP
                        </p>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded-[6px] text-[10px] font-bold border border-[#000000] ${
                            b.unlocked
                              ? 'bg-[#000000] text-[#F6F4F1]'
                              : 'bg-[#E4DED2] text-[#000000]'
                          }`}
                        >
                          {b.unlocked ? 'Unlocked' : 'Locked'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => adminToggleBadgeUnlock(b.id)}
                        title={b.unlocked ? 'Lock badge' : 'Unlock badge'}
                        className="p-2 rounded-[10px] bg-[#E4DED2] border border-[#000000] text-[#000000] hover:bg-[#000000] hover:text-[#F6F4F1] transition-colors cursor-pointer"
                      >
                        {b.unlocked ? <Lock size={13} /> : <Unlock size={13} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => adminDeleteBadge(b.id)}
                        aria-label={`Delete ${b.name}`}
                        className="p-2 rounded-[10px] bg-[#000000] text-[#F6F4F1] hover:bg-[#F95C4B] transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Certificate Issuance Desk */}
          <div className="argon-card-stone p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-[#000000]">Certificate Issuance Desk</h2>
                <p className="text-xs text-[#4C4841]">
                  Approve or revoke verified AVCOE club credentials.
                </p>
              </div>
              <Award size={18} className="text-[#F95C4B]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {certificates.map((cert) => {
                const earned = cert.status === 'Earned';
                return (
                  <div
                    key={cert.id}
                    className="p-4 rounded-[16px] bg-[#F6F4F1] border border-[#000000] flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[10.5px] font-bold text-[#F95C4B] uppercase">
                          {cert.type}
                        </p>
                        <span
                          className={`px-2 py-0.5 rounded-[6px] text-[10px] font-bold border border-[#000000] shrink-0 ${
                            earned
                              ? 'bg-[#000000] text-[#F6F4F1]'
                              : 'bg-[#E4DED2] text-[#000000]'
                          }`}
                        >
                          {cert.status}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-[#000000] mt-1">{cert.title}</p>
                      <p className="text-[11px] text-[#4C4841] mt-1">{cert.eligibilityRule}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => adminToggleCertificateApproval(cert.id)}
                      className={`w-full py-2 rounded-[10px] text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                        earned
                          ? 'bg-[#E4DED2] border border-[#000000] text-[#000000] hover:bg-[#000000] hover:text-[#F6F4F1]'
                          : 'bg-[#F95C4B] border border-[#000000] text-[#F6F4F1] hover:bg-[#E64C3B]'
                      }`}
                    >
                      <CheckCircle2 size={13} />
                      <span>{earned ? 'Set to In Progress' : 'Approve & Issue'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 8. PROJECTS & BROADCAST TAB */}
      {section === 'projects-broadcast' && (
        <section className="space-y-6">
          {/* Projects Judging Console */}
          <div className="argon-card-stone p-6 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-[18px] font-bold text-[#000000]">
                  Student Projects &amp; Judging Console
                </h2>
                <p className="text-xs text-[#4C4841] mt-0.5">
                  Update submission status, inspect repositories, or remove entries.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4C4841]"
                  />
                  <input
                    type="text"
                    value={projQuery}
                    onChange={(e) => setProjQuery(e.target.value)}
                    placeholder="Search team or title..."
                    className="h-9 pl-8 pr-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
                  />
                </div>

                {(['All', 'In Review', 'Deployed', 'Hackathon Winner'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setProjStatusFilter(st)}
                    className="px-3 py-1.5 rounded-[10px] text-xs font-bold border border-[#000000] cursor-pointer transition-colors"
                    style={{
                      backgroundColor: projStatusFilter === st ? '#000000' : '#F6F4F1',
                      color: projStatusFilter === st ? '#F6F4F1' : '#000000',
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-[18px] bg-[#F6F4F1] border border-[#000000] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Code2 size={15} className="text-[#F95C4B] shrink-0" />
                      <h3 className="text-sm font-bold text-[#000000]">{proj.title}</h3>
                      <span className="text-[11px] font-mono text-[#4C4841]">
                        · {proj.teamName} · {proj.track}
                      </span>
                    </div>
                    <p className="text-xs text-[#3C3934] mt-1 line-clamp-2">{proj.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-semibold">
                      <span className="font-mono text-[#000000]">{proj.upvotes} upvotes</span>
                      <a
                        href={proj.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#000000] hover:text-[#F95C4B]"
                      >
                        <ExternalLink size={12} />
                        <span>Repo</span>
                      </a>
                      <a
                        href={proj.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#F95C4B] hover:underline"
                      >
                        <ExternalLink size={12} />
                        <span>Demo</span>
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <select
                      value={proj.status}
                      onChange={(e) =>
                        adminUpdateProjectStatus(proj.id, e.target.value as ProjectItem['status'])
                      }
                      aria-label={`Change status for ${proj.title}`}
                      className="h-9 px-3 rounded-[10px] bg-[#E4DED2] border border-[#000000] text-xs font-bold text-[#000000] cursor-pointer"
                    >
                      <option value="In Review">In Review</option>
                      <option value="Deployed">Deployed</option>
                      <option value="Hackathon Winner">Hackathon Winner</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => adminDeleteProject(proj.id)}
                      aria-label={`Delete ${proj.title}`}
                      className="h-9 w-9 rounded-[10px] bg-[#000000] text-[#F6F4F1] hover:bg-[#F95C4B] flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Club Broadcast Composer + Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <form
              onSubmit={handleBroadcast}
              className="lg:col-span-6 argon-card-stone p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[18px] font-bold text-[#000000]">
                    Broadcast Club Announcement
                  </h2>
                  <p className="text-xs text-[#4C4841]">
                    Pushes an immediate alert to the top notification bell.
                  </p>
                </div>
                <Megaphone size={18} className="text-[#F95C4B]" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#000000] mb-1">
                  Headline *
                </label>
                <input
                  required
                  type="text"
                  value={bcTitle}
                  onChange={(e) => setBcTitle(e.target.value)}
                  placeholder="e.g., Hackathon Pitch Deck Deadline Extended to 8 PM"
                  className="w-full h-10 px-3 rounded-[12px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#000000] mb-1">
                  Message Details *
                </label>
                <textarea
                  required
                  rows={3}
                  value={bcDetail}
                  onChange={(e) => setBcDetail(e.target.value)}
                  placeholder="Include room number, submission link instructions, or mentor office hours..."
                  className="w-full p-3 rounded-[12px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#000000] mb-1">
                  Target Tab on Click
                </label>
                <select
                  value={bcTarget}
                  onChange={(e) => setBcTarget(e.target.value as NavTab)}
                  className="w-full h-10 px-3 rounded-[12px] bg-[#F6F4F1] border border-[#000000] text-xs font-semibold text-[#000000]"
                >
                  <option value="hackathon">Hackathon Hub</option>
                  <option value="live-sessions">Live Sessions</option>
                  <option value="events">Events</option>
                  <option value="projects">Projects</option>
                  <option value="certificates">Certificates &amp; Badges</option>
                </select>
              </div>

              <button
                type="submit"
                className="argon-btn-primary w-full py-2.5 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send size={14} />
                <span>Send Club Broadcast</span>
              </button>
            </form>

            <div className="lg:col-span-6 argon-card-stone p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-bold text-[#000000]">
                  Recent Broadcasts ({notifications.length})
                </h2>
                <Bell size={18} className="text-[#F95C4B]" />
              </div>

              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-[14px] bg-[#F6F4F1] border border-[#000000]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-[#000000]">{n.title}</p>
                      <span className="text-[10px] font-mono text-[#4C4841] shrink-0">
                        {n.timeAgo}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4C4841] mt-1">{n.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 8. HACKATHON ROSTERS & TEAM ASSIGNMENT TAB */}
      {section === 'registrations' && (
        <section className="space-y-5">
          {/* A. Per-Hackathon Registration Counts Grid */}
          <div className="argon-card-stone p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-[19px] font-bold text-[#000000]">
                  Hackathon &amp; Event Registrations Overview
                </h2>
                <p className="text-xs text-[#4C4841]">
                  Click any hackathon to see exact registered student count, who registered, and assign teams to everyone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSection('hackathons-events')}
                className="px-3.5 py-2 rounded-[10px] bg-[#000000] text-[#F6F4F1] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer hover:bg-[#F95C4B] transition-colors self-start sm:self-auto"
              >
                <Plus size={13} />
                <span>Add New Hackathon</span>
              </button>
            </div>

            <div className="flex lg:grid lg:grid-cols-3 gap-2.5 sm:gap-3.5 overflow-x-auto no-scrollbar pb-1 snap-x">
              {/* All Hackathons Card */}
              <button
                type="button"
                onClick={() => {
                  setRosterEventId('ALL');
                  setSelectedRosterUserIds([]);
                }}
                className="min-w-[230px] lg:min-w-0 snap-start shrink-0 p-3.5 sm:p-4 rounded-[16px] text-left border-[1.25px] border-[#000000] transition-colors cursor-pointer flex flex-col justify-between gap-2.5"
                style={{
                  backgroundColor: rosterEventId === 'ALL' ? '#000000' : '#F6F4F1',
                  color: rosterEventId === 'ALL' ? '#F6F4F1' : '#000000',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="px-2 py-0.5 rounded-[7px] text-[10px] font-bold border border-[#000000]"
                    style={{
                      backgroundColor: rosterEventId === 'ALL' ? '#F95C4B' : '#E4DED2',
                      color: rosterEventId === 'ALL' ? '#F6F4F1' : '#000000',
                    }}
                  >
                    ALL TRACKED EVENTS
                  </span>
                  <span className="font-mono text-xl font-extrabold tabular-nums">
                    {eventRegistrations.length}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold leading-snug">All Hackathons &amp; Events</p>
                  <p
                    className="text-[11px] mt-1"
                    style={{ color: rosterEventId === 'ALL' ? '#E4DED2' : '#4C4841' }}
                  >
                    {events.length} active events ·{' '}
                    {
                      eventRegistrations.filter((r) => {
                        const u = managedUsers.find((usr) => usr.id === r.userId);
                        return !(u ? u.teamId : r.teamId);
                      }).length
                    }{' '}
                    unassigned
                  </p>
                </div>
              </button>

              {/* Individual Hackathon/Event Cards */}
              {events.map((ev) => {
                const evRegs = eventRegistrations.filter((r) => r.eventId === ev.id);
                const assignedCount = evRegs.filter((r) => {
                  const u = managedUsers.find((usr) => usr.id === r.userId);
                  return Boolean(u ? u.teamId : r.teamId);
                }).length;
                const unassignedCount = evRegs.length - assignedCount;
                const isSelected = rosterEventId === ev.id;
                const fillPct = Math.min(
                  100,
                  Math.round((evRegs.length / Math.max(1, ev.maxParticipants)) * 100)
                );

                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => {
                      setRosterEventId(ev.id);
                      setSelectedRosterUserIds([]);
                    }}
                    className="min-w-[230px] lg:min-w-0 snap-start shrink-0 p-3.5 sm:p-4 rounded-[16px] text-left border-[1.25px] border-[#000000] transition-colors cursor-pointer flex flex-col justify-between gap-2.5"
                    style={{
                      backgroundColor: isSelected ? '#000000' : '#F6F4F1',
                      color: isSelected ? '#F6F4F1' : '#000000',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="px-2 py-0.5 rounded-[7px] text-[10px] font-bold border border-[#000000] truncate"
                        style={{
                          backgroundColor: isSelected ? '#F95C4B' : '#E4DED2',
                          color: isSelected ? '#F6F4F1' : '#000000',
                        }}
                      >
                        {ev.category}
                      </span>
                      <span className="font-mono text-lg font-extrabold tabular-nums shrink-0">
                        {evRegs.length}{' '}
                        <span
                          className="text-[11px] font-medium"
                          style={{ color: isSelected ? '#E4DED2' : '#4C4841' }}
                        >
                          reg
                        </span>
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-bold leading-snug line-clamp-1">{ev.title}</p>
                      <p
                        className="text-[11px] mt-0.5"
                        style={{ color: isSelected ? '#E4DED2' : '#4C4841' }}
                      >
                        {ev.dateDisplay} · {assignedCount} teamed ·{' '}
                        <span
                          className="font-bold"
                          style={{ color: unassignedCount > 0 ? '#F95C4B' : undefined }}
                        >
                          {unassignedCount} unassigned
                        </span>
                      </p>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-[#E4DED2] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#F95C4B]"
                        style={{ width: `${Math.max(fillPct, evRegs.length > 0 ? 8 : 0)}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* B. Main Split: Inline Quick Create Team (Left) + Registered Roster & Bulk Assign (Right) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            {/* Left: Quick Create Team + Auto-Assign Everyone Card */}
            <div className="xl:col-span-4 space-y-4">
              {/* Quick Create Team Form — collapsible on mobile */}
              <form
                onSubmit={handleQuickCreateTeam}
                className="argon-card-stone p-4 sm:p-5 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#000000]">Create Team for Roster</h3>
                    <p className="text-[11px] text-[#4C4841]">
                      Instantly add a new squad and assign registered students.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleMobileForm('quickTeam')}
                    className="xl:hidden px-3 py-1.5 rounded-[10px] bg-[#000000] text-[#F6F4F1] text-xs font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus size={12} />
                    <span>{mobileFormOpen.quickTeam ? 'Hide' : 'New Team'}</span>
                  </button>
                  <Users size={17} className="hidden xl:block text-[#F95C4B]" />
                </div>

                <div className={`${mobileFormOpen.quickTeam ? 'block' : 'hidden xl:block'} p-3.5 rounded-[14px] bg-[#F6F4F1] border border-[#000000] space-y-2.5`}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-[10px] bg-[#000000] text-[#F6F4F1] border border-[#000000] flex items-center justify-center overflow-hidden shrink-0">
                      {quickTeamLogo ? (
                        <img
                          src={quickTeamLogo}
                          alt="Quick team logo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-mono text-[10px] font-bold text-[#F95C4B]">
                          {quickTeamCode.trim().slice(0, 4).toUpperCase() || 'TEAM'}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <label className="px-2.5 py-1.5 rounded-[8px] bg-[#000000] text-[#F6F4F1] text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer hover:bg-[#F95C4B] transition-colors">
                        <ImagePlus size={12} />
                        <span>{quickTeamLogo ? 'Change Logo' : 'Upload Logo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleQuickTeamLogoUpload}
                          className="hidden"
                        />
                      </label>
                      {quickTeamLogo && (
                        <button
                          type="button"
                          onClick={() => setQuickTeamLogo(undefined)}
                          className="px-2 py-1.5 rounded-[8px] bg-[#E4DED2] border border-[#000000] text-[10.5px] font-bold text-[#000000] cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                  {quickTeamError && (
                    <p className="text-[11px] font-bold text-[#F95C4B]">{quickTeamError}</p>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">
                      Team Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={quickTeamName}
                      onChange={(e) => setQuickTeamName(e.target.value)}
                      placeholder="e.g., CyberTitans Squad"
                      className="w-full h-9 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">
                      Team Code
                    </label>
                    <input
                      type="text"
                      value={quickTeamCode}
                      onChange={(e) => setQuickTeamCode(e.target.value)}
                      placeholder="e.g., CT-07"
                      className="w-full h-9 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] font-mono text-xs font-bold uppercase text-[#000000] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="argon-btn-primary w-full py-2 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Create Team &amp; Save to RTDB</span>
                  </button>
                </div>
              </form>

              {/* One-Click Auto-Assign Everyone Card */}
              <div className="argon-card-black p-5 space-y-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[#F95C4B] text-[#F6F4F1] text-[11px] font-bold">
                  <Zap size={12} />
                  <span>Assign Teams to Everyone</span>
                </span>
                <h3 className="text-base font-bold text-[#F6F4F1]">
                  One-Click Team Distribution
                </h3>
                <p className="text-xs text-[#E4DED2] leading-relaxed">
                  Automatically distribute registered students evenly across all{' '}
                  <span className="font-bold text-[#F6F4F1]">{managedTeams.length} club teams</span>{' '}
                  so every participant has a squad.
                </p>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    disabled={rosterUnassignedUserIds.length === 0 || managedTeams.length === 0}
                    onClick={() => {
                      adminAutoDistributeTeams(rosterUnassignedUserIds);
                      setSelectedRosterUserIds([]);
                    }}
                    className="w-full py-2.5 px-3.5 rounded-[12px] bg-[#F95C4B] text-[#F6F4F1] border border-[#F6F4F1]/25 text-xs font-bold cursor-pointer hover:bg-[#E64C3B] transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
                  >
                    Auto-Assign Unassigned ({rosterUnassignedUserIds.length}) Evenly
                  </button>

                  <button
                    type="button"
                    disabled={rosterUniqueUserIds.length === 0 || managedTeams.length === 0}
                    onClick={() => {
                      adminAutoDistributeTeams(rosterUniqueUserIds);
                      setSelectedRosterUserIds([]);
                    }}
                    className="w-full py-2.5 px-3.5 rounded-[12px] bg-[#F6F4F1] text-[#000000] text-xs font-bold cursor-pointer hover:bg-[#E4DED2] transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
                  >
                    Redistribute Everyone in Roster ({rosterUniqueUserIds.length}) Evenly
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Registered Students Roster + Bulk Team Assignment */}
            <div className="xl:col-span-8 argon-card-stone p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-[18px] font-bold text-[#000000]">
                    {rosterEventId === 'ALL'
                      ? `All Registered Students (${rosterEntries.length})`
                      : `${events.find((e) => e.id === rosterEventId)?.title || 'Hackathon'} Roster (${rosterEntries.length})`}
                  </h2>
                  <p className="text-xs text-[#4C4841]">
                    Assign teams individually with each dropdown or select multiple students for bulk assignment.
                  </p>
                </div>

                {/* Search & Team Filter */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search
                      size={13}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#4C4841]"
                    />
                    <input
                      type="text"
                      value={rosterSearch}
                      onChange={(e) => setRosterSearch(e.target.value)}
                      placeholder="Search student or track..."
                      className="h-9 pl-8 pr-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] w-44 focus:outline-none"
                    />
                  </div>
                  <select
                    value={rosterTeamFilter}
                    onChange={(e) => setRosterTeamFilter(e.target.value)}
                    className="h-9 px-2.5 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs font-semibold text-[#000000]"
                  >
                    <option value="ALL">All Teams</option>
                    <option value="UNASSIGNED">Unassigned Only</option>
                    {managedTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bulk Team Assignment Toolbar */}
              <div className="p-3.5 rounded-[14px] bg-[#F6F4F1] border border-[#000000] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedRosterUserIds(rosterUniqueUserIds)}
                    className="px-2.5 py-1.5 rounded-[8px] bg-[#E4DED2] border border-[#000000] font-bold text-[#000000] cursor-pointer hover:bg-[#D5CEC1]"
                  >
                    Select All ({rosterUniqueUserIds.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRosterUserIds(rosterUnassignedUserIds)}
                    className="px-2.5 py-1.5 rounded-[8px] bg-[#E4DED2] border border-[#000000] font-bold text-[#000000] cursor-pointer hover:bg-[#D5CEC1]"
                  >
                    Select Unassigned ({rosterUnassignedUserIds.length})
                  </button>
                  {selectedRosterUserIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedRosterUserIds([])}
                      className="px-2.5 py-1.5 rounded-[8px] bg-[#000000] text-[#F6F4F1] font-bold cursor-pointer"
                    >
                      Clear ({selectedRosterUserIds.length})
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={bulkTargetTeamId}
                    onChange={(e) => setBulkTargetTeamId(e.target.value)}
                    aria-label="Target team for bulk assignment"
                    className="h-9 px-2.5 rounded-[10px] bg-[#E4DED2] border border-[#000000] text-xs font-bold text-[#000000]"
                  >
                    <option value="">Unassign Team</option>
                    {managedTeams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.code})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={selectedRosterUserIds.length === 0}
                    onClick={() => {
                      adminBulkAssignTeam(selectedRosterUserIds, bulkTargetTeamId);
                      setSelectedRosterUserIds([]);
                    }}
                    className="px-3.5 py-2 rounded-[10px] bg-[#F95C4B] border border-[#000000] text-[#F6F4F1] text-xs font-bold cursor-pointer hover:bg-[#E64C3B] transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
                  >
                    Assign Selected ({selectedRosterUserIds.length})
                  </button>

                  <button
                    type="button"
                    disabled={rosterUniqueUserIds.length === 0}
                    onClick={() => {
                      adminBulkAssignTeam(rosterUniqueUserIds, bulkTargetTeamId);
                      setSelectedRosterUserIds([]);
                    }}
                    className="px-3 py-2 rounded-[10px] bg-[#000000] text-[#F6F4F1] text-xs font-bold cursor-pointer hover:bg-[#1F1E1C] transition-colors disabled:opacity-45 disabled:cursor-not-allowed"
                  >
                    Assign All Listed
                  </button>
                </div>
              </div>

              {/* Roster List */}
              <div className="space-y-2.5 max-h-[560px] overflow-y-auto pr-1">
                {rosterEntries.map((reg) => {
                  const isChecked = selectedRosterUserIds.includes(reg.userId);
                  return (
                    <div
                      key={reg.id}
                      className="p-3.5 rounded-[16px] bg-[#F6F4F1] border border-[#000000] flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRosterUserSelection(reg.userId)}
                          aria-label={`Select ${reg.userName}`}
                          className="mt-1 w-4 h-4 accent-[#F95C4B] cursor-pointer shrink-0"
                        />

                        <div className="w-10 h-10 rounded-[11px] bg-[#000000] text-[#F6F4F1] border border-[#000000] flex items-center justify-center overflow-hidden shrink-0">
                          {reg.teamLogo ? (
                            <img
                              src={reg.teamLogo}
                              alt={reg.teamName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-mono text-[10px] font-bold text-[#F95C4B]">
                              {reg.teamCode || 'NONE'}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <p className="text-sm font-bold text-[#000000] truncate">
                              {reg.userName}
                            </p>
                            <span className="px-2 py-0.5 rounded-[6px] bg-[#E4DED2] border border-[#000000] text-[10px] font-bold text-[#000000]">
                              {reg.branch} · {reg.year}
                            </span>
                            {reg.trackPreference && (
                              <span className="px-2 py-0.5 rounded-[6px] bg-[#000000] text-[#F6F4F1] text-[10px] font-semibold">
                                {reg.trackPreference}
                              </span>
                            )}
                          </div>
                          <p className="text-[11.5px] font-mono text-[#4C4841] truncate mt-0.5">
                            {reg.userEmail}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#4C4841]">
                            <span className="font-semibold text-[#F95C4B]">{reg.eventTitle}</span>
                            <span>·</span>
                            <span>Registered {reg.registeredAt}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pl-7 md:pl-0">
                        <select
                          value={reg.teamId}
                          onChange={(e) => adminAssignUserTeam(reg.userId, e.target.value)}
                          aria-label={`Assign team to ${reg.userName}`}
                          className="h-9 px-2.5 rounded-[10px] border border-[#000000] text-xs font-bold cursor-pointer"
                          style={{
                            backgroundColor: reg.teamId ? '#E4DED2' : '#F95C4B',
                            color: reg.teamId ? '#000000' : '#F6F4F1',
                          }}
                        >
                          <option value="" className="bg-[#F6F4F1] text-[#000000]">
                            Unassigned
                          </option>
                          {managedTeams.map((t) => (
                            <option key={t.id} value={t.id} className="bg-[#F6F4F1] text-[#000000]">
                              {t.name} ({t.code})
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => adminRemoveEventRegistration(reg.id)}
                          aria-label={`Remove ${reg.userName} registration`}
                          title="Remove registration"
                          className="p-2 rounded-[10px] bg-[#000000] text-[#F6F4F1] hover:bg-[#F95C4B] transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {rosterEntries.length === 0 && (
                  <div className="p-8 rounded-[16px] bg-[#F6F4F1] border border-[#000000] text-center space-y-1">
                    <p className="text-sm font-bold text-[#000000]">No registrations found</p>
                    <p className="text-xs text-[#4C4841]">
                      Students who confirm hackathon registration will appear here in real time from Firebase RTDB.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* MANDATORY GMAIL SEND CONFIRMATION MODAL */}
      {emailModalUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gmail-confirm-title"
        >
          <div className="w-full max-w-lg rounded-[22px] bg-[#F6F4F1] border-[1.5px] border-[#000000] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#000000] text-[#F6F4F1] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[10px] bg-[#F95C4B] text-[#F6F4F1] flex items-center justify-center shrink-0">
                  <Mail size={16} />
                </div>
                <div>
                  <h3 id="gmail-confirm-title" className="text-sm font-bold">
                    Confirm Sending Password Email
                  </h3>
                  <p className="text-[11px] text-[#E4DED2]">
                    Review the exact Gmail message before delivery.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !sendingEmail && setEmailModalUser(null)}
                aria-label="Close confirmation dialog"
                className="p-1.5 rounded-[8px] bg-[#1F1E1C] text-[#F6F4F1] hover:bg-[#F95C4B] transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="p-3.5 rounded-[14px] bg-[#E4DED2] border border-[#000000] space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#4C4841]">From (Gmail):</span>
                  <span className="font-mono font-bold text-[#000000] truncate">
                    {gmailConnected ? gmailUserEmail : 'Not connected yet'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#4C4841]">To:</span>
                  <span className="font-mono font-bold text-[#000000] truncate">
                    {emailModalUser.name} &lt;{emailModalUser.email}&gt;
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-[#4C4841]">Subject:</span>
                  <span className="font-semibold text-[#000000] text-right">
                    Welcome to ARGON | AVCOE Tech Community — Your Account Credentials
                  </span>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#4C4841] mb-1.5">
                  Email Body Preview
                </p>
                <div className="p-3.5 rounded-[14px] bg-[#E4DED2]/60 border border-[#000000] font-mono text-[11.5px] text-[#000000] whitespace-pre-line leading-relaxed max-h-52 overflow-y-auto">
                  {`Hello ${emailModalUser.name},\n\nYour account has been created on the ARGON | AVCOE Tech Community portal.\n\nAccount Details:\n- Email: ${emailModalUser.email}\n- Assigned Team: ${emailModalUser.teamName || 'Unassigned'}\n- Role: ${emailModalUser.role}\n- Default Password: ${emailModalUser.defaultPassword}\n\nPlease sign in with these credentials and update your password after your first login.\n\nBest regards,\nARGON Core Admin Team · AVCOE, Sangamner`}
                </div>
              </div>

              {emailSendError && (
                <div className="p-3 rounded-[12px] bg-[#F95C4B]/15 border border-[#F95C4B] flex items-start gap-2 text-xs text-[#000000]">
                  <AlertCircle size={15} className="text-[#F95C4B] shrink-0 mt-0.5" />
                  <span>{emailSendError}</span>
                </div>
              )}

              {!gmailConnected && (
                <div className="p-3.5 rounded-[14px] bg-[#000000] text-[#F6F4F1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs text-[#E4DED2]">
                    Connect your Google account with Gmail send permission to dispatch this email.
                  </p>
                  <GoogleSignInButton
                    onClick={handleConnectGmail}
                    loading={gmailSigningIn}
                    label="Sign in with Google"
                  />
                </div>
              )}

              {/* Explicit Confirm & Cancel Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={sendingEmail}
                  onClick={() => setEmailModalUser(null)}
                  className="px-4 py-2.5 rounded-[12px] bg-[#E4DED2] border border-[#000000] text-[#000000] text-xs font-bold cursor-pointer hover:bg-[#D5CEC1] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!gmailConnected || sendingEmail}
                  onClick={handleConfirmSendEmail}
                  className="px-5 py-2.5 rounded-[12px] bg-[#F95C4B] border border-[#000000] text-[#F6F4F1] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer hover:bg-[#E64C3B] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={13} />
                  <span>{sendingEmail ? 'Sending via Gmail...' : 'Confirm & Send Email'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
