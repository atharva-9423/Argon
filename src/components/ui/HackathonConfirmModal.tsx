import React, { useState } from 'react';
import { Calendar, CheckCircle2, MapPin, Rocket, Trophy, Users, X, Zap } from 'lucide-react';
import { EventItem, ManagedUser } from '../../types';

interface HackathonConfirmModalProps {
  event: EventItem | null;
  isRegistered: boolean;
  currentUser: ManagedUser | null;
  onConfirmRegister: (eventId: string, trackPreference: string) => void;
  onConfirmCancel: (eventId: string) => void;
  onClose: () => void;
}

const TRACK_OPTIONS = [
  'AI & Agents',
  'Web & Full-Stack',
  'Campus Systems',
  'AgriTech',
  'IoT & Hardware',
  'UI/UX & Product',
];

export const HackathonConfirmModal: React.FC<HackathonConfirmModalProps> = ({
  event,
  isRegistered,
  currentUser,
  onConfirmRegister,
  onConfirmCancel,
  onClose,
}) => {
  const [trackPref, setTrackPref] = useState<string>(TRACK_OPTIONS[0]);

  if (!event) return null;

  const isHackathon =
    event.category === 'Internal Hackathon' ||
    event.category === 'National Hackathon' ||
    event.category === 'Innovation Challenge';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hackathon-confirm-title"
    >
      <div className="w-full max-w-lg rounded-[22px] bg-[#F6F4F1] border-[1.5px] border-[#000000] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#000000] text-[#F6F4F1] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[11px] bg-[#F95C4B] text-[#F6F4F1] flex items-center justify-center shrink-0">
              {isRegistered ? <CheckCircle2 size={18} /> : <Rocket size={18} />}
            </div>
            <div>
              <h3 id="hackathon-confirm-title" className="text-sm font-bold">
                {isRegistered
                  ? `Cancel ${isHackathon ? 'Hackathon' : 'Event'} Registration?`
                  : `Confirm ${isHackathon ? 'Hackathon' : 'Event'} Registration`}
              </h3>
              <p className="text-[11px] text-[#E4DED2]">
                {isRegistered
                  ? 'Your slot will be released and synced with the Admin roster.'
                  : 'Review your details below before locking in your registration.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close confirmation dialog"
            className="p-1.5 rounded-[8px] bg-[#1F1E1C] text-[#F6F4F1] hover:bg-[#F95C4B] transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Event Summary Box */}
          <div className="p-4 rounded-[16px] bg-[#E4DED2] border border-[#000000] space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="px-2.5 py-0.5 rounded-[8px] bg-[#000000] text-[#F6F4F1] text-[10.5px] font-bold">
                {event.category}
              </span>
              <span className="font-mono text-xs font-bold text-[#F95C4B]">
                +{event.xpReward} XP Event
              </span>
            </div>
            <h4 className="text-base font-bold text-[#000000] leading-snug">{event.title}</h4>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-[#3C3934] font-medium">
              <span className="inline-flex items-center gap-1">
                <Calendar size={12} className="text-[#F95C4B]" />
                {event.dateDisplay}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} className="text-[#F95C4B]" />
                {event.mode}
              </span>
              <span className="inline-flex items-center gap-1">
                <Trophy size={12} className="text-[#F95C4B]" />
                {event.prizeOrOutcome}
              </span>
            </div>
          </div>

          {/* Member Info Box */}
          <div className="p-3.5 rounded-[14px] bg-[#F6F4F1] border border-[#000000] space-y-1.5 text-xs">
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#4C4841]">
              Participant Details
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#4C4841]">Student Name</span>
              <span className="font-bold text-[#000000]">{currentUser?.name || 'Member'}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#4C4841]">Email</span>
              <span className="font-mono font-semibold text-[#000000] truncate">
                {currentUser?.email || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#4C4841]">Branch &amp; Year</span>
              <span className="font-semibold text-[#000000]">
                {currentUser ? `${currentUser.branch} (${currentUser.year})` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#4C4841] inline-flex items-center gap-1">
                <Users size={12} />
                Current Team
              </span>
              <span className="px-2 py-0.5 rounded-[6px] bg-[#E4DED2] border border-[#000000] font-bold text-[11px] text-[#000000]">
                {currentUser?.teamName || 'Unassigned (Admin will assign)'}
              </span>
            </div>
          </div>

          {/* Preferred Track Selector when registering */}
          {!isRegistered && (
            <div>
              <label className="block text-[11px] font-bold text-[#000000] mb-1.5">
                Preferred Problem Track / Focus Area
              </label>
              <select
                value={trackPref}
                onChange={(e) => setTrackPref(e.target.value)}
                className="w-full h-10 px-3 rounded-[12px] bg-[#E4DED2] border border-[#000000] text-xs font-bold text-[#000000] cursor-pointer"
              >
                {TRACK_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-[12px] bg-[#E4DED2] border border-[#000000] text-[#000000] text-xs font-bold cursor-pointer hover:bg-[#D5CEC1]"
            >
              Keep Reviewing
            </button>

            {isRegistered ? (
              <button
                type="button"
                onClick={() => {
                  onConfirmCancel(event.id);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-[12px] bg-[#000000] text-[#F6F4F1] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer hover:bg-[#F95C4B] transition-colors"
              >
                <span>Confirm Cancellation</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onConfirmRegister(event.id, trackPref);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-[12px] bg-[#F95C4B] border border-[#000000] text-[#F6F4F1] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer hover:bg-[#E64C3B] transition-colors"
              >
                <Zap size={13} />
                <span>Confirm Registration (+50 XP)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
