import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Award, CheckCircle2, Sparkles, X, Zap } from 'lucide-react';
import { useArgon } from '../../context/ArgonContext';

export const ToastSystem: React.FC = () => {
  const { toasts, dismissToast } = useArgon();

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2.5rem)] pointer-events-none"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto argon-card-black px-4 py-3.5 flex items-start gap-3 shadow-xl"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-black ${
                toast.type === 'levelup' || toast.type === 'xp'
                  ? 'bg-[#F95C4B] text-[#F6F4F1]'
                  : 'bg-[#E4DED2] text-[#000000]'
              }`}
            >
              {toast.type === 'levelup' ? (
                <Sparkles size={18} />
              ) : toast.type === 'badge' ? (
                <Award size={18} />
              ) : toast.type === 'xp' ? (
                <Zap size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#F6F4F1] truncate">{toast.title}</p>
                {toast.xpDelta ? (
                  <span className="font-mono text-xs font-semibold text-[#F95C4B] shrink-0 tabular-nums">
                    +{toast.xpDelta} XP
                  </span>
                ) : null}
              </div>
              {toast.subtitle && (
                <p className="text-xs text-[#E4DED2] mt-0.5 leading-relaxed">{toast.subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-[#E4DED2] hover:text-[#F6F4F1] p-0.5 rounded-lg transition-colors cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
