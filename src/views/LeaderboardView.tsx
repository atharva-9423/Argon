import React, { useMemo, useState } from 'react';
import { Award, Crown, Flame, Sparkles, Trophy, Users } from 'lucide-react';
import { useArgon } from '../context/ArgonContext';

type BoardMode = 'Teams' | 'Students';
type TimeWindow = 'Weekly' | 'Monthly' | 'All Time';

export const LeaderboardView: React.FC = () => {
  const { leaderboardStudents, leaderboardTeams } = useArgon();
  const [mode, setMode] = useState<BoardMode>('Teams');
  const [windowRange, setWindowRange] = useState<TimeWindow>('Monthly');

  const getTeamXp = (t: (typeof leaderboardTeams)[number]) =>
    windowRange === 'Weekly'
      ? t.weeklyXp
      : windowRange === 'Monthly'
      ? t.monthlyXp
      : t.allTimeXp;

  const getStudentXp = (s: (typeof leaderboardStudents)[number]) =>
    windowRange === 'Weekly'
      ? s.weeklyXp
      : windowRange === 'Monthly'
      ? s.monthlyXp
      : s.allTimeXp;

  const sortedTeams = useMemo(
    () => [...leaderboardTeams].sort((a, b) => getTeamXp(b) - getTeamXp(a)),
    [leaderboardTeams, windowRange]
  );

  const sortedStudents = useMemo(
    () => [...leaderboardStudents].sort((a, b) => getStudentXp(b) - getStudentXp(a)),
    [leaderboardStudents, windowRange]
  );

  const activeListLength = mode === 'Teams' ? sortedTeams.length : sortedStudents.length;

  const maxXp =
    mode === 'Teams'
      ? Math.max(1, sortedTeams[0] ? getTeamXp(sortedTeams[0]) : 1)
      : Math.max(1, sortedStudents[0] ? getStudentXp(sortedStudents[0]) : 1);

  const podiumItems =
    mode === 'Teams'
      ? sortedTeams.slice(0, 3).map((t) => ({
          id: t.id,
          name: t.name,
          subtitle: `${t.membersCount} members · ${t.projectsShipped} projects`,
          xp: getTeamXp(t),
          highlight: t.isUserTeam,
        }))
      : sortedStudents.slice(0, 3).map((s) => ({
          id: s.id,
          name: s.name,
          subtitle: `${s.teamName} · ${s.branch}`,
          xp: getStudentXp(s),
          highlight: s.isCurrentUser,
        }));

  // Visual podium ordering on desktop: 2nd, 1st, 3rd
  const podiumVisual = [
    { item: podiumItems[1], rank: 2, height: 'md:pt-6', crownColor: 'text-[#4C4841]' },
    { item: podiumItems[0], rank: 1, height: 'md:pt-0', crownColor: 'text-[#F95C4B]' },
    { item: podiumItems[2], rank: 3, height: 'md:pt-8', crownColor: 'text-[#000000]' },
  ].filter((p): p is { item: NonNullable<typeof p.item>; rank: number; height: string; crownColor: string } => Boolean(p.item));

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#000000] tracking-[-0.02em]">
            ARGON Community Leaderboard
          </h2>
          <p className="text-xs sm:text-sm text-[#4C4841]">
            Live rankings synced from member XP, projects, and assigned teams.
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {/* Students vs Teams */}
          <div className="inline-flex items-center p-1 rounded-[12px] bg-[#E4DED2] border-[1.25px] border-[#000000] shrink-0">
            {(['Teams', 'Students'] as BoardMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-[9px] text-xs font-bold transition-colors cursor-pointer ${
                  mode === m ? 'bg-[#000000] text-[#F6F4F1]' : 'text-[#000000]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Time Filter */}
          <div className="inline-flex items-center p-1 rounded-[12px] bg-[#E4DED2] border-[1.25px] border-[#000000] shrink-0">
            {(['Weekly', 'Monthly', 'All Time'] as TimeWindow[]).map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWindowRange(w)}
                className={`px-2.5 py-1.5 rounded-[9px] text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  windowRange === w ? 'bg-[#F95C4B] text-[#F6F4F1]' : 'text-[#000000]'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeListLength === 0 ? (
        <section className="argon-card p-8 sm:p-10 text-center space-y-2.5">
          <div className="w-12 h-12 rounded-[14px] bg-[#000000] text-[#F95C4B] flex items-center justify-center mx-auto">
            <Trophy size={22} />
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-[#000000]">
            No {mode.toLowerCase()} ranked yet
          </h3>
          <p className="text-xs sm:text-sm text-[#4C4841] max-w-md mx-auto">
            {mode === 'Teams'
              ? 'Once teams are created in the Admin Panel and members earn XP, live team standings will appear here.'
              : 'Once members are added and earn XP from quests, hackathons, or projects, student standings will appear here.'}
          </p>
        </section>
      ) : (
        <>
          {/* Top 3 Podium (compact horizontal strip on mobile, 3-col podium on md+) */}
          {podiumVisual.length > 0 && (
            <section className="flex md:grid md:grid-cols-3 gap-3 sm:gap-4 items-end overflow-x-auto no-scrollbar pb-1 snap-x">
              {podiumVisual.map(({ item, rank, height, crownColor }) => (
                <div key={item.id} className={`${height} min-w-[210px] md:min-w-0 snap-start flex-1`}>
                  <div
                    className={`argon-card p-4 sm:p-5 text-center relative ${
                      rank === 1 ? 'argon-card-coral' : 'argon-card-stone'
                    }`}
                  >
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-[12px] bg-[#F6F4F1] border-[1.25px] border-[#000000] mx-auto">
                      <Crown size={20} className={crownColor} />
                    </div>
                    <p className="mt-2 font-mono text-[11px] font-bold text-[#000000]">
                      RANK #{rank}
                    </p>
                    <h3 className="mt-0.5 text-base sm:text-lg font-extrabold text-[#000000] truncate">
                      {item.name}
                      {item.highlight && (
                        <span className="ml-1 text-xs font-bold">(You)</span>
                      )}
                    </h3>
                    <p className="text-[11px] text-[#262421] mt-0.5 truncate">{item.subtitle}</p>
                    <p className="mt-2.5 inline-block px-3 py-1 rounded-[10px] bg-[#000000] font-mono text-sm sm:text-base font-extrabold text-[#F6F4F1] tabular-nums">
                      {item.xp.toLocaleString()} XP
                    </p>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Full Rankings Table */}
          <section className="argon-card overflow-hidden">
            <div className="px-4 sm:px-6 py-3.5 border-b border-[#000000]/15 flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-[#000000]">
                {windowRange} {mode} Standings
              </p>
              <p className="hidden sm:flex text-xs text-[#4C4841] items-center gap-1.5">
                <Sparkles size={13} className="text-[#F95C4B]" />
                <span>Synced live with Firebase RTDB</span>
              </p>
            </div>

            <div className="divide-y divide-black/10">
              {mode === 'Teams'
                ? sortedTeams.map((team, idx) => {
                    const xp = getTeamXp(team);
                    const widthPct = Math.round((xp / maxXp) * 100);
                    return (
                      <div
                        key={team.id}
                        className={`px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 ${
                          team.isUserTeam ? 'bg-[#F6F4F1]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 sm:w-64">
                          <span className="font-mono text-xs sm:text-sm font-bold text-[#4C4841] w-6 text-center tabular-nums">
                            #{idx + 1}
                          </span>
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[10px] bg-[#F6F4F1] border border-[#000000] flex items-center justify-center text-[#000000] shrink-0 overflow-hidden">
                            {team.logoDataUrl ? (
                              <img
                                src={team.logoDataUrl}
                                alt={`${team.name} logo`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users size={15} />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-[#000000] truncate">
                              {team.name}{' '}
                              {team.isUserTeam && (
                                <span className="text-xs font-bold text-[#F95C4B]">· Yours</span>
                              )}
                            </p>
                            <p className="text-[11px] text-[#4C4841] truncate">
                              {team.membersCount} members · {team.projectsShipped} projects
                            </p>
                          </div>
                          <span className="sm:hidden font-mono text-xs font-extrabold text-[#000000] tabular-nums shrink-0">
                            {xp.toLocaleString()} XP
                          </span>
                        </div>

                        <div className="hidden sm:flex flex-1 items-center gap-4">
                          <div className="flex-1 h-2 rounded-full bg-[#F6F4F1] border border-[#000000]/20 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${widthPct}%`,
                                backgroundColor: team.isUserTeam ? '#F95C4B' : '#000000',
                              }}
                            />
                          </div>
                          <span className="font-mono text-sm font-bold text-[#000000] tabular-nums w-24 text-right">
                            {xp.toLocaleString()} XP
                          </span>
                        </div>
                      </div>
                    );
                  })
                : sortedStudents.map((stu, idx) => {
                    const xp = getStudentXp(stu);
                    const widthPct = Math.round((xp / maxXp) * 100);
                    return (
                      <div
                        key={stu.id}
                        className={`px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 ${
                          stu.isCurrentUser ? 'bg-[#F6F4F1]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 sm:w-72">
                          <span className="font-mono text-xs sm:text-sm font-bold text-[#4C4841] w-6 text-center tabular-nums">
                            #{idx + 1}
                          </span>
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[10px] bg-[#000000] text-[#F6F4F1] text-xs font-bold flex items-center justify-center shrink-0">
                            {stu.initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-[#000000] truncate">
                              {stu.name}{' '}
                              {stu.isCurrentUser && (
                                <span className="text-xs font-bold text-[#F95C4B]">(You)</span>
                              )}
                            </p>
                            <p className="text-[11px] text-[#4C4841] truncate">
                              {stu.teamName} · {stu.branch}
                            </p>
                          </div>
                          <span className="sm:hidden font-mono text-xs font-extrabold text-[#000000] tabular-nums shrink-0">
                            {xp.toLocaleString()} XP
                          </span>
                        </div>

                        <div className="hidden md:flex items-center gap-4 text-xs text-[#3A3732] shrink-0">
                          <span className="inline-flex items-center gap-1 tabular-nums">
                            <Trophy size={13} className="text-[#F95C4B]" />
                            {stu.questsCompleted}
                          </span>
                          <span className="inline-flex items-center gap-1 tabular-nums">
                            <Award size={13} className="text-[#000000]" />
                            {stu.badgesCount}
                          </span>
                          <span className="inline-flex items-center gap-1 tabular-nums">
                            <Flame size={13} className="text-[#F95C4B]" />
                            {stu.streakDays}d
                          </span>
                        </div>

                        <div className="hidden sm:flex flex-1 items-center gap-4 max-w-xs">
                          <div className="flex-1 h-2 rounded-full bg-[#F6F4F1] border border-[#000000]/20 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${widthPct}%`,
                                backgroundColor: stu.isCurrentUser ? '#F95C4B' : '#000000',
                              }}
                            />
                          </div>
                          <span className="font-mono text-sm font-bold text-[#000000] tabular-nums w-24 text-right">
                            {xp.toLocaleString()} XP
                          </span>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
