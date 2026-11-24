import React, { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Code2,
  HelpCircle,
  Lock,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useArgon } from '../context/ArgonContext';
import { ANALYTICS_EXTRA } from '../data/mockData';
import { LearningMap3D } from '../components/LearningMap3D';
import { LessonItem } from '../types';

type MobileTab = 'map' | 'quests' | 'stats';

export const LearningPathView: React.FC = () => {
  const { islands, selectedIslandId, setSelectedIslandId, completeLesson, profile } = useArgon();
  const [mobileTab, setMobileTab] = useState<MobileTab>('quests');
  const [activeQuiz, setActiveQuiz] = useState<{ islandId: string; lesson: LessonItem } | null>(
    null
  );
  const [pickedOption, setPickedOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'idle' | 'wrong' | 'correct'>('idle');

  const selectedIsland = islands.find((i) => i.id === selectedIslandId) || islands[0];
  const firstActiveIsland = islands.find((i) => i.status === 'active') || islands[0];

  const totalLessons = useMemo(
    () => islands.reduce((acc, isl) => acc + isl.lessons.length, 0),
    [islands]
  );
  const completedLessons = useMemo(
    () => islands.reduce((acc, isl) => acc + isl.lessons.filter((l) => l.completed).length, 0),
    [islands]
  );
  const overallPct = Math.round((completedLessons / Math.max(1, totalLessons)) * 100);

  const selectedDone = selectedIsland.lessons.filter((l) => l.completed).length;
  const selectedPct = Math.round(
    (selectedDone / Math.max(1, selectedIsland.lessons.length)) * 100
  );

  const handleActionLesson = (lesson: LessonItem) => {
    if (lesson.completed || selectedIsland.status === 'locked') return;
    if (lesson.quizQuestion) {
      setActiveQuiz({ islandId: selectedIsland.id, lesson });
      setPickedOption(null);
      setQuizFeedback('idle');
    } else {
      completeLesson(selectedIsland.id, lesson.id);
    }
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz || pickedOption === null || !activeQuiz.lesson.quizQuestion) return;
    if (pickedOption === activeQuiz.lesson.quizQuestion.correctIndex) {
      setQuizFeedback('correct');
      completeLesson(activeQuiz.islandId, activeQuiz.lesson.id);
      window.setTimeout(() => setActiveQuiz(null), 900);
    } else {
      setQuizFeedback('wrong');
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Mobile Sub-Tabs (< lg) to avoid scrolling past 3D canvas + quests + 3 charts */}
      <div className="lg:hidden flex items-center gap-1.5 p-1 rounded-[14px] bg-[#E4DED2] border-[1.25px] border-[#000000]">
        {(
          [
            { id: 'quests', label: `Quests (${completedLessons}/${totalLessons})` },
            { id: 'map', label: '3D Map' },
            { id: 'stats', label: 'Stats' },
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

      {/* Mobile Island Switcher Strip (quick jump without needing to scroll 3D canvas) */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {islands.map((isl) => {
          const active = isl.id === selectedIsland.id;
          return (
            <button
              key={isl.id}
              type="button"
              onClick={() => setSelectedIslandId(isl.id)}
              className={`px-3 py-1.5 rounded-[10px] text-xs font-bold whitespace-nowrap cursor-pointer shrink-0 border-[1.25px] border-[#000000] inline-flex items-center gap-1 ${
                active ? 'bg-[#F95C4B] text-[#F6F4F1]' : 'bg-[#F6F4F1] text-[#000000]'
              }`}
            >
              <span>L{isl.level}</span>
              <span>{isl.name}</span>
              {isl.status === 'locked' && <Lock size={11} />}
            </button>
          );
        })}
      </div>

      {/* 1. INTERACTIVE 3D LEARNING ADVENTURE MAP */}
      <section className={mobileTab === 'map' ? 'space-y-3' : 'hidden lg:block lg:space-y-3'}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#000000] tracking-[-0.02em]">
              Interactive 3D Learning Map
            </h2>
            <p className="text-xs sm:text-sm text-[#4C4841]">
              Explore 6 connected voxel islands. Complete quests to unlock higher levels.
            </p>
          </div>
          <div className="text-xs text-[#4C4841] font-mono tabular-nums">
            Completion: <strong className="text-[#000000]">{overallPct}%</strong> (
            {completedLessons}/{totalLessons})
          </div>
        </div>

        <LearningMap3D
          islands={islands}
          selectedIslandId={selectedIsland.id}
          onSelectIsland={setSelectedIslandId}
        />
      </section>

      {/* 2. SELECTED ISLAND STAGE INSPECTOR */}
      <section
        className={`${
          mobileTab === 'quests' ? 'grid' : 'hidden lg:grid'
        } grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5`}
      >
        {/* Stage Overview + Checkpoints */}
        <div className="lg:col-span-5 argon-card p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 text-xs text-[#4C4841]">
              <span className="font-mono font-bold text-[#F95C4B]">
                Level {selectedIsland.level} of 6
              </span>
              <span className="font-semibold">
                {selectedIsland.status === 'completed'
                  ? 'Completed'
                  : selectedIsland.status === 'active'
                  ? 'Unlocked'
                  : `Requires ${selectedIsland.requiredXp.toLocaleString()} XP`}
              </span>
            </div>

            <h3 className="mt-1.5 text-xl sm:text-2xl font-extrabold text-[#000000] tracking-[-0.02em]">
              {selectedIsland.name}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-[#3A3732] leading-relaxed">
              {selectedIsland.subtitle}
            </p>

            {/* Stage Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-[#4C4841]">Stage Mastery</span>
                <span className="font-mono text-[#000000] tabular-nums">{selectedPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-[#F6F4F1] border border-[#000000]/20 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 bg-[#F95C4B]"
                  style={{ width: `${selectedPct}%` }}
                />
              </div>
            </div>

            {/* Checkpoints */}
            <div className="mt-4">
              <p className="text-xs font-bold text-[#4C4841] mb-2">Checkpoints</p>
              <div className="grid grid-cols-2 gap-2">
                {selectedIsland.checkpoints.map((cp, idx) => {
                  const reached =
                    selectedPct >= ((idx + 1) / selectedIsland.checkpoints.length) * 100;
                  return (
                    <div
                      key={cp}
                      className={`px-2.5 py-2 rounded-[10px] border text-xs font-semibold flex items-center gap-1.5 ${
                        reached
                          ? 'bg-[#000000] border-[#000000] text-[#F6F4F1]'
                          : 'bg-[#F6F4F1] border-[#000000]/25 text-[#4C4841]'
                      }`}
                    >
                      <CheckCircle2
                        size={13}
                        className={reached ? 'text-[#F95C4B] shrink-0' : 'opacity-40 shrink-0'}
                      />
                      <span className="truncate">{cp}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-[#000000]/15 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-[#000000] text-[#F95C4B] flex items-center justify-center">
                <Award size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#000000]">{selectedIsland.badgeName}</p>
                <p className="text-[11px] text-[#4C4841]">Island Badge</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-[#4C4841]">
              {selectedIsland.status === 'completed' ? 'Earned' : 'Finish stage'}
            </span>
          </div>
        </div>

        {/* Interactive Quests / Lessons / Quizzes */}
        <div className="lg:col-span-7 argon-card p-4 sm:p-6">
          <div className="mb-3.5">
            <h3 className="text-[16px] sm:text-[17px] font-bold text-[#000000]">
              Stage Lessons, Quizzes &amp; Projects
            </h3>
            <p className="text-xs text-[#4C4841]">
              Complete activities below to earn XP and unlock later voxel islands.
            </p>
          </div>

          {selectedIsland.status === 'locked' ? (
            <div className="rounded-[16px] bg-[#F6F4F1] border border-[#000000]/25 p-5 sm:p-6 text-center">
              <div className="w-11 h-11 rounded-[12px] bg-[#000000] text-[#F95C4B] flex items-center justify-center mx-auto">
                <Lock size={20} />
              </div>
              <h4 className="mt-3 text-base font-bold text-[#000000]">
                Island Locked ({selectedIsland.requiredXp.toLocaleString()} XP Required)
              </h4>
              <p className="mt-1 text-xs text-[#4C4841] max-w-md mx-auto">
                You have <strong className="font-mono text-[#000000]">{profile.xp.toLocaleString()} XP</strong>.
                Earn{' '}
                <strong className="font-mono text-[#F95C4B]">
                  {Math.max(0, selectedIsland.requiredXp - profile.xp).toLocaleString()} more XP
                </strong>{' '}
                to unlock {selectedIsland.name}.
              </p>
              <button
                type="button"
                onClick={() => setSelectedIslandId(firstActiveIsland.id)}
                className="mt-4 argon-btn-primary px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Jump to Active Island (Level {firstActiveIsland.level})
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {selectedIsland.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className={`p-3.5 rounded-[14px] border-[1.25px] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                    lesson.completed
                      ? 'bg-[#000000] border-[#000000] text-[#F6F4F1]'
                      : 'bg-[#F6F4F1] border-[#000000]/30 text-[#000000]'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${
                        lesson.completed
                          ? 'bg-[#F95C4B] text-[#F6F4F1]'
                          : 'bg-[#000000] text-[#F95C4B]'
                      }`}
                    >
                      {lesson.completed ? (
                        <CheckCircle2 size={17} />
                      ) : lesson.type === 'Quiz' ? (
                        <HelpCircle size={17} />
                      ) : lesson.type === 'Project' ? (
                        <Code2 size={17} />
                      ) : (
                        <BookOpen size={17} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{lesson.title}</p>
                      <p
                        className={`text-xs mt-0.5 ${
                          lesson.completed ? 'text-[#E4DED2]' : 'text-[#4C4841]'
                        }`}
                      >
                        {lesson.type} · {lesson.duration} ·{' '}
                        <span className="font-mono font-bold text-[#F95C4B]">+{lesson.xp} XP</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={lesson.completed}
                    onClick={() => handleActionLesson(lesson)}
                    className={`px-3.5 py-2 rounded-[10px] text-xs font-bold whitespace-nowrap shrink-0 ${
                      lesson.completed
                        ? 'bg-[#F6F4F1]/15 text-[#F6F4F1] cursor-default'
                        : 'argon-btn-primary cursor-pointer'
                    }`}
                  >
                    {lesson.completed
                      ? 'Completed'
                      : lesson.quizQuestion
                      ? 'Take Quiz'
                      : 'Mark Complete'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. LEARNING PROGRESS & PERSONAL ANALYTICS */}
      <section
        className={`${
          mobileTab === 'stats' ? 'grid' : 'hidden lg:grid'
        } grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5`}
      >
        <div className="lg:col-span-5 argon-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-[15px] sm:text-[16px] font-bold text-[#000000]">
                XP Growth Trajectory
              </h3>
              <p className="text-xs text-[#4C4841]">Your cumulative XP vs. team average</p>
            </div>
            <Zap size={17} className="text-[#F95C4B]" />
          </div>
          <div className="h-[180px] sm:h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={ANALYTICS_EXTRA.xpOverTime}
                margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              >
                <CartesianGrid stroke="rgba(0,0,0,0.12)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#3A3732', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#3A3732', fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="you" name="Your XP" stroke="#F95C4B" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="teamAvg" name="Team Avg" stroke="#000000" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-3 argon-card p-4 sm:p-6">
          <h3 className="text-[15px] sm:text-[16px] font-bold text-[#000000]">Assignment Scores</h3>
          <p className="text-xs text-[#4C4841] mb-3">Monthly verified average (%)</p>
          <div className="h-[180px] sm:h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ANALYTICS_EXTRA.assignmentScores}
                margin={{ top: 8, right: 4, left: -24, bottom: 0 }}
              >
                <CartesianGrid stroke="rgba(0,0,0,0.12)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#3A3732', fontSize: 11 }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#3A3732', fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="score" name="Score %" fill="#F95C4B" radius={[6, 6, 2, 2]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 argon-card p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[15px] sm:text-[16px] font-bold text-[#000000]">
                  Personal Skill Mastery
                </h3>
                <p className="text-xs text-[#4C4841]">Attendance: {profile.attendanceRate}%</p>
              </div>
              <Sparkles size={16} className="text-[#F95C4B]" />
            </div>

            <div className="space-y-2.5 mt-3">
              {ANALYTICS_EXTRA.skills.map((sk) => (
                <div key={sk.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-[#000000]">{sk.name}</span>
                    <span className="font-mono font-bold text-[#000000] tabular-nums">
                      {sk.level}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#F6F4F1] border border-[#000000]/20 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${sk.level}%`, backgroundColor: sk.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-[11px] text-[#4C4841]">
            Analytics update live as you complete quests and sessions.
          </p>
        </div>
      </section>

      {/* Interactive Quiz Modal */}
      {activeQuiz && activeQuiz.lesson.quizQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/55">
          <div className="argon-card max-w-lg w-full p-5 sm:p-6">
            <p className="text-xs font-mono font-bold text-[#F95C4B]">
              Stage Checkpoint Quiz · +{activeQuiz.lesson.xp} XP
            </p>
            <h4 className="mt-1 text-lg font-bold text-[#000000]">{activeQuiz.lesson.title}</h4>
            <p className="mt-3 text-sm text-[#3A3732] leading-relaxed">
              {activeQuiz.lesson.quizQuestion.prompt}
            </p>

            <div className="mt-4 space-y-2">
              {activeQuiz.lesson.quizQuestion.options.map((opt, idx) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setPickedOption(idx);
                    setQuizFeedback('idle');
                  }}
                  className={`w-full text-left px-4 py-3 rounded-[12px] border-[1.25px] text-sm cursor-pointer ${
                    pickedOption === idx
                      ? 'bg-[#000000] border-[#000000] font-bold text-[#F6F4F1]'
                      : 'bg-[#F6F4F1] border-[#000000]/30 text-[#000000]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {quizFeedback === 'wrong' && (
              <p className="mt-3 text-xs font-bold text-[#F95C4B]">
                Not quite right — give another option a try!
              </p>
            )}
            {quizFeedback === 'correct' && (
              <p className="mt-3 text-xs font-bold text-[#000000]">
                Correct! Awarding +{activeQuiz.lesson.xp} XP and saving checkpoint...
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveQuiz(null)}
                className="px-4 py-2 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs font-bold text-[#000000] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pickedOption === null}
                onClick={handleSubmitQuiz}
                className="argon-btn-primary px-5 py-2 text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                Submit Answer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
