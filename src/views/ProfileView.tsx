import React, { useState } from 'react';
import { Award, Flame, Github, Mail, RotateCcw, Save, Shield, Zap } from 'lucide-react';
import { getLevelInfo, useArgon } from '../context/ArgonContext';

export const ProfileView: React.FC = () => {
  const { profile, team, badges, updateProfile, resetDemoData } = useArgon();
  const [name, setName] = useState(profile.name);
  const [branch, setBranch] = useState(profile.branch);
  const [github, setGithub] = useState(profile.github);
  const [bio, setBio] = useState(profile.bio);
  const [skillsText, setSkillsText] = useState(profile.skills.join(', '));
  const [interestsText, setInterestsText] = useState(profile.interests.join(', '));

  const levelInfo = getLevelInfo(profile.xp);
  const unlockedBadges = badges.filter((b) => b.unlocked).length;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim() || profile.name,
      branch: branch.trim() || profile.branch,
      github: github.trim(),
      bio: bio.trim(),
      skills: skillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      interests: interestsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    });
  };

  return (
    <div className="space-y-6">
      {/* Profile Identity Header */}
      <section className="argon-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-2xl object-cover border-2 border-[#F4C495] shadow-sm shrink-0"
          />
          <div>
            <p className="text-xs font-mono font-semibold text-[#F97316]">
              Level {levelInfo.level} · {levelInfo.title}
            </p>
            <h2 className="mt-0.5 text-2xl font-extrabold text-[#191919] tracking-[-0.02em]">
              {profile.name}
            </h2>
            <p className="text-sm text-[#5F5851]">
              {profile.branch} · {profile.year} · {profile.college}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[#77716B]">
              <span className="inline-flex items-center gap-1">
                <Mail size={13} />
                {profile.email}
              </span>
              <span className="inline-flex items-center gap-1">
                <Github size={13} />
                {profile.github}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 shrink-0">
          <div className="px-4 py-3 rounded-2xl bg-[#FDF4EA] border border-[#F3D8BC] text-center">
            <Zap size={16} className="mx-auto text-[#F97316]" />
            <p className="mt-1 font-mono text-base font-extrabold text-[#191919] tabular-nums">
              {profile.xp.toLocaleString()}
            </p>
            <p className="text-[11px] text-[#77716B]">Total XP</p>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-[#F7F1E7] border border-[#E8DED2] text-center">
            <Flame size={16} className="mx-auto text-[#F59E0B]" />
            <p className="mt-1 font-mono text-base font-extrabold text-[#191919] tabular-nums">
              {profile.streakDays}d
            </p>
            <p className="text-[11px] text-[#77716B]">Streak</p>
          </div>
          <div className="px-4 py-3 rounded-2xl bg-[#F4FBF9] border border-[#CBE9E4] text-center">
            <Award size={16} className="mx-auto text-[#28867E]" />
            <p className="mt-1 font-mono text-base font-extrabold text-[#191919] tabular-nums">
              {unlockedBadges}
            </p>
            <p className="text-[11px] text-[#77716B]">Badges</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Editable Profile Form */}
        <form onSubmit={handleSave} className="lg:col-span-8 argon-card p-6 space-y-4">
          <div>
            <h3 className="text-[17px] font-bold text-[#191919]">
              Student Skills, Interests & Bio
            </h3>
            <p className="text-xs text-[#77716B]">
              Keep your profile up to date so teammates and mentors can match you to hackathon tracks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#3D3833] mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-[#FFFCF8] border border-[#E6DACB] text-sm text-[#191919] focus:outline-none focus:border-[#F97316]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3D3833] mb-1">
                Department / Branch
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-[#FFFCF8] border border-[#E6DACB] text-sm text-[#191919] focus:outline-none focus:border-[#F97316]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3D3833] mb-1">GitHub Handle</label>
            <input
              type="text"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-[#FFFCF8] border border-[#E6DACB] font-mono text-xs text-[#191919] focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#3D3833] mb-1">Short Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#FFFCF8] border border-[#E6DACB] text-sm text-[#191919] focus:outline-none focus:border-[#F97316]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#3D3833] mb-1">
                Technical Skills (comma separated)
              </label>
              <input
                type="text"
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-[#FFFCF8] border border-[#E6DACB] text-sm text-[#191919] focus:outline-none focus:border-[#F97316]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#3D3833] mb-1">
                Hackathon Interests (comma separated)
              </label>
              <input
                type="text"
                value={interestsText}
                onChange={(e) => setInterestsText(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-[#FFFCF8] border border-[#E6DACB] text-sm text-[#191919] focus:outline-none focus:border-[#F97316]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="argon-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
            >
              <Save size={14} />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>

        {/* Membership Status & Demo Data Controls */}
        <div className="lg:col-span-4 space-y-5">
          <div className="argon-card p-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <Shield size={18} className="text-[#48B8AE]" />
              <h3 className="text-[16px] font-bold text-[#191919]">Membership Standing</h3>
            </div>
            <div className="text-xs space-y-2.5 text-[#5F5851] pt-1">
              <div className="flex justify-between">
                <span>Assigned Team</span>
                <strong className="text-[#191919]">{team.name}</strong>
              </div>
              <div className="flex justify-between">
                <span>Hybrid Attendance</span>
                <strong className="font-mono text-[#191919]">{profile.attendanceRate}%</strong>
              </div>
              <div className="flex justify-between">
                <span>Weekly Goal</span>
                <strong className="font-mono text-[#191919]">{profile.weeklyHoursTarget} hrs</strong>
              </div>
              <div className="flex justify-between">
                <span>XP to Level {levelInfo.level + 1}</span>
                <strong className="font-mono text-[#F97316]">{levelInfo.xpToNext} XP</strong>
              </div>
            </div>
          </div>

          <div className="argon-card p-5 space-y-3">
            <h3 className="text-[16px] font-bold text-[#000000]">Live Firebase RTDB Sync</h3>
            <p className="text-xs text-[#4C4841] leading-relaxed">
              Your profile, XP progress, hackathon registrations, and team assignments sync in real time with Firebase Realtime Database.
            </p>
            <button
              type="button"
              onClick={resetDemoData}
              className="w-full py-2.5 px-4 rounded-[12px] bg-[#F6F4F1] border border-[#000000] hover:bg-[#000000] hover:text-[#F6F4F1] text-xs font-bold text-[#000000] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Clear Local Cache &amp; Resync</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
