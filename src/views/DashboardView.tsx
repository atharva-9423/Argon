import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowRight,
  Award,
  Bookmark,
  Calendar,
  CheckCircle2,
  Circle,
  Compass,
  Crown,
  Layers,
  Shield,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { useArgon } from '../context/ArgonContext';
import { WEEKLY_ACTIVITY_SERIES } from '../data/mockData';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { HexBadge3D } from '../components/ui/ClayMedallion';
import { NavTab } from '../types';

type TrackFilter = 'All tracks' | 'Coding' | 'Web & AI' | 'Hackathons';
type ChartRange = 'Weekly' | 'Monthly' | 'All Time';
type MobileSection = 'overview' | 'tracks' | 'sessions' | 'activity';

interface ChartTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}

const CustomActivityTooltip: React.FC<ChartTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const total = payload.reduce((sum, item) => sum + Number(item.value || 0), 0);
  return (
    <div className="rounded-[14px] bg-[#000000] border-[1.5px] border-[#F95C4B] px-3.5 py-2.5 text-xs text-[#F6F4F1]">
      <p className="font-bold text-[#F6F4F1] mb-1.5 font-mono tabular-nums">
        {label} · {total.toFixed(1)} h total
      </p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-[#E4DED2]">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-mono font-bold text-[#F6F4F1] tabular-nums">
              {entry.value} h
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Strictly derived from Paper / Stone / Coral / Black
const PEER_SWATCHES = [
  { bg: '#000000', fg: '#F6F4F1' },
  { bg: '#F95C4B', fg: '#F6F4F1' },
  { bg: '#F6F4F1', fg: '#000000' },
];

const MemberPillBadge: React.FC<{
  count: number;
  label: string;
  isDark?: boolean;
}> = ({ count, label, isDark = false }) => (
  <span
    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] text-[11px] font-bold tabular-nums"
    style={{
      backgroundColor: isDark ? '#F6F4F1' : '#000000',
      color: isDark ? '#000000' : '#F6F4F1',
      border: '1.25px solid #000000',
    }}
  >
    <Users size={12} />
    <span>
      {count} {label}
    </span>
  </span>
);

export const DashboardView: React.FC = () => {
  const {
    setActiveTab,
    setSelectedIslandId,
    currentUser,
    totalCommunityStudents,
    upcomingSessionsCount,
    totalEarnedXpDisplay,
    projectsSubmittedDisplay,
    team,
    readinessPct,
    toggleMilestone,
    badges,
    sessions,
    events,
    leaderboardTeams,
    islands,
    themeMode,
    materialPalette,
  } = useArgon();

  const isMaterial = themeMode === 'google-material';
  const colorLearning = isMaterial ? materialPalette.primary : '#F95C4B';
  const colorPractice = isMaterial ? materialPalette.secondary : '#000000';
  const colorProjects = isMaterial ? materialPalette.tertiary : '#787166';

  const [mobileSection, setMobileSection] = useState<MobileSection>('overview');
  const [trackFilter, setTrackFilter] = useState<TrackFilter>('All tracks');
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const [chartRange, setChartRange] = useState<ChartRange>('Weekly');

  const chartData = WEEKLY_ACTIVITY_SERIES[chartRange];

  const featuredCards = useMemo(() => {
    const island1 = islands[0];
    const island1Done = island1 ? island1.lessons.filter((l) => l.completed).length : 0;
    const island1Total = island1 ? island1.lessons.length : 1;

    const island2 = islands[3] || islands[1] || islands[0];
    const island2Done = island2 ? island2.lessons.filter((l) => l.completed).length : 0;
    const island2Total = island2 ? island2.lessons.length : 1;

    const doneMilestones = team.milestones.filter((m) => m.completed).length;

    const allCards = [
      {
        id: 'card1',
        filter: 'Coding' as TrackFilter,
        cardClass: 'argon-card-stone',
        isDark: false,
        badge: 'Coding & Web',
        badgeBg: '#000000',
        badgeText: '#F6F4F1',
        badgeBorder: '#000000',
        title: `${island1?.name || 'Coding Forest'} — Core Track`,
        progressLabel: `${island1Done}/${island1Total} lessons`,
        progressPct: Math.round((island1Done / island1Total) * 100),
        trackBg: 'rgba(0, 0, 0, 0.14)',
        fillBg: '#000000',
        memberCount: totalCommunityStudents,
        memberLabel: totalCommunityStudents === 1 ? 'member' : 'members',
        ctaClass: 'argon-btn-primary',
        action: () => {
          if (island1) setSelectedIslandId(island1.id);
          setActiveTab('learning-path');
        },
      },
      {
        id: 'card2',
        filter: 'Web & AI' as TrackFilter,
        cardClass: 'argon-card-coral',
        isDark: false,
        badge: 'AI & Systems',
        badgeBg: '#F6F4F1',
        badgeText: '#000000',
        badgeBorder: '#000000',
        title: `${island2?.name || 'AI & Systems'} & GitHub Workflow`,
        progressLabel: `${island2Done}/${island2Total} quests`,
        progressPct: Math.round((island2Done / island2Total) * 100),
        trackBg: 'rgba(0, 0, 0, 0.22)',
        fillBg: '#000000',
        memberCount: projectsSubmittedDisplay,
        memberLabel: projectsSubmittedDisplay === 1 ? 'project' : 'projects',
        ctaClass: 'argon-btn-dark',
        action: () => {
          if (island2) setSelectedIslandId(island2.id);
          setActiveTab('learning-path');
        },
      },
      {
        id: 'card3',
        filter: 'Hackathons' as TrackFilter,
        cardClass: 'argon-card-black',
        isDark: true,
        badge: 'Hackathon Sprint',
        badgeBg: '#E4DED2',
        badgeText: '#000000',
        badgeBorder: '#E4DED2',
        title: `${team.id ? team.name : 'Buildathon'} — Readiness`,
        progressLabel: `${doneMilestones}/${team.milestones.length} stages`,
        progressPct: readinessPct,
        trackBg: 'rgba(246, 244, 241, 0.2)',
        fillBg: '#F95C4B',
        memberCount: team.members.length,
        memberLabel: team.members.length === 1 ? 'teammate' : 'teammates',
        ctaClass: 'argon-btn-primary',
        action: () => setActiveTab('hackathon'),
      },
    ];

    if (trackFilter === 'All tracks') return allCards;
    return allCards.filter((c) => c.filter === trackFilter);
  }, [
    islands,
    team,
    readinessPct,
    trackFilter,
    totalCommunityStudents,
    projectsSubmittedDisplay,
    setActiveTab,
    setSelectedIslandId,
  ]);

  const nextAgendaRows = useMemo(() => {
    return sessions.slice(0, 4).map((s, idx) => {
      const sw = PEER_SWATCHES[idx % PEER_SWATCHES.length];
      return {
        id: s.id,
        num: String(idx + 1).padStart(2, '0'),
        title: s.title,
        subtitle: `${s.track} · ${s.mode}`,
        mentor: s.instructor,
        mentorInitials: s.instructor
          .split(' ')
          .map((w) => w[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        mentorBg: sw.bg,
        mentorFg: sw.fg,
        duration: `${s.durationHrs}h · ${s.dateLabel.split(',')[0]}`,
        tab: 'live-sessions' as NavTab,
      };
    });
  }, [sessions]);

  const flagshipEvent = events[0];
  const topFourTeams = [...leaderboardTeams]
    .sort((a, b) => b.monthlyXp - a.monthlyXp)
    .slice(0, 4);

  const toggleBookmark = (id: string) => {
    setBookmarked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Mobile Segmented Sub-Tabs (< lg) to eliminate excessive scrolling */}
      <div className="lg:hidden flex items-center gap-1.5 p-1 rounded-[14px] bg-[#E4DED2] border-[1.25px] border-[#000000]">
        {(
          [
            { id: 'overview', label: 'Overview' },
            { id: 'tracks', label: 'Tracks' },
            { id: 'sessions', label: 'Sessions' },
            { id: 'activity', label: 'Stats' },
          ] as { id: MobileSection; label: string }[]
        ).map((tab) => {
          const active = mobileSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMobileSection(tab.id)}
              className={`flex-1 py-2 px-2 rounded-[10px] text-[11.5px] font-bold transition-colors cursor-pointer whitespace-nowrap ${
                active ? 'bg-[#000000] text-[#F6F4F1]' : 'text-[#000000]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. COMPACT 2x2 KPI STRIP ON MOBILE (also shown on desktop in Overview) */}
      <section
        className={`${
          mobileSection === 'overview' ? 'grid' : 'hidden lg:grid'
        } grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-4`}
      >
        {[
          {
            label: 'Members',
            value: totalCommunityStudents,
            sub: 'Registered accounts',
            icon: Users,
            cardClass: 'argon-card-stone',
            isDark: false,
            chipBg: '#000000',
            chipText: '#F6F4F1',
            tab: 'leaderboard' as NavTab,
          },
          {
            label: 'Sessions',
            value: upcomingSessionsCount,
            sub: 'Scheduled labs',
            icon: Calendar,
            cardClass: 'argon-card-black',
            isDark: true,
            chipBg: '#F95C4B',
            chipText: '#F6F4F1',
            tab: 'live-sessions' as NavTab,
          },
          {
            label: 'Total XP',
            value: totalEarnedXpDisplay,
            sub: 'Live earned XP',
            icon: Zap,
            cardClass: 'argon-card-coral',
            isDark: false,
            chipBg: '#000000',
            chipText: '#F6F4F1',
            tab: 'learning-path' as NavTab,
          },
          {
            label: 'Projects',
            value: projectsSubmittedDisplay,
            sub: 'Submitted builds',
            icon: Layers,
            cardClass: 'argon-card-stone',
            isDark: false,
            chipBg: '#F95C4B',
            chipText: '#F6F4F1',
            tab: 'projects' as NavTab,
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          const fgMain = kpi.isDark ? '#F6F4F1' : '#000000';
          const fgSub = kpi.isDark ? '#E4DED2' : '#2C2A26';
          return (
            <button
              key={kpi.label}
              type="button"
              onClick={() => setActiveTab(kpi.tab)}
              className={`${kpi.cardClass} p-3 sm:p-5 text-left flex items-center gap-2.5 sm:gap-4 cursor-pointer`}
            >
              <div
                className="w-9 h-9 sm:w-12 sm:h-12 rounded-[11px] sm:rounded-[14px] flex items-center justify-center shrink-0 border border-[#000000]"
                style={{
                  backgroundColor: isMaterial ? materialPalette.primary : kpi.chipBg,
                  color: isMaterial ? materialPalette.onPrimary : kpi.chipText,
                }}
              >
                <Icon size={17} strokeWidth={2.1} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs font-semibold truncate" style={{ color: fgSub }}>
                  {kpi.label}
                </p>
                <span
                  className="block text-[20px] sm:text-[24px] font-extrabold tracking-[-0.03em] leading-tight mt-0.5"
                  style={{ color: fgMain }}
                >
                  <AnimatedNumber value={kpi.value} />
                </span>
                <p className="hidden sm:block text-[11px] mt-0.5 truncate opacity-80" style={{ color: fgSub }}>
                  {kpi.sub}
                </p>
              </div>
            </button>
          );
        })}
      </section>

      {/* 2. TRACKS SECTION */}
      <div className={mobileSection === 'tracks' ? 'space-y-3' : 'hidden lg:block lg:space-y-4'}>
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <h1 className="text-[20px] sm:text-[26px] font-bold tracking-[-0.025em] text-[#000000]">
            Learning tracks
          </h1>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {(['All tracks', 'Coding', 'Web & AI', 'Hackathons'] as TrackFilter[]).map((tab) => {
              const active = trackFilter === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setTrackFilter(tab)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-[11px] text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0"
                  style={{
                    backgroundColor: active
                      ? isMaterial
                        ? materialPalette.primary
                        : '#000000'
                      : isMaterial
                      ? materialPalette.surfaceCard
                      : '#F6F4F1',
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
                  {tab}
                </button>
              );
            })}
          </div>
        </section>

        <section
          className={`grid grid-cols-1 gap-3.5 sm:gap-5 ${
            featuredCards.length === 1
              ? 'md:grid-cols-1 max-w-xl'
              : featuredCards.length === 2
              ? 'md:grid-cols-2'
              : 'md:grid-cols-3'
          }`}
        >
          {featuredCards.map((card) => {
            const isSaved = Boolean(bookmarked[card.id]);
            const primaryText = card.isDark ? '#F6F4F1' : '#000000';
            const mutedText = card.isDark ? '#E4DED2' : '#1F1D1A';
            return (
              <article
                key={card.id}
                className={`${card.cardClass} p-4 sm:p-5 flex flex-col justify-between min-h-[170px] sm:min-h-[210px]`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-[10px] text-[11px] sm:text-xs font-bold"
                      style={{
                        backgroundColor: card.badgeBg,
                        color: card.badgeText,
                        border: `1.25px solid ${card.badgeBorder}`,
                      }}
                    >
                      {card.badge}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleBookmark(card.id)}
                      aria-label={isSaved ? 'Remove bookmark' : 'Bookmark track'}
                      className="p-1 cursor-pointer"
                      style={{ color: primaryText }}
                    >
                      <Bookmark
                        size={18}
                        strokeWidth={1.9}
                        style={{
                          fill: isSaved
                            ? card.isDark
                              ? '#F95C4B'
                              : '#000000'
                            : 'transparent',
                          color: isSaved && card.isDark ? '#F95C4B' : primaryText,
                        }}
                      />
                    </button>
                  </div>

                  <h2
                    className="mt-3 text-[16px] sm:text-[18px] font-bold tracking-[-0.02em] leading-[1.25]"
                    style={{ color: primaryText }}
                  >
                    {card.title}
                  </h2>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <div
                      className="flex items-center justify-between text-xs font-medium mb-1.5"
                      style={{ color: mutedText }}
                    >
                      <span>Progress</span>
                      <span className="font-bold tabular-nums" style={{ color: primaryText }}>
                        {card.progressLabel}
                      </span>
                    </div>
                    <div
                      className="h-[6px] w-full rounded-full overflow-hidden"
                      style={{ backgroundColor: card.trackBg }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${card.progressPct}%`,
                          backgroundColor: card.fillBg,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <MemberPillBadge
                      count={card.memberCount}
                      label={card.memberLabel}
                      isDark={card.isDark}
                    />
                    <button
                      type="button"
                      onClick={card.action}
                      className={`${card.ctaClass} px-4 py-2 text-xs font-bold whitespace-nowrap cursor-pointer`}
                    >
                      Open
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>

      {/* 3. OVERVIEW SPOTLIGHT + TEAM READINESS (Mobile Overview tab & Desktop) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
        {/* Featured Hackathon Spotlight */}
        <aside
          className={`${
            mobileSection === 'overview' ? 'flex' : 'hidden lg:flex'
          } lg:col-span-5 argon-card-black p-4 sm:p-6 flex-col justify-between gap-4`}
        >
          {flagshipEvent ? (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-[10px] bg-[#F95C4B] text-[#F6F4F1] text-xs font-bold">
                    {flagshipEvent.category}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#E4DED2] tabular-nums">
                    {flagshipEvent.participantsCount}/{flagshipEvent.maxParticipants} registered
                  </span>
                </div>

                <h3 className="text-[19px] sm:text-[22px] font-bold tracking-[-0.02em] leading-[1.25] text-[#F6F4F1]">
                  {flagshipEvent.title}
                </h3>

                <p className="text-xs text-[#E4DED2]/85 leading-relaxed">
                  {flagshipEvent.prizeOrOutcome} · {flagshipEvent.dateDisplay}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('hackathon')}
                className="argon-btn-primary w-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-center cursor-pointer border-0"
              >
                View Hackathon & Register
              </button>
            </>
          ) : (
            <div className="flex flex-col justify-between gap-4 h-full">
              <div className="space-y-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] bg-[#F95C4B] text-[#F6F4F1] text-xs font-bold">
                  <Trophy size={13} />
                  <span>Hackathon Hub</span>
                </span>
                <h3 className="text-[18px] sm:text-[20px] font-bold text-[#F6F4F1]">
                  No hackathons posted yet
                </h3>
                <p className="text-xs text-[#E4DED2]/80 leading-relaxed">
                  {currentUser?.role === 'Admin'
                    ? 'Publish your first hackathon or event from the Admin Panel so members can register and join teams.'
                    : 'Check back once your club admin publishes the next AVCOE hackathon or event.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setActiveTab(currentUser?.role === 'Admin' ? 'admin' : 'hackathon')
                }
                className="argon-btn-primary w-full py-2.5 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer border-0"
              >
                {currentUser?.role === 'Admin' ? (
                  <>
                    <Shield size={14} />
                    <span>Open Admin Panel</span>
                  </>
                ) : (
                  <>
                    <span>Open Hackathon Hub</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          )}
        </aside>

        {/* Team Readiness Checklist */}
        <div
          className={`${
            mobileSection === 'overview' ? 'flex' : 'hidden lg:flex'
          } lg:col-span-7 argon-card-stone p-4 sm:p-6 flex-col justify-between`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-[16px] sm:text-[18px] font-bold text-[#000000]">
                  Hackathon Readiness
                </h3>
                <p className="text-xs text-[#4C4841] mt-0.5">
                  {team.id ? `Team ${team.name}` : 'No team assigned yet'}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-[10px] bg-[#000000] font-mono text-xs font-extrabold text-[#F6F4F1]">
                {readinessPct}%
              </span>
            </div>

            <ul className="space-y-1.5">
              {team.milestones.map((ms) => (
                <li key={ms.id}>
                  <button
                    type="button"
                    onClick={() => toggleMilestone(ms.id)}
                    className="w-full flex items-center gap-2.5 text-left text-[12.5px] sm:text-[13px] py-1.5 rounded-xl hover:bg-[#F6F4F1]/70 px-2 -mx-2 transition-colors cursor-pointer"
                  >
                    {ms.completed ? (
                      <CheckCircle2
                        size={16}
                        className="shrink-0"
                        style={{ color: isMaterial ? materialPalette.primary : '#F95C4B' }}
                      />
                    ) : (
                      <Circle size={16} className="shrink-0 text-[#4C4841]" />
                    )}
                    <span
                      className={
                        ms.completed
                          ? 'font-bold text-[#000000]'
                          : 'font-medium text-[#3A3732]'
                      }
                    >
                      {ms.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('teams')}
            className="mt-3 argon-btn-dark w-full py-2.5 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Open Team Workspace</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* 4. SESSIONS, BADGES & TOP TEAMS (Mobile Sessions tab & Desktop) */}
      <section
        className={`${
          mobileSection === 'sessions' ? 'grid' : 'hidden lg:grid'
        } grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch`}
      >
        <div className="lg:col-span-5 argon-card-stone p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="text-[16px] sm:text-[18px] font-bold tracking-[-0.02em] text-[#000000]">
                Upcoming sessions
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab('live-sessions')}
                className="text-xs font-bold hover:underline cursor-pointer"
                style={{ color: isMaterial ? materialPalette.primary : '#F95C4B' }}
              >
                View all
              </button>
            </div>

            {nextAgendaRows.length === 0 ? (
              <div className="py-6 text-center rounded-xl bg-[#F6F4F1] border border-[#000000]/15 px-3">
                <Calendar size={20} className="mx-auto text-[#000000] mb-1.5" />
                <p className="text-xs font-bold text-[#000000]">No sessions scheduled yet</p>
                <p className="text-[11px] text-[#4C4841] mt-0.5">
                  Live workshops and mentor check-ins will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-black/15">
                {nextAgendaRows.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => setActiveTab(row.tab)}
                    className="w-full flex items-center justify-between gap-3 py-2.5 text-left hover:bg-[#F6F4F1]/60 rounded-xl px-2 -mx-2 transition-colors cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-[#000000] truncate">
                        {row.num}. {row.title}
                      </p>
                      <p className="text-[11px] text-[#4C4841] truncate mt-0.5">
                        {row.mentor} · {row.subtitle}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-[#000000] tabular-nums whitespace-nowrap shrink-0">
                      {row.duration}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 argon-card-stone p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-[16px] font-bold text-[#000000]">Top Teams</h3>
              <p className="text-xs text-[#4C4841] mt-0.5">Live XP standings.</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('leaderboard')}
              className="text-xs font-bold text-[#F95C4B] hover:underline cursor-pointer"
            >
              View full
            </button>
          </div>

          {topFourTeams.length === 0 ? (
            <div className="mt-3 py-6 text-center rounded-xl bg-[#F6F4F1] border border-[#000000]/15 px-3">
              <Users size={20} className="mx-auto text-[#000000] mb-1.5" />
              <p className="text-xs font-bold text-[#000000]">No teams created yet</p>
              <p className="text-[11px] text-[#4C4841] mt-0.5">
                Teams created in Admin Panel appear here automatically.
              </p>
            </div>
          ) : (
            <div className="mt-3 divide-y divide-black/15">
              {topFourTeams.map((t, idx) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab('leaderboard')}
                  className="w-full py-2.5 flex items-center justify-between gap-3 hover:bg-[#F6F4F1]/65 px-2 -mx-2 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 flex items-center justify-center shrink-0">
                      {idx === 0 ? (
                        <Crown size={15} className="text-[#F95C4B] fill-[#F95C4B]" />
                      ) : (
                        <span className="font-mono text-xs font-bold text-[#4C4841]">{idx + 1}</span>
                      )}
                    </span>
                    <span className="text-[13px] font-bold text-[#000000] truncate">
                      {t.name}
                      {t.isUserTeam && (
                        <span className="ml-1 text-[11px] font-bold text-[#F95C4B]">(You)</span>
                      )}
                    </span>
                  </div>
                  <span className="font-mono text-[11.5px] font-bold text-[#F6F4F1] bg-[#000000] px-2.5 py-0.5 rounded-[8px] tabular-nums shrink-0">
                    {t.monthlyXp.toLocaleString()} XP
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-3 argon-card-stone p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-[16px] font-bold text-[#000000]">Badges</h3>
              <p className="text-xs text-[#4C4841] mt-0.5">Club achievements.</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('certificates')}
              className="text-xs font-bold text-[#F95C4B] hover:underline cursor-pointer"
            >
              View all
            </button>
          </div>

          {badges.length === 0 ? (
            <div className="mt-3 py-6 text-center rounded-xl bg-[#F6F4F1] border border-[#000000]/15 px-3">
              <Award size={20} className="mx-auto text-[#000000] mb-1.5" />
              <p className="text-xs font-bold text-[#000000]">No badges yet</p>
              <p className="text-[11px] text-[#4C4841] mt-0.5">
                Upload badges in Admin Panel.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {badges.slice(0, 4).map((badge) => (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() => setActiveTab('certificates')}
                  className="flex flex-col items-center text-center group cursor-pointer"
                >
                  <HexBadge3D badge={badge} size="sm" />
                  <span className="mt-1.5 text-[11px] font-bold text-[#000000] leading-tight line-clamp-1">
                    {badge.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. ANALYTICS CHART + 3D WORLD LAUNCH (Mobile Activity tab & Desktop) */}
      <section
        className={`${
          mobileSection === 'activity' ? 'grid' : 'hidden lg:grid'
        } grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch`}
      >
        <div className="lg:col-span-8 argon-card-stone p-4 sm:p-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h3 className="text-[16px] sm:text-[18px] font-bold text-[#000000] tracking-[-0.02em]">
                Learning Activity
              </h3>
              <p className="text-xs text-[#4C4841] mt-0.5">
                Hours logged across tracks, sessions, and builds.
              </p>
            </div>

            <div className="inline-flex items-center p-1 rounded-xl self-start shrink-0 bg-[#F6F4F1] border border-[#000000]/15">
              {(['Weekly', 'Monthly', 'All Time'] as ChartRange[]).map((range) => {
                const active = chartRange === range;
                return (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setChartRange(range)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      active ? 'bg-[#F95C4B] text-[#F6F4F1]' : 'text-[#000000]'
                    }`}
                  >
                    {range}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 h-[180px] sm:h-[210px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillLearning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colorLearning} stopOpacity={0.34} />
                    <stop offset="100%" stopColor={colorLearning} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="fillPractice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colorPractice} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={colorPractice} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="fillProjects" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colorProjects} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={colorProjects} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke={isMaterial ? `${materialPalette.outlineVariant}88` : 'rgba(0, 0, 0, 0.14)'}
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#3A3732', fontSize: 11 }}
                  dy={6}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#3A3732', fontSize: 11 }} />
                <Tooltip content={<CustomActivityTooltip />} />
                <Area
                  type="monotone"
                  dataKey="learning"
                  name="Learning"
                  stroke={colorLearning}
                  strokeWidth={2.4}
                  fill="url(#fillLearning)"
                />
                <Area
                  type="monotone"
                  dataKey="practice"
                  name="Practice"
                  stroke={colorPractice}
                  strokeWidth={2.0}
                  fill="url(#fillPractice)"
                />
                <Area
                  type="monotone"
                  dataKey="projects"
                  name="Projects"
                  stroke={colorProjects}
                  strokeWidth={2.0}
                  fill="url(#fillProjects)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3D World Launch Card */}
        <div className="lg:col-span-4 argon-card-coral p-4 sm:p-5 flex flex-col justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-[#000000] text-xs font-bold text-[#F6F4F1]">
              <Compass size={13} />
              <span>3D World</span>
            </span>
            <h3 className="mt-3 text-[18px] font-bold text-[#000000] leading-snug">
              Voxel Learning Adventure Map
            </h3>
            <p className="mt-1.5 text-xs text-[#1F1A18] leading-relaxed">
              Explore all 6 interactive 3D islands from Coding Forest to Hackathon Castle and earn XP.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('learning-path')}
            className="argon-btn-dark w-full py-2.5 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Launch 3D Map</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </section>
    </div>
  );
};
