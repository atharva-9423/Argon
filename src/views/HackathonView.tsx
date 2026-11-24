import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Flame,
  MapPin,
  Rocket,
  Shield,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { useArgon } from '../context/ArgonContext';
import { ASSETS } from '../data/mockData';
import { EventItem } from '../types';
import { HackathonConfirmModal } from '../components/ui/HackathonConfirmModal';

type MobileTab = 'hackathons' | 'checklist';

function useCountdown(targetIso: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const diff = Math.max(0, new Date(targetIso).getTime() - now);
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export const HackathonView: React.FC = () => {
  const {
    events,
    currentUser,
    confirmEventRegistration,
    cancelEventRegistration,
    team,
    readinessPct,
    toggleMilestone,
    setActiveTab,
    themeMode,
    materialPalette,
  } = useArgon();

  const [confirmEvent, setConfirmEvent] = useState<EventItem | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>('hackathons');
  const isMaterial = themeMode === 'google-material';

  const hackathonEvents = useMemo(
    () =>
      events.filter(
        (ev) =>
          ev.category === 'Internal Hackathon' ||
          ev.category === 'National Hackathon' ||
          ev.category === 'Innovation Challenge'
      ),
    [events]
  );

  const flagship = hackathonEvents[0] || null;
  const countdown = useCountdown(flagship?.targetDateIso || new Date().toISOString());

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Mobile Sub-Tabs (< lg) to eliminate vertical scrolling */}
      <div className="lg:hidden flex items-center gap-1.5 p-1 rounded-[14px] bg-[#E4DED2] border-[1.25px] border-[#000000]">
        <button
          type="button"
          onClick={() => setMobileTab('hackathons')}
          className={`flex-1 py-2 rounded-[10px] text-xs font-bold cursor-pointer ${
            mobileTab === 'hackathons' ? 'bg-[#000000] text-[#F6F4F1]' : 'text-[#000000]'
          }`}
        >
          Hackathons ({hackathonEvents.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('checklist')}
          className={`flex-1 py-2 rounded-[10px] text-xs font-bold cursor-pointer ${
            mobileTab === 'checklist' ? 'bg-[#000000] text-[#F6F4F1]' : 'text-[#000000]'
          }`}
        >
          Team Checklist ({readinessPct}%)
        </button>
      </div>

      {/* Empty State when no hackathons have been published */}
      {hackathonEvents.length === 0 ? (
        <section
          className={`${
            mobileTab === 'hackathons' ? 'block' : 'hidden lg:block'
          } argon-card p-6 sm:p-10 text-center space-y-4`}
        >
          <div className="w-12 h-12 rounded-[14px] bg-[#000000] text-[#F95C4B] flex items-center justify-center mx-auto border border-[#000000]">
            <Rocket size={22} />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#000000]">
              No hackathons published yet
            </h2>
            <p className="text-xs sm:text-sm text-[#4C4841] leading-relaxed">
              {currentUser?.role === 'Admin'
                ? 'Create your first hackathon from the Admin Panel. Members will see it here immediately and register with confirmation.'
                : 'Once your club admin publishes a hackathon, you can view details, confirm your registration, and track your assigned team here.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            {currentUser?.role === 'Admin' && (
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className="argon-btn-primary px-5 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Shield size={14} />
                <span>Add Hackathon in Admin</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('events')}
              className="argon-btn-dark px-4 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Browse All Events</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </section>
      ) : (
        <div className={mobileTab === 'hackathons' ? 'space-y-4 lg:space-y-6' : 'hidden lg:block lg:space-y-6'}>
          {/* 1. Flagship Hackathon Hero Banner */}
          {flagship && (
            <section className="argon-hero-card relative overflow-hidden p-4 sm:p-6 lg:p-7">
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-center">
                <div className="lg:col-span-7 space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-[#000000] text-[#F6F4F1] text-[11px] font-bold">
                    <Rocket size={13} className="text-[#F95C4B]" />
                    <span>{flagship.category}</span>
                  </div>

                  <div>
                    <h2 className="text-[20px] sm:text-[28px] font-extrabold tracking-[-0.03em] leading-[1.15] text-[#000000]">
                      {flagship.title}
                    </h2>
                    <p className="mt-1.5 text-xs sm:text-sm text-[#4C4841] leading-relaxed max-w-2xl line-clamp-3">
                      {flagship.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-[#3A3732]">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={13} className="text-[#F95C4B]" />
                      {flagship.mode}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Trophy size={13} className="text-[#F95C4B]" />
                      {flagship.prizeOrOutcome}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users size={13} className="text-[#F95C4B]" />
                      {flagship.participantsCount}/{flagship.maxParticipants} registered
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setConfirmEvent(flagship)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        flagship.registered
                          ? 'bg-[#000000] text-[#F6F4F1] border border-[#000000]'
                          : 'argon-btn-primary'
                      }`}
                    >
                      {flagship.registered ? (
                        <>
                          <CheckCircle2 size={15} className="text-[#F95C4B]" />
                          <span>Registered · Manage</span>
                        </>
                      ) : (
                        <>
                          <Zap size={15} />
                          <span>Register (+{flagship.xpReward} XP)</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('teams')}
                      className="argon-btn-dark inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold cursor-pointer"
                    >
                      <span>My Team</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* Right: Compact Visual + Countdown */}
                <div className="lg:col-span-5 space-y-2.5">
                  <div className="hidden sm:block relative rounded-2xl overflow-hidden border border-[#000000] h-36">
                    <img
                      src={flagship.imageUrl || ASSETS.eventHackathon}
                      alt={flagship.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#000000]/70 via-transparent to-transparent" />
                    <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-[#F6F4F1] text-xs">
                      <span className="font-bold">Kickoff</span>
                      <span className="font-mono font-semibold tabular-nums">
                        {flagship.dateDisplay}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Days', val: countdown.days },
                      { label: 'Hrs', val: countdown.hours },
                      { label: 'Min', val: countdown.minutes },
                      { label: 'Sec', val: countdown.seconds },
                    ].map((unit) => (
                      <div
                        key={unit.label}
                        className="rounded-[12px] bg-[#F6F4F1] border-[1.25px] border-[#000000] py-2 text-center"
                      >
                        <span className="block font-mono text-base sm:text-lg font-extrabold text-[#000000] tabular-nums leading-none">
                          {String(unit.val).padStart(2, '0')}
                        </span>
                        <span className="block text-[10px] font-semibold text-[#4C4841] mt-1">
                          {unit.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 2. Compact 2-Column Mobile Stats Row */}
          <section className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
            {[
              {
                label: 'Open Hackathons',
                value: String(hackathonEvents.length),
                sub: 'Live in RTDB',
                icon: Flame,
              },
              {
                label: 'My Team',
                value: team.id ? team.name : 'Unassigned',
                sub: team.id ? `${team.members.length} member(s)` : 'Assigned by Admin',
                icon: Users,
              },
              {
                label: 'Readiness',
                value: `${readinessPct}%`,
                sub: `${team.milestones.filter((m) => m.completed).length}/${team.milestones.length} milestones`,
                icon: Target,
              },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`argon-card p-3 sm:p-4 flex items-center gap-3 ${
                    idx === 2 ? 'col-span-2 lg:col-span-1' : ''
                  }`}
                >
                  <div
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-[12px] flex items-center justify-center shrink-0 border border-[#000000]"
                    style={{
                      backgroundColor: isMaterial ? materialPalette.primaryContainer : '#000000',
                      color: isMaterial ? materialPalette.onPrimaryContainer : '#F95C4B',
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-[#4C4841] truncate">
                      {stat.label}
                    </p>
                    <p className="text-base sm:text-lg font-extrabold tracking-tight text-[#000000] truncate">
                      {stat.value}
                    </p>
                    <p className="text-[10.5px] text-[#5F5851] truncate">{stat.sub}</p>
                  </div>
                </div>
              );
            })}
          </section>

          {/* 3. All Published Hackathons Directory */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[16px] sm:text-[18px] font-bold text-[#000000]">
                All Published Hackathons
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('events')}
                className="text-xs font-bold text-[#F95C4B] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>All Events</span>
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {hackathonEvents.map((ev) => {
                const pct =
                  ev.maxParticipants > 0
                    ? Math.min(100, Math.round((ev.participantsCount / ev.maxParticipants) * 100))
                    : 0;
                return (
                  <article
                    key={ev.id}
                    className="argon-card p-4 sm:p-5 flex flex-col justify-between gap-3.5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-[11px] font-bold">
                        <span className="text-[#F95C4B]">{ev.category}</span>
                        <span className="font-mono text-[#000000]">+{ev.xpReward} XP</span>
                      </div>
                      <h4 className="mt-1 text-[15px] sm:text-[16px] font-bold text-[#000000]">
                        {ev.title}
                      </h4>
                      <p className="mt-0.5 text-xs text-[#4C4841]">
                        {ev.dateDisplay} · {ev.mode}
                      </p>
                      <p className="mt-2 text-xs text-[#3A3732] leading-relaxed line-clamp-2">
                        {ev.description}
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-[#4C4841] mb-1">
                          <span>
                            {ev.participantsCount}/{ev.maxParticipants} registered
                          </span>
                          <span className="font-mono tabular-nums">{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#F6F4F1] border border-[#000000]/20 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#F95C4B]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setConfirmEvent(ev)}
                        className={`w-full py-2.5 rounded-[12px] text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          ev.registered
                            ? 'bg-[#000000] text-[#F6F4F1] border border-[#000000]'
                            : 'argon-btn-primary'
                        }`}
                      >
                        {ev.registered ? (
                          <>
                            <CheckCircle2 size={14} className="text-[#F95C4B]" />
                            <span>Registered · Click to Manage</span>
                          </>
                        ) : (
                          <>
                            <Zap size={14} />
                            <span>Register Now (+{ev.xpReward} XP)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* 4. Team Submission Checklist (Dedicated tab on mobile, always visible below on desktop) */}
      <section
        className={`${
          mobileTab === 'checklist' ? 'block' : 'hidden lg:block'
        } argon-card p-4 sm:p-6`}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-[16px] sm:text-[17px] font-bold text-[#000000]">
              {team.id ? `${team.name} — Submission Checklist` : 'Hackathon Submission Checklist'}
            </h3>
            <p className="text-xs text-[#4C4841] mt-0.5">
              Track your sprint milestones from team formation to final demo.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-[10px] bg-[#000000] font-mono text-xs font-bold text-[#F6F4F1] tabular-nums">
            {readinessPct}%
          </span>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {team.milestones.map((ms) => (
            <li key={ms.id}>
              <button
                type="button"
                onClick={() => toggleMilestone(ms.id)}
                className="w-full flex items-center justify-between gap-2 text-left text-xs py-2.5 px-3 rounded-[12px] bg-[#F6F4F1] border border-[#000000]/20 hover:border-[#000000] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2 min-w-0">
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
                    className={`truncate ${
                      ms.completed ? 'font-bold text-[#000000]' : 'font-medium text-[#3A3732]'
                    }`}
                  >
                    {ms.label}
                  </span>
                </span>
                <span className="text-[10.5px] font-mono text-[#5F5851] shrink-0">
                  {ms.dueLabel}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <HackathonConfirmModal
        event={confirmEvent}
        isRegistered={Boolean(confirmEvent?.registered)}
        currentUser={currentUser}
        onConfirmRegister={confirmEventRegistration}
        onConfirmCancel={cancelEventRegistration}
        onClose={() => setConfirmEvent(null)}
      />
    </div>
  );
};
