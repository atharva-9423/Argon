import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Sparkles,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useArgon } from '../context/ArgonContext';

type MobileTab = 'roster' | 'milestones' | 'explore';

const ROLE_OPTIONS = [
  'Frontend & Product Lead',
  'ML & Data Engineer',
  'Backend & Cloud',
  'Research & Pitch Lead',
  'Full-Stack Developer',
  'UI/UX Designer',
  'Hardware & IoT Lead',
];

export const TeamsView: React.FC = () => {
  const {
    team,
    candidates,
    readinessPct,
    toggleMilestone,
    updateMemberRole,
    inviteCandidate,
    createTeam,
  } = useArgon();

  const [mobileTab, setMobileTab] = useState<MobileTab>('roster');
  const [skillFilter, setSkillFilter] = useState<string>('All');
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState(team.name);
  const [newTagline, setNewTagline] = useState(team.tagline);
  const [newTarget, setNewTarget] = useState(team.hackathonTarget);

  const totalTeamXp = useMemo(
    () => team.members.reduce((sum, m) => sum + m.xpContribution, 0),
    [team.members]
  );

  const filteredCandidates = useMemo(() => {
    if (skillFilter === 'All') return candidates;
    return candidates.filter(
      (c) =>
        c.primaryRole.toLowerCase().includes(skillFilter.toLowerCase()) ||
        c.skills.some((s) => s.toLowerCase().includes(skillFilter.toLowerCase()))
    );
  }, [candidates, skillFilter]);

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    createTeam(newName, newTagline, newTarget);
    setCreateOpen(false);
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Compact Team Hero Header */}
      <section className="argon-card p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#000000] border border-[#000000] flex items-center justify-center text-[#F6F4F1] font-mono text-base sm:text-lg font-extrabold shrink-0 overflow-hidden">
            {team.logoDataUrl ? (
              <img
                src={team.logoDataUrl}
                alt={`${team.name} logo`}
                className="w-full h-full object-cover"
              />
            ) : (
              team.code || 'TM'
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[11.5px] font-semibold text-[#4C4841] truncate">
              {team.id ? `Target: ${team.hackathonTarget}` : 'Awaiting Admin Team Assignment'}
            </p>
            <h2 className="mt-0.5 text-lg sm:text-2xl font-extrabold text-[#000000] tracking-[-0.02em] truncate">
              {team.name}
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-[#3A3732] line-clamp-2">{team.tagline}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="px-3.5 py-2 rounded-[12px] bg-[#F6F4F1] border-[1.25px] border-[#000000]">
            <p className="text-[10.5px] font-semibold text-[#4C4841]">Team XP</p>
            <p className="font-mono text-sm sm:text-base font-extrabold text-[#F95C4B] tabular-nums">
              {totalTeamXp.toLocaleString()} XP
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setNewName(team.id ? team.name : '');
              setNewTagline(team.id ? team.tagline : '');
              setNewTarget(team.id ? team.hackathonTarget : '');
              setCreateOpen(true);
            }}
            className="argon-btn-dark inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold cursor-pointer whitespace-nowrap"
          >
            <Plus size={14} />
            <span>{team.id ? 'Edit Team' : 'Create Team'}</span>
          </button>
        </div>
      </section>

      {/* Mobile Sub-Tabs (< lg) to minimize vertical scroll */}
      <div className="lg:hidden flex items-center gap-1.5 p-1 rounded-[14px] bg-[#E4DED2] border-[1.25px] border-[#000000]">
        {(
          [
            { id: 'roster', label: `Roster (${team.members.length})` },
            { id: 'milestones', label: `Checklist (${readinessPct}%)` },
            { id: 'explore', label: `Find (${candidates.length})` },
          ] as { id: MobileTab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setMobileTab(t.id)}
            className={`flex-1 py-2 px-2 rounded-[10px] text-[11.5px] font-bold cursor-pointer whitespace-nowrap ${
              mobileTab === t.id ? 'bg-[#000000] text-[#F6F4F1]' : 'text-[#000000]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Team Readiness Pipeline */}
      <section
        className={`${
          mobileTab === 'milestones' ? 'block' : 'hidden lg:block'
        } argon-card p-4 sm:p-6`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-[16px] sm:text-[17px] font-bold text-[#000000]">
              Team Readiness &amp; Milestone Tracker
            </h3>
            <p className="text-xs text-[#4C4841]">
              Toggle stages below as your squad progresses from formation to demo.
            </p>
          </div>
          <span className="font-mono text-xs sm:text-sm font-extrabold text-[#F95C4B] tabular-nums">
            {readinessPct}% Ready
          </span>
        </div>

        <div className="h-2 rounded-full bg-[#F6F4F1] border border-[#000000]/20 overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-[#F95C4B] transition-all duration-300"
            style={{ width: `${readinessPct}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {team.milestones.map((ms, idx) => (
            <button
              key={ms.id}
              type="button"
              onClick={() => toggleMilestone(ms.id)}
              className={`text-left p-3.5 rounded-[14px] border-[1.25px] transition-all cursor-pointer ${
                ms.completed
                  ? 'bg-[#000000] border-[#000000] text-[#F6F4F1]'
                  : 'bg-[#F6F4F1] border-[#000000]/30 hover:border-[#000000] text-[#000000]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10.5px] opacity-75">Stage 0{idx + 1}</span>
                {ms.completed ? (
                  <CheckCircle2 size={15} className="text-[#F95C4B]" />
                ) : (
                  <Circle size={15} className="opacity-50" />
                )}
              </div>
              <p className="mt-1.5 text-xs sm:text-sm font-bold">{ms.label}</p>
              <p className="mt-1 text-[10.5px] font-mono opacity-75">{ms.dueLabel}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Roster + Explore Teammates */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        <div
          className={`${
            mobileTab === 'roster' ? 'block' : 'hidden lg:block'
          } lg:col-span-7 argon-card p-4 sm:p-6`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[16px] sm:text-[17px] font-bold text-[#000000]">
                Teammates &amp; Role Assignment
              </h3>
              <p className="text-xs text-[#4C4841]">
                Members assigned to your team sync live from Firebase RTDB.
              </p>
            </div>
            <Users size={18} className="text-[#F95C4B]" />
          </div>

          {team.members.length === 0 ? (
            <div className="p-6 rounded-[14px] bg-[#F6F4F1] border border-[#000000]/20 text-center space-y-1.5">
              <Users size={22} className="mx-auto text-[#000000]" />
              <p className="text-sm font-bold text-[#000000]">No teammates assigned yet</p>
              <p className="text-xs text-[#4C4841]">
                Once your club admin assigns members to your team, everyone appears here with live XP tracking.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {team.members.map((member) => {
                const sharePct = Math.round(
                  (member.xpContribution / Math.max(1, totalTeamXp)) * 100
                );
                return (
                  <div
                    key={member.id}
                    className="p-3.5 sm:p-4 rounded-[14px] bg-[#F6F4F1] border border-[#000000]/25 space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-[10px] bg-[#000000] text-[#F6F4F1] flex items-center justify-center text-xs font-bold shrink-0">
                          {member.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#000000] truncate">
                            {member.name}{' '}
                            {member.isCurrentUser && (
                              <span className="text-xs font-bold text-[#F95C4B]">(You)</span>
                            )}
                          </p>
                          <p className="text-xs text-[#4C4841] truncate">
                            {member.year} · {member.branch}
                          </p>
                        </div>
                      </div>

                      <select
                        value={member.role}
                        onChange={(e) => updateMemberRole(member.id, e.target.value)}
                        aria-label={`Assign role for ${member.name}`}
                        className="h-9 px-2.5 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs font-semibold text-[#000000] focus:outline-none"
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#4C4841]">XP Contribution</span>
                        <span className="font-mono font-bold text-[#000000] tabular-nums">
                          {member.xpContribution.toLocaleString()} XP ({sharePct}%)
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#E4DED2] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#F95C4B]"
                          style={{ width: `${sharePct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Explore Teammates */}
        <div
          className={`${
            mobileTab === 'explore' ? 'flex' : 'hidden lg:flex'
          } lg:col-span-5 argon-card p-4 sm:p-6 flex-col justify-between`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-[16px] sm:text-[17px] font-bold text-[#000000]">
                  Find Teammates
                </h3>
                <p className="text-xs text-[#4C4841]">
                  Open students looking for a sprint team across AVCOE.
                </p>
              </div>
              <Sparkles size={17} className="text-[#F95C4B] shrink-0" />
            </div>

            {candidates.length === 0 ? (
              <div className="p-6 rounded-[14px] bg-[#F6F4F1] border border-[#000000]/20 text-center space-y-1.5">
                <UserPlus size={20} className="mx-auto text-[#000000]" />
                <p className="text-xs font-bold text-[#000000]">No open teammate requests</p>
                <p className="text-[11px] text-[#4C4841]">
                  Admins assign teams directly from Hackathon Rosters or Teams &amp; Logos.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5 mb-3 overflow-x-auto no-scrollbar">
                  {['All', 'Backend', 'UI/UX', 'IoT', 'Data'].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setSkillFilter(f)}
                      className={`px-3 py-1 rounded-[9px] text-xs font-bold cursor-pointer shrink-0 border border-[#000000] ${
                        skillFilter === f
                          ? 'bg-[#000000] text-[#F6F4F1]'
                          : 'bg-[#F6F4F1] text-[#000000]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                <div className="space-y-2.5">
                  {filteredCandidates.map((cand) => (
                    <div
                      key={cand.id}
                      className="p-3 rounded-[14px] bg-[#F6F4F1] border border-[#000000]/25 flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-[10px] bg-[#000000] text-[#F6F4F1] flex items-center justify-center text-xs font-bold shrink-0">
                          {cand.initials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#000000] truncate">{cand.name}</p>
                          <p className="text-xs text-[#4C4841]">
                            {cand.primaryRole} · {cand.year} {cand.branch}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={cand.invited}
                        onClick={() => inviteCandidate(cand.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-[10px] text-xs font-bold shrink-0 ${
                          cand.invited
                            ? 'bg-[#E4DED2] text-[#4C4841] cursor-default'
                            : 'argon-btn-primary cursor-pointer'
                        }`}
                      >
                        <UserPlus size={12} />
                        <span>{cand.invited ? 'Invited' : 'Invite'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Configure / Create Team Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/55">
          <form onSubmit={handleSaveTeam} className="argon-card max-w-md w-full p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-[#000000]">Configure Hackathon Team</h4>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="p-1.5 rounded-lg text-[#000000] hover:bg-[#F6F4F1] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#000000] mb-1">Team Name</label>
              <input
                required
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Team Apex"
                className="w-full h-10 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-sm text-[#000000] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#000000] mb-1">Target Hackathon</label>
              <input
                required
                type="text"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                placeholder="e.g., AVCOE Buildathon 2026"
                className="w-full h-10 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-sm text-[#000000] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#000000] mb-1">Team Motto / Focus</label>
              <input
                type="text"
                value={newTagline}
                onChange={(e) => setNewTagline(e.target.value)}
                placeholder="What is your team building?"
                className="w-full h-10 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-sm text-[#000000] focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="px-4 py-2 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs font-bold text-[#000000] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="argon-btn-primary px-5 py-2 text-xs font-bold cursor-pointer"
              >
                Save Team
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
