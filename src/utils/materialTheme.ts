export type ThemeMode = 'argon-classic' | 'google-material';
export type MaterialMotionStyle = 'expressive' | 'standard';

export interface MaterialDynamicPalette {
  id: string;
  name: string;
  seedHex: string;
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  surface: string;
  surfaceCard: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  onSurface: string;
  onSurfaceVariant: string;
  outlineVariant: string;
}

export const MATERIAL_PRESET_SEEDS: { id: string; name: string; seedHex: string; note: string }[] = [
  {
    id: 'cobalt',
    name: 'Pixel Cobalt',
    seedHex: '#3B66F5',
    note: 'Electric blue primary with warm amber tertiary',
  },
  {
    id: 'orchid',
    name: 'Expressive Orchid',
    seedHex: '#8442D6',
    note: 'Vibrant violet primary with botanical mint accents',
  },
  {
    id: 'botanical',
    name: 'Botanical Sage',
    seedHex: '#127A64',
    note: 'Fresh emerald teal with soft coral tertiary',
  },
  {
    id: 'tangerine',
    name: 'Solar Tangerine',
    seedHex: '#E05A14',
    note: 'Warm terracotta primary with deep teal contrast',
  },
  {
    id: 'crimson',
    name: 'Berry Rose',
    seedHex: '#CC335C',
    note: 'Playful berry rose with cool cyan tertiary',
  },
];

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.padEnd(6, '0').slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360;
  const sat = Math.max(0, Math.min(100, s)) / 100;
  const lig = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lig - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (hue < 60) [r, g, b] = [c, x, 0];
  else if (hue < 120) [r, g, b] = [x, c, 0];
  else if (hue < 180) [r, g, b] = [0, c, x];
  else if (hue < 240) [r, g, b] = [0, x, c];
  else if (hue < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Computes crisp Android 16 / Material 3 Expressive tonal hierarchy from any hex seed:
 * - Soft color-tinted canvas (--md-surface)
 * - Clean luminous elevated cards (--md-surface-card)
 * - Distinct tonal containers (--md-surface-container-low/mid/high)
 * - Vivid primary, secondary, and complementary tertiary containers
 */
export function buildMaterialPalette(
  seedHex: string,
  name = 'Custom Seed',
  id = 'custom'
): MaterialDynamicPalette {
  const { h, s } = hexToHsl(seedHex);
  const vividS = Math.max(58, Math.min(88, s));
  const secondaryHue = (h + 24) % 360;
  const tertiaryHue = (h + 148) % 360;

  return {
    id,
    name,
    seedHex,
    primary: hslToHex(h, vividS, 45),
    onPrimary: '#FFFFFF',
    primaryContainer: hslToHex(h, Math.min(94, vividS + 8), 88),
    onPrimaryContainer: hslToHex(h, vividS, 15),
    secondary: hslToHex(secondaryHue, Math.max(30, Math.round(vividS * 0.5)), 40),
    secondaryContainer: hslToHex(secondaryHue, Math.max(44, Math.round(vividS * 0.7)), 89),
    onSecondaryContainer: hslToHex(secondaryHue, Math.max(40, Math.round(vividS * 0.6)), 16),
    tertiary: hslToHex(tertiaryHue, Math.max(50, Math.round(vividS * 0.8)), 41),
    tertiaryContainer: hslToHex(tertiaryHue, Math.max(58, Math.round(vividS * 0.82)), 89),
    onTertiaryContainer: hslToHex(tertiaryHue, Math.max(50, Math.round(vividS * 0.72)), 16),
    surface: hslToHex(h, 30, 94),
    surfaceCard: hslToHex(h, 25, 99),
    surfaceContainerLow: hslToHex(h, 28, 96),
    surfaceContainer: hslToHex(h, 32, 91),
    surfaceContainerHigh: hslToHex(h, 34, 87),
    onSurface: hslToHex(h, 22, 12),
    onSurfaceVariant: hslToHex(h, 16, 36),
    outlineVariant: hslToHex(h, 22, 79),
  };
}

export function applyMaterialCssVariables(palette: MaterialDynamicPalette) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--md-primary', palette.primary);
  root.style.setProperty('--md-on-primary', palette.onPrimary);
  root.style.setProperty('--md-primary-container', palette.primaryContainer);
  root.style.setProperty('--md-on-primary-container', palette.onPrimaryContainer);
  root.style.setProperty('--md-secondary', palette.secondary);
  root.style.setProperty('--md-secondary-container', palette.secondaryContainer);
  root.style.setProperty('--md-on-secondary-container', palette.onSecondaryContainer);
  root.style.setProperty('--md-tertiary', palette.tertiary);
  root.style.setProperty('--md-tertiary-container', palette.tertiaryContainer);
  root.style.setProperty('--md-on-tertiary-container', palette.onTertiaryContainer);
  root.style.setProperty('--md-surface', palette.surface);
  root.style.setProperty('--md-surface-card', palette.surfaceCard);
  root.style.setProperty('--md-surface-container-low', palette.surfaceContainerLow);
  root.style.setProperty('--md-surface-container', palette.surfaceContainer);
  root.style.setProperty('--md-surface-container-high', palette.surfaceContainerHigh);
  root.style.setProperty('--md-on-surface', palette.onSurface);
  root.style.setProperty('--md-on-surface-variant', palette.onSurfaceVariant);
  root.style.setProperty('--md-outline-variant', palette.outlineVariant);
}
