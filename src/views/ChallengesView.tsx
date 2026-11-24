import React, { useMemo, useState } from 'react';
import { CheckCircle2, Clock, Flame, Play, Trophy, X, Zap } from 'lucide-react';
import { useArgon } from '../context/ArgonContext';
import { ChallengeItem } from '../types';

export const ChallengesView: React.FC = () => {
  const { challenges, completeChallenge, profile } = useArgon();
  const [difficulty, setDifficulty] = useState<'All' | ChallengeItem['difficulty']>('All');
  const [activeChallenge, setActiveChallenge] = useState<ChallengeItem | null>(null);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<'idle' | 'wrong' | 'correct'>('idle');

  const filtered = useMemo(() => {
    if (difficulty === 'All') return challenges;
    return challenges.filter((c) => c.difficulty === difficulty);
  }, [challenges, difficulty]);

  const solvedCount = challenges.filter((c) => c.completed).length;

  const handleSolveSubmit = () => {
    if (!activeChallenge || selectedOpt === null) return;
    if (selectedOpt === activeChallenge.correctIndex) {
      setStatusMsg('correct');
      completeChallenge(activeChallenge.id);
      window.setTimeout(() => {
        setActiveChallenge(null);
      }, 900);
    } else {
      setStatusMsg('wrong');
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Compact Header */}
      <section className="argon-card p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[12px] bg-[#000000] text-[#F95C4B] flex items-center justify-center shrink-0">
            <Flame size={21} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#000000] tracking-[-0.02em]">
              Weekly Skill Sprints
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-[#4C4841]">
              Solve micro-challenges to extend your streak and earn XP.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-2 rounded-[12px] bg-[#F6F4F1] border border-[#000000]">
            <p className="text-[10.5px] text-[#4C4841]">Streak</p>
            <p className="font-mono text-sm sm:text-base font-extrabold text-[#F95C4B] tabular-nums">
              {profile.streakDays}d
            </p>
          </div>
          <div className="px-3 py-2 rounded-[12px] bg-[#000000] text-[#F6F4F1] border border-[#000000]">
            <p className="text-[10.5px] text-[#E4DED2]">Cleared</p>
            <p className="font-mono text-sm sm:text-base font-extrabold tabular-nums">
              {solvedCount}/{challenges.length}
            </p>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {(['All', 'Beginner', 'Intermediate', 'Builder'] as const).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => setDifficulty(level)}
            className={`px-3 py-1.5 rounded-[11px] text-xs font-bold cursor-pointer shrink-0 border-[1.25px] border-[#000000] ${
              difficulty === level ? 'bg-[#000000] text-[#F6F4F1]' : 'bg-[#F6F4F1] text-[#000000]'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Challenges Grid or Empty State */}
      {filtered.length === 0 ? (
        <section className="argon-card p-8 sm:p-10 text-center space-y-2.5">
          <div className="w-12 h-12 rounded-[14px] bg-[#000000] text-[#F95C4B] flex items-center justify-center mx-auto">
            <Flame size={22} />
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-[#000000]">
            No weekly challenges posted yet
          </h3>
          <p className="text-xs sm:text-sm text-[#4C4841] max-w-md mx-auto">
            Weekly skill sprints and coding quizzes will appear here once published for your cohort.
          </p>
        </section>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((ch) => (
            <article key={ch.id} className="argon-card p-4 sm:p-6 flex flex-col justify-between gap-3.5">
              <div>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-[#4C4841]">
                    <strong className="text-[#000000]">{ch.category}</strong> · {ch.difficulty}
                  </span>
                  <span className="font-mono font-bold text-[#F95C4B] flex items-center gap-1 tabular-nums">
                    <Zap size={13} />+{ch.xp} XP
                  </span>
                </div>

                <h3 className="mt-1.5 text-[16px] font-bold text-[#000000]">{ch.title}</h3>
                <p className="mt-1 text-xs sm:text-sm text-[#3A3732] leading-relaxed">
                  {ch.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#000000]/15 flex items-center justify-between gap-3">
                <span className="text-xs text-[#4C4841] flex items-center gap-1.5">
                  <Clock size={13} />
                  <span>~{ch.estimatedMin} min</span>
                </span>

                <button
                  type="button"
                  disabled={ch.completed}
                  onClick={() => {
                    setActiveChallenge(ch);
                    setSelectedOpt(null);
                    setStatusMsg('idle');
                  }}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-xs font-bold ${
                    ch.completed
                      ? 'bg-[#000000] text-[#F6F4F1] cursor-default'
                      : 'argon-btn-primary cursor-pointer'
                  }`}
                >
                  {ch.completed ? (
                    <>
                      <CheckCircle2 size={14} className="text-[#F95C4B]" />
                      <span>Solved</span>
                    </>
                  ) : (
                    <>
                      <Play size={13} className="fill-current" />
                      <span>Solve</span>
                    </>
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Challenge Interactive Solver Modal */}
      {activeChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/55">
          <div className="argon-card max-w-lg w-full p-5 sm:p-6">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[10px] bg-[#000000] text-[#F95C4B] flex items-center justify-center">
                  <Trophy size={18} />
                </div>
                <div>
                  <p className="text-xs font-mono font-bold text-[#F95C4B]">
                    {activeChallenge.category} · +{activeChallenge.xp} XP
                  </p>
                  <h4 className="text-base font-bold text-[#000000]">{activeChallenge.title}</h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveChallenge(null)}
                className="p-1.5 rounded-lg text-[#000000] hover:bg-[#F6F4F1] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="mt-4 text-sm text-[#000000] leading-relaxed">{activeChallenge.question}</p>

            <div className="mt-4 space-y-2">
              {activeChallenge.options.map((opt, idx) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSelectedOpt(idx);
                    setStatusMsg('idle');
                  }}
                  className={`w-full text-left px-4 py-3 rounded-[12px] border-[1.25px] text-sm cursor-pointer ${
                    selectedOpt === idx
                      ? 'bg-[#000000] border-[#000000] font-bold text-[#F6F4F1]'
                      : 'bg-[#F6F4F1] border-[#000000]/30 text-[#000000]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {statusMsg === 'wrong' && (
              <p className="mt-3 text-xs font-bold text-[#F95C4B]">
                Close! Re-read the engineering trade-off and try another choice.
              </p>
            )}
            {statusMsg === 'correct' && (
              <p className="mt-3 text-xs font-bold text-[#000000]">
                Verified! Extending your streak and adding +{activeChallenge.xp} XP.
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveChallenge(null)}
                className="px-4 py-2 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs font-bold text-[#000000] cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                disabled={selectedOpt === null}
                onClick={handleSolveSubmit}
                className="argon-btn-primary px-5 py-2 text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                Verify Answer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
