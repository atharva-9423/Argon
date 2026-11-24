import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  KeyRound,
  LogOut,
  Palette,
  RotateCcw,
  Shuffle,
  Sliders,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { useArgon } from '../context/ArgonContext';
import { MATERIAL_PRESET_SEEDS, MaterialMotionStyle, ThemeMode } from '../utils/materialTheme';

export const SettingsView: React.FC = () => {
  const {
    themeMode,
    setThemeMode,
    materialSeedHex,
    setMaterialSeedHex,
    materialMotion,
    setMaterialMotion,
    materialPalette,
    profile,
    currentUser,
    changeCurrentMemberPassword,
    logoutMember,
    updateProfile,
    resetDemoData,
  } = useArgon();

  const [previewPressed, setPreviewPressed] = useState(false);
  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [savingPwd, setSavingPwd] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: 'err', text: 'New passwords do not match.' });
      return;
    }
    setSavingPwd(true);
    try {
      const res = await changeCurrentMemberPassword(curPwd, newPwd);
      if (!res.ok) {
        setPwdMsg({ type: 'err', text: res.error || 'Could not update password.' });
      } else {
        setPwdMsg({ type: 'ok', text: 'Your password has been updated and securely hashed.' });
        setCurPwd('');
        setNewPwd('');
        setConfirmPwd('');
      }
    } finally {
      setSavingPwd(false);
    }
  };

  const isMaterial = themeMode === 'google-material';

  const handleShuffleSeed = () => {
    const randomHue = Math.floor(Math.random() * 360);
    const hslToHex = (h: number, s: number, l: number) => {
      const sat = s / 100;
      const lig = l / 100;
      const c = (1 - Math.abs(2 * lig - 1)) * sat;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = lig - c / 2;
      let r = 0,
        g = 0,
        b = 0;
      if (h < 60) [r, g, b] = [c, x, 0];
      else if (h < 120) [r, g, b] = [x, c, 0];
      else if (h < 180) [r, g, b] = [0, c, x];
      else if (h < 240) [r, g, b] = [0, x, c];
      else if (h < 300) [r, g, b] = [x, 0, c];
      else [r, g, b] = [c, 0, x];
      const toHex = (n: number) =>
        Math.round((n + m) * 255)
          .toString(16)
          .padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };
    setThemeMode('google-material');
    setMaterialSeedHex(hslToHex(randomHue, 74, 48));
  };

  const themes: {
    id: ThemeMode;
    name: string;
    subtitle: string;
    description: string;
    swatches: string[];
  }[] = [
    {
      id: 'argon-classic',
      name: 'ARGON Paper & Coral',
      subtitle: 'Default · Paper · Stone · Coral · Black',
      description:
        'Pure black icon rail, warm Paper (#F6F4F1) workspace, Stone (#E4DED2), Coral (#F95C4B), and Black (#000000) color-blocked cards with crisp black outlines.',
      swatches: ['#F6F4F1', '#E4DED2', '#F95C4B', '#000000'],
    },
    {
      id: 'google-material',
      name: 'Google Material',
      subtitle: 'Material You Expressive · Dynamic Color',
      description:
        'Full Material 3 Expressive experience with dynamic color tonal roles, playful spring-morphing pill controls, generous squircle containers, and bouncy spatial motion.',
      swatches: [
        materialPalette.primary,
        materialPalette.primaryContainer,
        materialPalette.secondaryContainer,
        materialPalette.tertiary,
        materialPalette.surfaceContainerHigh,
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="argon-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 border border-[#000000]"
            style={{
              background: isMaterial ? materialPalette.primaryContainer : '#000000',
              color: isMaterial ? materialPalette.onPrimaryContainer : '#F95C4B',
            }}
          >
            <Palette size={23} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#191919] tracking-[-0.02em]">
              Appearance & Workspace Settings
            </h2>
            <p className="mt-0.5 text-sm text-[#665F58]">
              Switch between ARGON Warm Glass and Google Material (Material You Expressive) with live dynamic color generation.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleShuffleSeed}
          className="argon-btn-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold self-start sm:self-auto whitespace-nowrap cursor-pointer"
        >
          <Shuffle size={14} />
          <span>Dynamic Color Surprise</span>
        </button>
      </section>

      {/* Themes Selection */}
      <section className="space-y-3">
        <div>
          <h3 className="text-base font-bold text-[#191919]">Themes</h3>
          <p className="text-xs text-[#77716B]">
            Choose your preferred interface language. Changes apply instantaneously across every view.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {themes.map((t) => {
            const selected = themeMode === t.id;
            return (
              <motion.button
                key={t.id}
                type="button"
                whileTap={{ scale: 0.985 }}
                transition={
                  isMaterial
                    ? { type: 'spring', stiffness: 420, damping: 24 }
                    : { duration: 0.16 }
                }
                onClick={() => setThemeMode(t.id)}
                className={`argon-card text-left p-6 flex flex-col justify-between gap-4 cursor-pointer relative overflow-hidden ${
                  selected ? 'ring-2 ring-offset-2 ring-offset-transparent' : ''
                }`}
                style={{
                  ...(selected
                    ? {
                        boxShadow: isMaterial
                          ? `0 0 0 2px ${materialPalette.primary}, 0 14px 30px -12px ${materialPalette.primary}45`
                          : '0 0 0 2px #F95C4B, 0 14px 30px -12px rgba(249,92,75,0.28)',
                      }
                    : {}),
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-[#77716B]">{t.subtitle}</p>
                    <h4 className="mt-1 text-lg font-extrabold text-[#191919] flex items-center gap-2">
                      <span>{t.name}</span>
                      {t.id === 'google-material' && (
                        <Sparkles
                          size={16}
                          style={{ color: isMaterial ? materialPalette.primary : '#F95C4B' }}
                        />
                      )}
                    </h4>
                  </div>

                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all border border-[#000000]"
                    style={{
                      backgroundColor: selected
                        ? t.id === 'google-material'
                          ? materialPalette.primary
                          : '#F95C4B'
                        : '#F6F4F1',
                      color: selected ? '#F6F4F1' : 'transparent',
                    }}
                  >
                    <Check size={15} strokeWidth={2.8} />
                  </span>
                </div>

                <p className="text-sm text-[#5F5851] leading-relaxed">{t.description}</p>

                {/* Live Theme Preview Swatches */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-1.5">
                    {t.swatches.map((hex, i) => (
                      <span
                        key={`${t.id}-${i}`}
                        className="w-7 h-7 rounded-full border border-black/10 shadow-xs"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))}
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: selected
                        ? t.id === 'google-material'
                          ? materialPalette.primary
                          : '#F95C4B'
                        : '#5F5851',
                    }}
                  >
                    {selected ? 'Active Theme' : 'Select Theme'}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Google Material You Expressive Dynamic Color Studio */}
      <section className="argon-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-[12px] flex items-center justify-center border border-[#000000]"
              style={{
                backgroundColor: isMaterial ? materialPalette.secondaryContainer : '#000000',
                color: isMaterial ? materialPalette.onSecondaryContainer : '#F6F4F1',
              }}
            >
              <Wand2 size={19} />
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-[#191919]">
                Material You Expressive · Dynamic Color Engine
              </h3>
              <p className="text-xs text-[#77716B]">
                Pick a seed color or custom hex to synthesize full Material 3 tonal roles across the entire app.
              </p>
            </div>
          </div>

          {!isMaterial && (
            <button
              type="button"
              onClick={() => setThemeMode('google-material')}
              className="argon-btn-dark px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer self-start sm:self-auto"
            >
              Enable Google Material
            </button>
          )}
        </div>

        {/* Preset Dynamic Seeds + Custom Seed Color Input */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {MATERIAL_PRESET_SEEDS.map((preset) => {
            const active =
              isMaterial && materialSeedHex.toLowerCase() === preset.seedHex.toLowerCase();
            return (
              <motion.button
                key={preset.id}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 450, damping: 22 }}
                onClick={() => {
                  setThemeMode('google-material');
                  setMaterialSeedHex(preset.seedHex);
                }}
                className="p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5"
                style={{
                  backgroundColor: active
                    ? materialPalette.primaryContainer
                    : isMaterial
                    ? materialPalette.surfaceContainerLow
                    : 'rgba(255,252,248,0.72)',
                  borderColor: active ? preset.seedHex : 'rgba(140,134,128,0.22)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="w-8 h-8 rounded-full shadow-sm flex items-center justify-center text-white"
                    style={{ backgroundColor: preset.seedHex }}
                  >
                    {active && <Check size={14} strokeWidth={3} />}
                  </span>
                  <span className="font-mono text-[10px] text-[#77716B] uppercase">
                    {preset.seedHex}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#191919]">{preset.name}</p>
                  <p className="text-[11px] text-[#77716B] line-clamp-2 mt-0.5 leading-snug">
                    {preset.note}
                  </p>
                </div>
              </motion.button>
            );
          })}

          {/* Custom Dynamic Seed Color Picker */}
          <label
            className="p-3.5 rounded-2xl border border-dashed text-left cursor-pointer flex flex-col justify-between gap-2.5 hover:brightness-[0.98] transition-all"
            style={{
              backgroundColor: isMaterial
                ? materialPalette.surfaceContainerLow
                : 'rgba(255,252,248,0.72)',
              borderColor: 'rgba(140,134,128,0.34)',
            }}
          >
            <div className="flex items-center justify-between">
              <input
                type="color"
                value={materialSeedHex}
                onChange={(e) => {
                  setThemeMode('google-material');
                  setMaterialSeedHex(e.target.value);
                }}
                className="w-8 h-8 rounded-full border-0 cursor-pointer bg-transparent p-0"
                aria-label="Pick custom Material You dynamic color seed"
              />
              <span className="font-mono text-[10px] text-[#77716B] uppercase">
                {materialSeedHex}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#191919]">Custom Seed</p>
              <p className="text-[11px] text-[#77716B] mt-0.5 leading-snug">
                Extract dynamic Material You tones from any hex
              </p>
            </div>
          </label>
        </div>

        {/* Live Synthesized Tonal Tokens Strip */}
        <div className="pt-2">
          <p className="text-xs font-semibold text-[#77716B] mb-2.5">
            Generated Material 3 Dynamic Tonal Roles
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { label: 'Primary', bg: materialPalette.primary, fg: materialPalette.onPrimary },
              {
                label: 'Primary Container',
                bg: materialPalette.primaryContainer,
                fg: materialPalette.onPrimaryContainer,
              },
              {
                label: 'Secondary Container',
                bg: materialPalette.secondaryContainer,
                fg: materialPalette.onSecondaryContainer,
              },
              {
                label: 'Tertiary',
                bg: materialPalette.tertiary,
                fg: '#FFFFFF',
              },
              {
                label: 'Surface High',
                bg: materialPalette.surfaceContainerHigh,
                fg: materialPalette.onSurface,
              },
            ].map((role) => (
              <div
                key={role.label}
                className="rounded-2xl p-3 flex flex-col justify-between min-h-[68px] border border-black/5"
                style={{ backgroundColor: role.bg, color: role.fg }}
              >
                <span className="text-[11px] font-bold">{role.label}</span>
                <span className="font-mono text-[10px] opacity-85 uppercase">{role.bg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expressive Motion Physics & Shape-Morph Sandbox */}
        <div className="pt-4 border-t border-[#E8DED2]/70 grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          <div>
            <p className="text-sm font-bold text-[#191919]">Expressive Motion Physics</p>
            <p className="text-xs text-[#77716B] mt-0.5">
              Material You Expressive uses playful spring physics and shape-morphing interactive controls.
            </p>
            <div className="mt-3 inline-flex items-center p-1 rounded-full bg-black/5">
              {(['expressive', 'standard'] as MaterialMotionStyle[]).map((m) => {
                const active = materialMotion === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMaterialMotion(m)}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer"
                    style={{
                      backgroundColor: active
                        ? isMaterial
                          ? materialPalette.primary
                          : '#191919'
                        : 'transparent',
                      color: active ? '#FFFFFF' : '#5F5851',
                    }}
                  >
                    {m === 'expressive' ? 'Expressive Spring' : 'Standard Crisp'}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="p-4 rounded-[24px] flex items-center justify-between gap-3 border border-black/5"
            style={{
              backgroundColor: isMaterial
                ? materialPalette.surfaceContainer
                : 'rgba(246, 237, 224, 0.68)',
            }}
          >
            <div>
              <p className="text-xs font-bold text-[#191919]">Shape-Morph Interactive Preview</p>
              <p className="text-[11px] text-[#77716B]">
                Press & hold to feel Material 3 Expressive pill-to-squircle morph
              </p>
            </div>
            <motion.button
              type="button"
              onPointerDown={() => setPreviewPressed(true)}
              onPointerUp={() => setPreviewPressed(false)}
              onPointerLeave={() => setPreviewPressed(false)}
              animate={{
                borderRadius: previewPressed ? '12px' : '999px',
                scale: previewPressed ? 0.94 : 1,
              }}
              transition={{ type: 'spring', stiffness: 520, damping: 20 }}
              className="px-5 py-2.5 text-xs font-bold text-white shadow-md shrink-0 cursor-pointer select-none"
              style={{
                backgroundColor: isMaterial ? materialPalette.primary : '#F95C4B',
              }}
            >
              Hold Me
            </motion.button>
          </div>
        </div>
      </section>

      {/* Account Security & Change Password */}
      <section className="argon-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-[12px] bg-[#000000] text-[#F95C4B] border border-[#000000] flex items-center justify-center shrink-0">
              <KeyRound size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#000000]">Account Security &amp; Password</h3>
              <p className="text-xs text-[#4C4841]">
                Signed in as <strong className="text-[#000000]">{currentUser?.email || profile.email}</strong> ({currentUser?.role || 'Member'}).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logoutMember}
            className="px-4 py-2 rounded-[10px] bg-[#000000] text-[#F6F4F1] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer hover:bg-[#F95C4B] transition-colors self-start sm:self-auto"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>

        {pwdMsg && (
          <div
            className={`p-3 rounded-[12px] border border-[#000000] text-xs font-semibold flex items-center gap-2 ${
              pwdMsg.type === 'ok'
                ? 'bg-[#E4DED2] text-[#000000]'
                : 'bg-[#F95C4B] text-[#F6F4F1]'
            }`}
          >
            {pwdMsg.type === 'ok' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            <span>{pwdMsg.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-bold text-[#000000] mb-1">
              Current Password
            </label>
            <input
              required
              type="password"
              value={curPwd}
              onChange={(e) => setCurPwd(e.target.value)}
              placeholder="Current password"
              className="w-full h-10 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#000000] mb-1">
              New Password (8+ chars)
            </label>
            <input
              required
              minLength={8}
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="New password"
              className="w-full h-10 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#000000] mb-1">
              Confirm New Password
            </label>
            <input
              required
              minLength={8}
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="Repeat new password"
              className="w-full h-10 px-3 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-xs text-[#000000] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={savingPwd}
            className="argon-btn-primary h-10 px-4 text-xs font-bold cursor-pointer disabled:opacity-60"
          >
            {savingPwd ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </section>

      {/* General Learning Preferences & Reset */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="argon-card p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <Sliders size={18} style={{ color: isMaterial ? materialPalette.primary : '#F95C4B' }} />
            <h3 className="text-base font-bold text-[#191919]">Weekly Learning Goal</h3>
          </div>
          <p className="text-xs text-[#77716B]">
            ARGON hybrid training runs 4–5 hours per week. Adjust your personal target below.
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-[#5F5851]">Target Weekly Hours</span>
              <span className="font-mono font-bold text-[#191919] tabular-nums">
                {profile.weeklyHoursTarget} hrs / week
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={15}
              value={profile.weeklyHoursTarget}
              onChange={(e) => updateProfile({ weeklyHoursTarget: Number(e.target.value) })}
              className="w-full accent-[#F95C4B]"
              style={{ accentColor: isMaterial ? materialPalette.primary : '#F95C4B' }}
            />
          </div>
        </div>

        <div className="argon-card p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#000000]">Local Cache Sync</h3>
            <p className="mt-1 text-xs text-[#4C4841] leading-relaxed">
              Clear your browser cache and pull fresh live data directly from Firebase Realtime Database without affecting club accounts or rosters.
            </p>
          </div>
          <button
            type="button"
            onClick={resetDemoData}
            className="w-full py-2.5 px-4 rounded-[12px] bg-[#F6F4F1] border border-[#000000] hover:bg-[#000000] hover:text-[#F6F4F1] text-xs font-bold text-[#000000] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Clear Local Cache &amp; Resync</span>
          </button>
        </div>
      </section>
    </div>
  );
};
