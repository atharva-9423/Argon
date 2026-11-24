import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, CheckCircle2, Shield, Trophy, Users, Zap } from 'lucide-react';
import { useArgon } from '../context/ArgonContext';
import { EventItem } from '../types';
import { HackathonConfirmModal } from '../components/ui/HackathonConfirmModal';

function useCountdown(targetIso: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const diff = Math.max(0, new Date(targetIso).getTime() - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

const EventCard: React.FC<{
  event: EventItem;
  onToggleRegister: (id: string) => void;
}> = ({ event, onToggleRegister }) => {
  const { days, hours, minutes, seconds } = useCountdown(event.targetDateIso);
  const fillPct =
    event.maxParticipants > 0
      ? Math.min(100, Math.round((event.participantsCount / event.maxParticipants) * 100))
      : 0;

  return (
    <article className="argon-card overflow-hidden flex flex-col justify-between">
      <div>
        <div className="relative h-32 sm:h-44 w-full bg-[#F6F4F1] overflow-hidden border-b border-[#000000]/15">
          <img
            src={event.imageUrl}
            alt={event.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#000000]/75 to-transparent" />
          <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-[#F6F4F1] text-xs">
            <span className="font-bold">{event.category}</span>
            <span className="font-mono font-bold tabular-nums">+{event.xpReward} XP</span>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <p className="text-[11.5px] font-semibold text-[#4C4841]">
            {event.dateDisplay} · {event.mode}
          </p>
          <h3 className="mt-1 text-[16px] sm:text-[18px] font-bold text-[#000000] tracking-[-0.01em]">
            {event.title}
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-[#3A3732] leading-relaxed line-clamp-2 sm:line-clamp-3">
            {event.description}
          </p>

          <p className="mt-2.5 text-xs font-bold text-[#F95C4B] flex items-center gap-1.5">
            <Trophy size={13} className="shrink-0" />
            <span className="truncate">{event.prizeOrOutcome}</span>
          </p>

          {/* Compact Countdown Blocks */}
          <div className="mt-3 grid grid-cols-4 gap-1.5 sm:gap-2">
            {[
              { label: 'Days', val: days },
              { label: 'Hrs', val: hours },
              { label: 'Min', val: minutes },
              { label: 'Sec', val: seconds },
            ].map((unit) => (
              <div
                key={unit.label}
                className="rounded-[10px] bg-[#F6F4F1] border border-[#000000]/25 py-1.5 text-center"
              >
                <span className="block font-mono text-sm sm:text-base font-extrabold text-[#000000] tabular-nums leading-none">
                  {String(unit.val).padStart(2, '0')}
                </span>
                <span className="block text-[9.5px] font-semibold text-[#4C4841] mt-0.5">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 space-y-2.5">
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#4C4841] mb-1">
            <span className="flex items-center gap-1">
              <Users size={12} />
              <span>
                {event.participantsCount} / {event.maxParticipants} registered
              </span>
            </span>
            <span className="font-mono tabular-nums">{fillPct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#F6F4F1] border border-[#000000]/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#F95C4B]"
              style={{ width: `${fillPct}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggleRegister(event.id)}
          className={`w-full py-2.5 rounded-[12px] text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            event.registered
              ? 'bg-[#000000] text-[#F6F4F1] border border-[#000000]'
              : 'argon-btn-primary'
          }`}
        >
          {event.registered ? (
            <>
              <CheckCircle2 size={14} className="text-[#F95C4B]" />
              <span>Registered · Click to Manage</span>
            </>
          ) : (
            <>
              <Zap size={14} />
              <span>Register (+{event.xpReward} XP)</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
};

export const EventsView: React.FC = () => {
  const {
    events,
    currentUser,
    confirmEventRegistration,
    cancelEventRegistration,
    setActiveTab,
  } = useArgon();
  const [category, setCategory] = useState<'All' | EventItem['category']>('All');
  const [confirmEvent, setConfirmEvent] = useState<EventItem | null>(null);

  const registeredCount = events.filter((e) => e.registered).length;

  const filtered = useMemo(() => {
    if (category === 'All') return events;
    return events.filter((e) => e.category === category);
  }, [events, category]);

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#000000] tracking-[-0.02em]">
            Hackathons & Club Events
          </h2>
          <p className="text-xs sm:text-sm text-[#4C4841]">
            Register with confirmation — synced live with Admin rosters.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[12px] bg-[#E4DED2] border-[1.25px] border-[#000000] text-xs font-bold text-[#000000] self-start sm:self-auto">
          <Calendar size={14} className="text-[#F95C4B]" />
          <span>My Registered: {registeredCount}</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {(
          [
            'All',
            'Internal Hackathon',
            'National Hackathon',
            'Innovation Challenge',
            'Coding Competition',
            'Guest Lecture',
          ] as const
        ).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-[11px] text-xs font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 border-[1.25px] border-[#000000] ${
              category === cat
                ? 'bg-[#000000] text-[#F6F4F1]'
                : 'bg-[#F6F4F1] text-[#000000]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Event Cards Grid or Empty State */}
      {filtered.length === 0 ? (
        <section className="argon-card p-8 sm:p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-[14px] bg-[#000000] text-[#F95C4B] flex items-center justify-center mx-auto">
            <Calendar size={22} />
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-[#000000]">
            {events.length === 0
              ? 'No events or hackathons posted yet'
              : `No events in "${category}"`}
          </h3>
          <p className="text-xs sm:text-sm text-[#4C4841] max-w-md mx-auto">
            {events.length === 0
              ? currentUser?.role === 'Admin'
                ? 'Publish your first hackathon or campus event in the Admin Panel.'
                : 'Events published by your club admin will appear here for registration.'
              : 'Try selecting "All" to view other published events.'}
          </p>
          {events.length === 0 && currentUser?.role === 'Admin' && (
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className="argon-btn-primary px-5 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Shield size={14} />
              <span>Post Event in Admin</span>
            </button>
          )}
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          {filtered.map((ev) => (
            <EventCard
              key={ev.id}
              event={ev}
              onToggleRegister={(id) => {
                const found = events.find((item) => item.id === id);
                if (found) setConfirmEvent(found);
              }}
            />
          ))}
        </div>
      )}

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
