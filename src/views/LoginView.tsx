import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Award,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Rocket,
  ShieldCheck,
  User,
  UserPlus,
  Users,
} from 'lucide-react';
import { useArgon } from '../context/ArgonContext';

type AuthMode = 'login' | 'register' | 'admin-setup';

export const LoginView: React.FC = () => {
  const {
    managedUsers,
    managedTeams,
    events,
    needsAdminSetup,
    rtdbReady,
    loginMember,
    registerMember,
    claimInitialAdmin,
  } = useArgon();

  const [mode, setMode] = useState<AuthMode>('login');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sign In state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  // Member Registration state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regBranch, setRegBranch] = useState('Computer Engg.');
  const [regYear, setRegYear] = useState('SE');
  const [regTeamId, setRegTeamId] = useState(managedTeams[0]?.id || '');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPwd, setShowRegPwd] = useState(false);

  // First-Time Admin Setup state
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirm, setAdminConfirm] = useState('');
  const [showAdminPwd, setShowAdminPwd] = useState(false);

  const switchMode = (next: AuthMode) => {
    setErrorMsg(null);
    setMode(next);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      const res = await loginMember(loginEmail, loginPassword);
      if (!res.ok) {
        setErrorMsg(res.error || 'Could not sign in.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (regPassword !== regConfirm) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await registerMember({
        name: regName,
        email: regEmail,
        branch: regBranch,
        year: regYear,
        teamId: regTeamId,
        password: regPassword,
      });
      if (!res.ok) {
        setErrorMsg(res.error || 'Could not create account.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (adminPassword !== adminConfirm) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await claimInitialAdmin({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
      });
      if (!res.ok) {
        setErrorMsg(res.error || 'Could not configure admin account.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] p-2.5 sm:p-5 flex items-center justify-center">
      <div className="w-full max-w-[1140px] rounded-[22px] sm:rounded-[28px] bg-[#F6F4F1] p-4 sm:p-8 lg:p-10">
        {/* Top Brand Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 mb-4 sm:pb-6 sm:mb-6 border-b border-[#000000]/15">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[11px] bg-[#000000] text-[#F95C4B] border border-[#000000] flex items-center justify-center font-extrabold text-base sm:text-lg">
              A
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-lg font-extrabold tracking-[-0.03em] text-[#F95C4B]">
                  ARGON
                </span>
                <span className="text-xs font-bold text-[#000000]">
                  | AVCOE Tech Community
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-[#4C4841]">
                Member &amp; Core Admin Portal · Amrutvahini College of Engineering
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-[9px] bg-[#E4DED2] border border-[#000000] text-[11px] font-bold text-[#000000]">
            {rtdbReady ? 'Synced' : 'Connecting...'}
          </span>
        </div>

        {/* Main Editorial Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
          {/* Left: Black Showcase Panel (Desktop only so mobile login requires zero scrolling) */}
          <section className="hidden lg:flex lg:col-span-6 argon-card-black p-7 sm:p-8 flex-col justify-between gap-8">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[10px] bg-[#F95C4B] text-[#F6F4F1] text-xs font-bold">
                <Rocket size={13} />
                <span>Member Access Portal</span>
              </span>

              <div>
                <h1 className="text-[28px] sm:text-[34px] font-extrabold tracking-[-0.03em] text-[#F6F4F1] leading-[1.12]">
                  Build, Ship &amp; Compete with AVCOE Builders.
                </h1>
                <p className="mt-3 text-sm text-[#E4DED2] leading-relaxed">
                  Sign in with your ARGON member account to track learning quests, join hackathons, collaborate in team workspaces, and earn verified badges.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {[
                  {
                    icon: Rocket,
                    title: 'Hackathons & Live Sessions',
                    desc: 'Register for internal & national hackathons and claim lab attendance XP.',
                    chipBg: '#F95C4B',
                    chipFg: '#F6F4F1',
                  },
                  {
                    icon: Users,
                    title: 'Assigned Squads & Logos',
                    desc: 'Collaborate inside your assigned team workspace and track milestone readiness.',
                    chipBg: '#E4DED2',
                    chipFg: '#000000',
                  },
                  {
                    icon: Award,
                    title: 'Badges, XP & Certificates',
                    desc: 'Unlock custom club badges and verified AVCOE completion certificates.',
                    chipBg: '#F95C4B',
                    chipFg: '#F6F4F1',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="p-3.5 rounded-[16px] bg-[#161513] border border-[#E4DED2]/20 flex items-start gap-3"
                    >
                      <div
                        className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                        style={{ backgroundColor: item.chipBg, color: item.chipFg }}
                      >
                        <Icon size={17} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#F6F4F1]">{item.title}</p>
                        <p className="text-[11.5px] text-[#E4DED2]/85 mt-0.5 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Club Snapshot */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#E4DED2]/20">
              <div className="p-3 rounded-[14px] bg-[#161513] border border-[#E4DED2]/15">
                <p className="text-[11px] text-[#E4DED2]">Members</p>
                <p className="text-xl font-extrabold font-mono text-[#F6F4F1] tabular-nums mt-0.5">
                  {managedUsers.length}
                </p>
              </div>
              <div className="p-3 rounded-[14px] bg-[#161513] border border-[#E4DED2]/15">
                <p className="text-[11px] text-[#E4DED2]">Teams</p>
                <p className="text-xl font-extrabold font-mono text-[#F95C4B] tabular-nums mt-0.5">
                  {managedTeams.length}
                </p>
              </div>
              <div className="p-3 rounded-[14px] bg-[#161513] border border-[#E4DED2]/15">
                <p className="text-[11px] text-[#E4DED2]">Events</p>
                <p className="text-xl font-extrabold font-mono text-[#F6F4F1] tabular-nums mt-0.5">
                  {events.length}
                </p>
              </div>
            </div>
          </section>

          {/* Right: Stone Auth Card */}
          <section className="lg:col-span-6 argon-card-stone p-4 sm:p-8 flex flex-col justify-between gap-5">
            <div className="space-y-5">
              {/* Mode Switcher */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="px-4 py-2 rounded-[12px] text-xs font-bold border border-[#000000] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  style={{
                    backgroundColor: mode === 'login' ? '#000000' : '#F6F4F1',
                    color: mode === 'login' ? '#F6F4F1' : '#000000',
                  }}
                >
                  <Lock size={13} />
                  <span>Member Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register')}
                  className="px-4 py-2 rounded-[12px] text-xs font-bold border border-[#000000] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  style={{
                    backgroundColor: mode === 'register' ? '#000000' : '#F6F4F1',
                    color: mode === 'register' ? '#F6F4F1' : '#000000',
                  }}
                >
                  <UserPlus size={13} />
                  <span>Join Club</span>
                </button>
                {needsAdminSetup && (
                  <button
                    type="button"
                    onClick={() => switchMode('admin-setup')}
                    className="px-4 py-2 rounded-[12px] text-xs font-bold border border-[#000000] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                    style={{
                      backgroundColor: mode === 'admin-setup' ? '#F95C4B' : '#F6F4F1',
                      color: mode === 'admin-setup' ? '#F6F4F1' : '#000000',
                    }}
                  >
                    <ShieldCheck size={13} />
                    <span>Admin Setup</span>
                  </button>
                )}
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-[14px] bg-[#F95C4B] border border-[#000000] text-[#F6F4F1] text-xs font-semibold flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* MODE 1: MEMBER LOGIN */}
              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <h2 className="text-[22px] font-bold text-[#000000]">Sign in to ARGON</h2>
                    <p className="text-xs text-[#4C4841] mt-0.5">
                      Use your club email and password (or the default password emailed by your Admin).
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="login-email"
                      className="block text-xs font-bold text-[#000000] mb-1.5"
                    >
                      Member Email
                    </label>
                    <div className="relative">
                      <Mail
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4C4841]"
                      />
                      <input
                        id="login-email"
                        required
                        type="email"
                        autoComplete="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@avcoe.edu.in"
                        className="w-full h-11 pl-10 pr-3.5 rounded-[12px] bg-[#F6F4F1] border border-[#000000] text-sm text-[#000000] placeholder:text-[#6E6960] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-bold text-[#000000] mb-1.5"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <KeyRound
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4C4841]"
                      />
                      <input
                        id="login-password"
                        required
                        type={showLoginPwd ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password or ARG-XXXX-XXXX"
                        className="w-full h-11 pl-10 pr-11 rounded-[12px] bg-[#F6F4F1] border border-[#000000] text-sm text-[#000000] placeholder:text-[#6E6960] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPwd((v) => !v)}
                        aria-label={showLoginPwd ? 'Hide password' : 'Show password'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-[8px] text-[#000000] hover:bg-[#E4DED2] cursor-pointer"
                      >
                        {showLoginPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="argon-btn-primary w-full py-3 text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <span>{submitting ? 'Verifying Credentials...' : 'Sign In'}</span>
                    <ArrowRight size={16} />
                  </button>

                  <div className="p-4 rounded-[16px] bg-[#F6F4F1] border border-[#000000] space-y-2 text-xs text-[#3C3934]">
                    <p className="font-bold text-[#000000]">First time logging in?</p>
                    <p className="leading-relaxed">
                      If an Admin added you, enter your email and the default password (<span className="font-mono font-bold text-[#000000]">ARG-XXXX-XXXX</span>) sent to your Gmail. You can update it to a personal password right after signing in.
                    </p>
                    {needsAdminSetup && (
                      <button
                        type="button"
                        onClick={() => switchMode('admin-setup')}
                        className="mt-1 inline-flex items-center gap-1.5 font-bold text-[#F95C4B] hover:underline cursor-pointer"
                      >
                        <ShieldCheck size={14} />
                        <span>Club Admin? Set up your initial Admin password here →</span>
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* MODE 2: SELF-REGISTER NEW MEMBER */}
              {mode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <h2 className="text-[22px] font-bold text-[#000000]">Join ARGON Club</h2>
                    <p className="text-xs text-[#4C4841] mt-0.5">
                      Create your AVCOE student member account to join sprints and earn XP.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4C4841]"
                      />
                      <input
                        required
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g., Riya Kulkarni"
                        className="w-full h-10 pl-9 pr-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4C4841]"
                      />
                      <input
                        required
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="riya.kulkarni@avcoe.edu.in"
                        className="w-full h-10 pl-9 pr-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#000000] mb-1">
                        Branch
                      </label>
                      <select
                        value={regBranch}
                        onChange={(e) => setRegBranch(e.target.value)}
                        className="w-full h-9 px-2 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs font-semibold text-[#000000]"
                      >
                        <option value="Computer Engg.">Computer</option>
                        <option value="IT Engg.">IT</option>
                        <option value="AI & DS">AI &amp; DS</option>
                        <option value="E&TC Engg.">E&amp;TC</option>
                        <option value="Mechanical Engg.">Mechanical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#000000] mb-1">
                        Year
                      </label>
                      <select
                        value={regYear}
                        onChange={(e) => setRegYear(e.target.value)}
                        className="w-full h-9 px-2 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs font-semibold text-[#000000]"
                      >
                        <option value="FE">FE</option>
                        <option value="SE">SE</option>
                        <option value="TE">TE</option>
                        <option value="BE">BE</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#000000] mb-1">
                        Team
                      </label>
                      <select
                        value={regTeamId}
                        onChange={(e) => setRegTeamId(e.target.value)}
                        className="w-full h-9 px-2 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs font-semibold text-[#000000]"
                      >
                        <option value="">Unassigned</option>
                        {managedTeams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#000000] mb-1">
                        Password (min 8 chars) *
                      </label>
                      <div className="relative">
                        <input
                          required
                          minLength={8}
                          type={showRegPwd ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Create password"
                          className="w-full h-10 pl-3 pr-9 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPwd((v) => !v)}
                          aria-label={showRegPwd ? 'Hide password' : 'Show password'}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#000000] cursor-pointer"
                        >
                          {showRegPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#000000] mb-1">
                        Confirm Password *
                      </label>
                      <input
                        required
                        minLength={8}
                        type={showRegPwd ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={regConfirm}
                        onChange={(e) => setRegConfirm(e.target.value)}
                        placeholder="Confirm password"
                        className="w-full h-10 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="argon-btn-primary w-full py-3 text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <UserPlus size={15} />
                    <span>{submitting ? 'Creating Account...' : 'Create Member Account'}</span>
                  </button>
                </form>
              )}

              {/* MODE 3: ONE-TIME FIRST-RUN ADMIN SETUP */}
              {mode === 'admin-setup' && needsAdminSetup && (
                <form onSubmit={handleAdminSetupSubmit} className="space-y-3.5">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[8px] bg-[#F95C4B] text-[#F6F4F1] border border-[#000000] text-[10.5px] font-bold mb-1.5">
                      <ShieldCheck size={12} />
                      <span>One-Time Club Admin Setup</span>
                    </div>
                    <h2 className="text-[22px] font-bold text-[#000000]">
                      Configure Core Admin Account
                    </h2>
                    <p className="text-xs text-[#4C4841] mt-0.5">
                      Set your Admin email and password to unlock the Admin Panel. Once claimed, this setup screen locks automatically.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">
                      Admin Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="Enter Admin full name"
                      className="w-full h-10 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#000000] mb-1">
                      Admin Email *
                    </label>
                    <input
                      required
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@avcoe.edu.in"
                      className="w-full h-10 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#000000] mb-1">
                        Admin Password (min 8 chars) *
                      </label>
                      <div className="relative">
                        <input
                          required
                          minLength={8}
                          type={showAdminPwd ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="Strong password"
                          className="w-full h-10 pl-3 pr-9 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAdminPwd((v) => !v)}
                          aria-label={showAdminPwd ? 'Hide password' : 'Show password'}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#000000] cursor-pointer"
                        >
                          {showAdminPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#000000] mb-1">
                        Confirm Admin Password *
                      </label>
                      <input
                        required
                        minLength={8}
                        type={showAdminPwd ? 'text' : 'password'}
                        autoComplete="new-password"
                        value={adminConfirm}
                        onChange={(e) => setAdminConfirm(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full h-10 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="argon-btn-dark w-full py-3 text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <ShieldCheck size={15} />
                    <span>{submitting ? 'Securing Admin Account...' : 'Claim Admin & Enter Portal'}</span>
                  </button>
                </form>
              )}
            </div>

            <div className="pt-4 border-t border-[#000000]/15 flex items-center justify-between text-[11px] text-[#4C4841]">
              <span>Protected with salted PBKDF2-SHA256 hashing</span>
              <span className="font-mono font-bold text-[#000000]">ARGON · AVCOE</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
