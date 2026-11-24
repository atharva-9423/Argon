import React, { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  MapPin,
  Monitor,
  PlayCircle,
  QrCode,
  Shield,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import { useArgon } from '../context/ArgonContext';
import { LiveSession } from '../types';

type SessionFilter = 'All' | 'Online' | 'Offline' | 'Recorded Archive';

export const LiveSessionsView: React.FC = () => {
  const {
    sessions,
    currentUser,
    setActiveTab,
    toggleSessionRegistration,
    checkInSession,
    markRecordingWatched,
  } = useArgon();
  const [filter, setFilter] = useState<SessionFilter>('All');
  const [checkInTarget, setCheckInTarget] = useState<LiveSession | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');

  const filtered = useMemo(() => {
    if (filter === 'All') return sessions;
    if (filter === 'Recorded Archive') return sessions.filter((s) => s.isPast);
    return sessions.filter((s) => !s.isPast && s.mode === filter);
  }, [sessions, filter]);

  const handleConfirmCheckIn = (useQrSim = false) => {
    if (!checkInTarget) return;
    const ok = checkInSession(checkInTarget.id, useQrSim ? 'QR-VERIFIED' : codeInput);
    if (ok) {
      setCheckInTarget(null);
      setCodeInput('');
      setCodeError('');
    } else {
      setCodeError('Check-in code does not match. Ask your session host for the active code.');
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Compact Header Banner */}
      <section className="argon-card p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold text-[#F95C4B]">
            Hybrid Learning · Online &amp; Campus Workshops
          </p>
          <h2 className="mt-0.5 text-lg sm:text-xl font-bold text-[#000000] tracking-[-0.02em]">
            Live Sessions &amp; Lab Workshops
          </h2>
          <p className="mt-0.5 text-xs sm:text-sm text-[#4C4841]">
            Register for upcoming club sessions and verify attendance with your session code.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs shrink-0">
          <div className="px-3 py-2 rounded-[12px] bg-[#F6F4F1] border border-[#000000]">
            <p className="text-[10.5px] text-[#4C4841]">Scheduled</p>
            <p className="font-mono font-extrabold text-[#000000] text-sm">{sessions.length}</p>
          </div>
          <div className="px-3 py-2 rounded-[12px] bg-[#000000] text-[#F6F4F1] border border-[#000000]">
            <p className="text-[10.5px] text-[#E4DED2]">Registration</p>
            <p className="font-bold text-sm">100% Free</p>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {(['All', 'Online', 'Offline', 'Recorded Archive'] as SessionFilter[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-[11px] text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 border-[1.25px] border-[#000000] ${
              filter === tab ? 'bg-[#000000] text-[#F6F4F1]' : 'bg-[#F6F4F1] text-[#000000]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sessions Grid or Empty State */}
      {filtered.length === 0 ? (
        <section className="argon-card p-8 sm:p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-[14px] bg-[#000000] text-[#F95C4B] flex items-center justify-center mx-auto">
            <Calendar size={22} />
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-[#000000]">
            {sessions.length === 0
              ? 'No live sessions scheduled yet'
              : `No ${filter.toLowerCase()} sessions available`}
          </h3>
          <p className="text-xs sm:text-sm text-[#4C4841] max-w-md mx-auto">
            {sessions.length === 0
              ? currentUser?.role === 'Admin'
                ? 'Schedule an online lecture or campus workshop from the Admin Panel.'
                : 'Upcoming workshops and check-in codes published by your club admin will appear here.'
              : 'Switch back to "All" to see other scheduled sessions.'}
          </p>
          {sessions.length === 0 && currentUser?.role === 'Admin' && (
            <button
              type="button"
              onClick={() => setActiveTab('admin')}
              className="argon-btn-primary px-5 py-2.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Shield size={14} />
              <span>Schedule Session in Admin</span>
            </button>
          )}
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((sess) => {
            const seatsLeft = Math.max(0, sess.seatsTotal - sess.seatsFilled);
            return (
              <article key={sess.id} className="argon-card p-4 sm:p-5 flex flex-col justify-between gap-3.5">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-[11px] bg-[#000000] text-[#F95C4B] flex items-center justify-center shrink-0">
                        {sess.mode === 'Online' ? <Monitor size={17} /> : <MapPin size={17} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-[#4C4841] truncate">
                          <span className="text-[#000000]">{sess.mode}</span> · {sess.track}
                        </p>
                        <h3 className="text-[15px] sm:text-[16px] font-bold text-[#000000] truncate">
                          {sess.title}
                        </h3>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#F95C4B] shrink-0 tabular-nums">
                      +{sess.xpReward} XP
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-[#3A3732]">
                    <p className="flex items-center gap-1.5">
                      <Clock size={13} className="text-[#4C4841] shrink-0" />
                      <span>
                        {sess.dateLabel} · {sess.timeRange}
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <UserCheck size={13} className="text-[#4C4841] shrink-0" />
                      <span className="truncate">{sess.instructor}</span>
                    </p>
                    <p className="sm:col-span-2 flex items-center gap-1.5 text-[#4C4841]">
                      <ShieldCheck size={13} className="text-[#F95C4B] shrink-0" />
                      <span className="truncate">
                        {sess.venueOrLink} · {sess.durationHrs} hrs
                        {!sess.isPast && ` · ${seatsLeft} seats left`}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#000000]/15 flex flex-wrap items-center justify-between gap-2">
                  {sess.isPast ? (
                    <>
                      <div className="flex items-center gap-1.5 text-xs text-[#3A3732]">
                        <FileText size={14} className="text-[#000000]" />
                        <span>{sess.slidesLabel || 'Session Recording'}</span>
                      </div>
                      <button
                        type="button"
                        disabled={sess.watchedRecording}
                        onClick={() => markRecordingWatched(sess.id)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-xs font-bold ${
                          sess.watchedRecording
                            ? 'bg-[#E4DED2] text-[#4C4841] cursor-default'
                            : 'argon-btn-dark cursor-pointer'
                        }`}
                      >
                        {sess.watchedRecording ? (
                          <>
                            <CheckCircle2 size={14} />
                            <span>Watched</span>
                          </>
                        ) : (
                          <>
                            <PlayCircle size={14} />
                            <span>Watch (+60 XP)</span>
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-semibold text-[#4C4841]">
                        {sess.attended
                          ? 'Attendance Verified'
                          : sess.registered
                          ? 'Registered'
                          : 'Open for registration'}
                      </span>

                      <div className="flex items-center gap-2">
                        {!sess.attended && (
                          <button
                            type="button"
                            onClick={() => toggleSessionRegistration(sess.id)}
                            className={`px-3.5 py-2 rounded-[10px] text-xs font-bold cursor-pointer ${
                              sess.registered
                                ? 'bg-[#F6F4F1] border border-[#000000] text-[#000000]'
                                : 'argon-btn-primary'
                            }`}
                          >
                            {sess.registered ? 'Cancel Seat' : 'Register Free'}
                          </button>
                        )}

                        {sess.registered && !sess.attended && (
                          <button
                            type="button"
                            onClick={() => {
                              setCheckInTarget(sess);
                              setCodeInput('');
                              setCodeError('');
                            }}
                            className="argon-btn-dark inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold cursor-pointer"
                          >
                            <QrCode size={14} />
                            <span>Check In</span>
                          </button>
                        )}

                        {sess.attended && (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[10px] bg-[#000000] text-[#F6F4F1] text-xs font-bold">
                            <CheckCircle2 size={14} className="text-[#F95C4B]" />
                            <span>Attended</span>
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Check-In Modal */}
      {checkInTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/55">
          <div className="argon-card max-w-md w-full p-5 sm:p-6">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-mono font-bold text-[#F95C4B]">
                  Attendance Check-In · +{checkInTarget.xpReward} XP
                </p>
                <h4 className="mt-1 text-base sm:text-lg font-bold text-[#000000]">
                  {checkInTarget.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setCheckInTarget(null)}
                className="p-1.5 rounded-lg text-[#000000] hover:bg-[#F6F4F1] cursor-pointer"
                aria-label="Close check-in dialog"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-[#000000] mb-1.5">
                Enter session check-in code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => {
                    setCodeInput(e.target.value);
                    setCodeError('');
                  }}
                  placeholder="Enter code announced by host"
                  className="flex-1 h-10 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] font-mono text-xs text-[#000000] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleConfirmCheckIn(false)}
                  className="argon-btn-primary px-4 text-xs font-bold cursor-pointer"
                >
                  Verify
                </button>
              </div>
              {codeError && <p className="mt-1.5 text-xs font-semibold text-[#F95C4B]">{codeError}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
