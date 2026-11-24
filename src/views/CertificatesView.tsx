import React, { useMemo, useState } from 'react';
import { Award, CheckCircle2, Eye, Lock, Printer, ShieldCheck, X } from 'lucide-react';
import { useArgon } from '../context/ArgonContext';
import { HexBadge3D } from '../components/ui/ClayMedallion';
import { BadgeItem, CertificateItem } from '../types';

type MobileTab = 'certs' | 'badges';

export const CertificatesView: React.FC = () => {
  const { badges, certificates, profile } = useArgon();
  const [mobileTab, setMobileTab] = useState<MobileTab>('badges');
  const [badgeCategory, setBadgeCategory] = useState<'All' | BadgeItem['category']>('All');
  const [previewCert, setPreviewCert] = useState<CertificateItem | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null);

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const filteredBadges = useMemo(() => {
    if (badgeCategory === 'All') return badges;
    return badges.filter((b) => b.category === badgeCategory);
  }, [badges, badgeCategory]);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Mobile Sub-Tabs (< lg) */}
      <div className="lg:hidden flex items-center gap-1.5 p-1 rounded-[14px] bg-[#E4DED2] border-[1.25px] border-[#000000]">
        <button
          type="button"
          onClick={() => setMobileTab('badges')}
          className={`flex-1 py-2 rounded-[10px] text-xs font-bold cursor-pointer ${
            mobileTab === 'badges' ? 'bg-[#000000] text-[#F6F4F1]' : 'text-[#000000]'
          }`}
        >
          Badges ({badges.length})
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('certs')}
          className={`flex-1 py-2 rounded-[10px] text-xs font-bold cursor-pointer ${
            mobileTab === 'certs' ? 'bg-[#000000] text-[#F6F4F1]' : 'text-[#000000]'
          }`}
        >
          Certificates ({certificates.length})
        </button>
      </div>

      {/* Official Certificates Section */}
      <section className={`${mobileTab === 'certs' ? 'space-y-3' : 'hidden lg:block lg:space-y-4'}`}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#000000] tracking-[-0.02em]">
              Official Certificates &amp; Credentials
            </h2>
            <p className="text-xs sm:text-sm text-[#4C4841]">
              Earned based on participation and AVCOE approval.
            </p>
          </div>
          <span className="text-xs font-mono text-[#4C4841]">
            Earned:{' '}
            <strong className="text-[#000000]">
              {certificates.filter((c) => c.status === 'Earned').length}/{certificates.length}
            </strong>
          </span>
        </div>

        {certificates.length === 0 ? (
          <div className="argon-card p-7 text-center space-y-2">
            <div className="w-11 h-11 rounded-[12px] bg-[#000000] text-[#F95C4B] flex items-center justify-center mx-auto">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-[#000000]">
              No certificates issued yet
            </h3>
            <p className="text-xs text-[#4C4841] max-w-md mx-auto">
              Approved hackathon and course certificates will appear here once issued by the club admin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
            {certificates.map((cert) => (
              <article
                key={cert.id}
                className="argon-card p-4 sm:p-6 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#4C4841]">{cert.type}</span>
                    <span className="font-bold text-[#F95C4B]">{cert.status}</span>
                  </div>

                  <h3 className="mt-1.5 text-[16px] sm:text-[17px] font-bold text-[#000000] leading-snug">
                    {cert.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-[#3A3732] leading-relaxed">
                    {cert.eligibilityRule}
                  </p>

                  <div className="mt-3.5">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#4C4841]">Eligibility</span>
                      <span className="font-mono font-bold text-[#000000] tabular-nums">
                        {cert.progressPct}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#F6F4F1] border border-[#000000]/20 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#F95C4B]"
                        style={{ width: `${cert.progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#000000]/15 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-[#4C4841] leading-tight">
                    {cert.approvalNote}
                  </span>
                  {cert.status === 'Earned' ? (
                    <button
                      type="button"
                      onClick={() => setPreviewCert(cert)}
                      className="argon-btn-dark inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold shrink-0 cursor-pointer"
                    >
                      <Eye size={13} />
                      <span>Preview</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#4C4841] shrink-0">
                      <Lock size={13} />
                      <span>Pending</span>
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Collectible Badges Vault */}
      <section
        className={`${
          mobileTab === 'badges' ? 'block' : 'hidden lg:block'
        } argon-card p-4 sm:p-6 space-y-4`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#000000]">
              Collectible Badge Vault ({unlockedCount}/{badges.length} Unlocked)
            </h3>
            <p className="text-xs text-[#4C4841]">
              Custom club badges uploaded by admins and unlocked through achievements.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {(
              [
                'All',
                'Digital Skill',
                'Project Completion',
                'Leadership',
                'Hackathon',
                'Milestone & Streak',
              ] as const
            ).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setBadgeCategory(cat)}
                className={`px-3 py-1.5 rounded-[10px] text-xs font-bold whitespace-nowrap cursor-pointer shrink-0 border border-[#000000] ${
                  badgeCategory === cat
                    ? 'bg-[#000000] text-[#F6F4F1]'
                    : 'bg-[#F6F4F1] text-[#000000]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredBadges.length === 0 ? (
          <div className="p-7 rounded-[14px] bg-[#F6F4F1] border border-[#000000]/20 text-center space-y-2">
            <div className="w-11 h-11 rounded-[12px] bg-[#000000] text-[#F95C4B] flex items-center justify-center mx-auto">
              <Award size={20} />
            </div>
            <h4 className="text-sm sm:text-base font-extrabold text-[#000000]">
              {badges.length === 0 ? 'No badges uploaded yet' : `No badges in "${badgeCategory}"`}
            </h4>
            <p className="text-xs text-[#4C4841] max-w-md mx-auto">
              {badges.length === 0
                ? 'Badges uploaded from the Admin Panel will appear in this vault immediately.'
                : 'Select "All" to view other badges.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filteredBadges.map((badge) => (
              <button
                key={badge.id}
                type="button"
                onClick={() => setSelectedBadge(badge)}
                className={`p-4 rounded-[16px] border-[1.25px] border-[#000000] text-center flex flex-col items-center cursor-pointer ${
                  badge.unlocked ? 'bg-[#F6F4F1]' : 'bg-[#E4DED2] opacity-85'
                }`}
              >
                <HexBadge3D badge={badge} size="md" />
                <p className="mt-2.5 text-xs sm:text-sm font-bold text-[#000000] line-clamp-1">
                  {badge.name}
                </p>
                <p className="mt-0.5 text-[11px] text-[#4C4841]">{badge.category}</p>
                <p className="mt-1.5 font-mono text-[10.5px] font-bold text-[#F95C4B]">
                  {badge.unlocked ? `Earned · ${badge.unlockedDate || 'Unlocked'}` : `+${badge.xpBonus} XP`}
                </p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Certificate Preview Modal */}
      {previewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/55">
          <div className="argon-card max-w-2xl w-full p-5 sm:p-8 relative">
            <button
              type="button"
              onClick={() => setPreviewCert(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-[#000000] hover:bg-[#F6F4F1] cursor-pointer"
              aria-label="Close certificate preview"
            >
              <X size={18} />
            </button>

            <div className="rounded-2xl border-2 border-[#000000] bg-[#F6F4F1] p-5 sm:p-8 text-center">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#F95C4B]">
                <ShieldCheck size={16} />
                <span>ARGON · AVCOE TECH COMMUNITY</span>
              </div>
              <h4 className="mt-3 text-xl sm:text-3xl font-extrabold text-[#000000] tracking-[-0.02em]">
                {previewCert.title}
              </h4>
              <p className="mt-2.5 text-xs sm:text-sm text-[#4C4841]">This certifies that</p>
              <p className="mt-1 text-xl sm:text-2xl font-bold text-[#000000]">{profile.name}</p>
              <p className="text-xs text-[#4C4841] mt-0.5">
                {profile.branch} · {profile.college}
              </p>

              <p className="mt-4 text-xs sm:text-sm text-[#3A3732] max-w-md mx-auto leading-relaxed">
                {previewCert.eligibilityRule}
              </p>

              <div className="mt-6 pt-4 border-t border-[#000000]/20 grid grid-cols-2 gap-4 text-left text-xs">
                <div>
                  <p className="text-[#4C4841]">Issued Date</p>
                  <p className="font-bold text-[#000000] mt-0.5">{previewCert.issuedDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#4C4841]">Credential ID</p>
                  <p className="font-mono font-bold text-[#000000] mt-0.5">
                    {previewCert.credentialId}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-[#F6F4F1] border border-[#000000] text-[#000000] text-xs font-bold cursor-pointer"
              >
                <Printer size={14} />
                <span>Print / PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewCert(null)}
                className="argon-btn-dark px-5 py-2 text-xs font-bold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/55">
          <div className="argon-card max-w-sm w-full p-5 sm:p-6 text-center relative">
            <button
              type="button"
              onClick={() => setSelectedBadge(null)}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-[#000000] hover:bg-[#F6F4F1] cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="flex justify-center mt-2">
              <HexBadge3D badge={selectedBadge} size="lg" />
            </div>
            <p className="mt-3 text-xs font-bold text-[#4C4841]">{selectedBadge.category}</p>
            <h4 className="mt-0.5 text-lg font-extrabold text-[#000000]">{selectedBadge.name}</h4>
            <p className="mt-2 text-xs sm:text-sm text-[#3A3732] leading-relaxed">
              {selectedBadge.description}
            </p>
            <div className="mt-4 p-3 rounded-[12px] bg-[#F6F4F1] border border-[#000000]/25 text-xs">
              <p className="text-[#4C4841]">Unlock Rule</p>
              <p className="font-bold text-[#000000] mt-0.5">{selectedBadge.rule}</p>
            </div>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-bold">
              {selectedBadge.unlocked ? (
                <span className="text-[#000000] flex items-center gap-1">
                  <CheckCircle2 size={14} className="text-[#F95C4B]" /> Unlocked{' '}
                  {selectedBadge.unlockedDate ? `on ${selectedBadge.unlockedDate}` : ''}
                </span>
              ) : (
                <span className="text-[#F95C4B] flex items-center gap-1">
                  <Award size={14} /> Earn +{selectedBadge.xpBonus} XP upon unlock
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
