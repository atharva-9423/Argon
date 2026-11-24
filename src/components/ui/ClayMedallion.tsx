import React from 'react';
import {
  BookOpen,
  Code2,
  Cpu,
  GitBranch,
  Lock,
  ShieldCheck,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { useArgon } from '../../context/ArgonContext';
import { BadgeItem } from '../../types';

interface StatClayIconProps {
  tone: 'orange' | 'purple' | 'amber' | 'teal';
  children: React.ReactNode;
}

const STAT_TONES = {
  orange: {
    bg: '#F95C4B',
    border: '#000000',
    color: '#F6F4F1',
  },
  purple: {
    bg: '#000000',
    border: '#000000',
    color: '#F6F4F1',
  },
  amber: {
    bg: '#F6F4F1',
    border: '#000000',
    color: '#000000',
  },
  teal: {
    bg: '#E4DED2',
    border: '#000000',
    color: '#000000',
  },
};

export const StatClayIcon: React.FC<StatClayIconProps> = ({ tone, children }) => {
  const { themeMode, materialPalette } = useArgon();
  const isMaterial = themeMode === 'google-material';

  if (isMaterial) {
    const m3Map = {
      orange: {
        bg: materialPalette.primaryContainer,
        fg: materialPalette.onPrimaryContainer,
        radius: '18px 18px 6px 18px',
      },
      purple: {
        bg: materialPalette.secondaryContainer,
        fg: materialPalette.onSecondaryContainer,
        radius: '9999px',
      },
      amber: {
        bg: materialPalette.tertiaryContainer,
        fg: materialPalette.onTertiaryContainer,
        radius: '20px 6px 20px 20px',
      },
      teal: {
        bg: materialPalette.primary,
        fg: materialPalette.onPrimary,
        radius: '16px',
      },
    };
    const m = m3Map[tone];
    return (
      <div
        className="w-12 h-12 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-108 group-hover:rotate-3"
        style={{
          backgroundColor: m.bg,
          color: m.fg,
          borderRadius: m.radius,
        }}
      >
        {children}
      </div>
    );
  }

  const s = STAT_TONES[tone];
  return (
    <div
      className="w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105"
      style={{
        backgroundColor: s.bg,
        border: `1.25px solid ${s.border}`,
        color: s.color,
      }}
    >
      {children}
    </div>
  );
};

const BADGE_PALETTE = {
  orange: { bg: '#F95C4B', fg: '#F6F4F1' },
  purple: { bg: '#000000', fg: '#F6F4F1' },
  amber: { bg: '#F6F4F1', fg: '#000000' },
  teal: { bg: '#000000', fg: '#F95C4B' },
};

function renderBadgeIcon(iconName: BadgeItem['iconName'], size = 22) {
  switch (iconName) {
    case 'code':
      return <Code2 size={size} strokeWidth={2.2} />;
    case 'zap':
      return <Zap size={size} strokeWidth={2.2} />;
    case 'users':
      return <Users size={size} strokeWidth={2.2} />;
    case 'book':
      return <BookOpen size={size} strokeWidth={2.2} />;
    case 'trophy':
      return <Trophy size={size} strokeWidth={2.2} />;
    case 'git':
      return <GitBranch size={size} strokeWidth={2.2} />;
    case 'cpu':
      return <Cpu size={size} strokeWidth={2.2} />;
    case 'shield':
      return <ShieldCheck size={size} strokeWidth={2.2} />;
  }
}

interface HexBadge3DProps {
  badge: BadgeItem;
  size?: 'sm' | 'md' | 'lg';
}

export const HexBadge3D: React.FC<HexBadge3DProps> = ({ badge, size = 'md' }) => {
  const { themeMode, materialPalette } = useArgon();
  const isMaterial = themeMode === 'google-material';

  const palette = BADGE_PALETTE[badge.colorScheme];
  const iconSize = size === 'sm' ? 20 : size === 'lg' ? 28 : 22;
  const sqSize = size === 'sm' ? 'w-14 h-14' : size === 'lg' ? 'w-20 h-20' : 'w-16 h-16';

  if (isMaterial) {
    const m3BadgeColors = {
      orange: { bg: materialPalette.primary, fg: materialPalette.onPrimary },
      purple: { bg: materialPalette.secondary, fg: '#FFFFFF' },
      amber: { bg: materialPalette.tertiary, fg: '#FFFFFF' },
      teal: { bg: materialPalette.primaryContainer, fg: materialPalette.onPrimaryContainer },
    };
    const m3c = m3BadgeColors[badge.colorScheme];
    return (
      <div
        className={`relative ${sqSize} flex items-center justify-center select-none transition-transform duration-300 hover:scale-108 hover:rotate-6`}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
          <path
            d="M50 4 C58 4 62 12 70 14 C78 16 86 14 90 22 C94 30 88 38 92 46 C96 54 96 60 90 68 C84 76 76 74 70 82 C64 90 58 96 50 96 C42 96 36 90 30 82 C24 74 16 76 10 68 C4 60 4 54 8 46 C12 38 6 30 10 22 C14 14 22 16 30 14 C38 12 42 4 50 4 Z"
            fill={badge.unlocked ? m3c.bg : materialPalette.surfaceContainerHigh}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full p-2"
          style={{
            color: badge.unlocked ? m3c.fg : materialPalette.onSurfaceVariant,
          }}
        >
          {badge.unlocked ? (
            badge.imageUrl ? (
              <img
                src={badge.imageUrl}
                alt={badge.name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              renderBadgeIcon(badge.iconName, iconSize)
            )
          ) : (
            <Lock size={iconSize - 2} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative ${sqSize} rounded-[18px] flex items-center justify-center select-none overflow-hidden`}
      style={{
        backgroundColor: badge.unlocked ? palette.bg : '#F6F4F1',
        border: '1.25px solid #000000',
        color: badge.unlocked ? palette.fg : '#3F3B36',
      }}
    >
      {badge.unlocked ? (
        badge.imageUrl ? (
          <img
            src={badge.imageUrl}
            alt={badge.name}
            className="w-full h-full object-cover"
          />
        ) : (
          renderBadgeIcon(badge.iconName, iconSize)
        )
      ) : (
        <Lock size={iconSize - 2} />
      )}
    </div>
  );
};
