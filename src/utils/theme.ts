export const BrandColors = {
  primary: 'rgb(0, 140, 128)',
  primaryDark: 'rgb(0, 102, 97)',
  accent: 'rgb(217, 166, 33)',

  cardGreen: 'rgb(46, 189, 107)',
  cardOrange: 'rgb(245, 166, 35)',
  cardRed: 'rgb(232, 77, 61)',
  cardBlue: 'rgb(51, 153, 219)',
  cardPurple: 'rgb(143, 69, 173)',
  cardTeal: 'rgb(23, 161, 184)',
};

export const StatusColors = {
  occupied: BrandColors.cardGreen,
  vacant: '#999999',
  reserved: BrandColors.cardBlue,
  maintenance: BrandColors.cardOrange,

  upcoming: BrandColors.cardBlue,
  due_today: BrandColors.cardOrange,
  paid: BrandColors.cardGreen,
  partially_paid: BrandColors.cardOrange,
  overdue: BrandColors.cardRed,

  active: BrandColors.cardGreen,
  completed: '#999999',
  cancelled: BrandColors.cardRed,
};

export interface ThemeColors {
  background: string;
  groupedBackground: string;
  card: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  chipBg: string;
  chipText: string;
  separator: string;
  overlay: string;
  danger: string;
}

export const LightPalette: ThemeColors = {
  background: '#F2F2F7',
  groupedBackground: '#F2F2F7',
  card: '#FFFFFF',
  text: '#1C1C1E',
  textSecondary: '#6E6E73',
  textTertiary: '#AEAEB2',
  border: '#E5E5EA',
  chipBg: '#EFEFF2',
  chipText: '#1C1C1E',
  separator: '#E5E5EA',
  overlay: 'rgba(0,0,0,0.4)',
  danger: BrandColors.cardRed,
};

export const DarkPalette: ThemeColors = {
  background: '#000000',
  groupedBackground: '#000000',
  card: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#9B9B9F',
  textTertiary: '#6E6E73',
  border: '#2C2C2E',
  chipBg: '#2C2C2E',
  chipText: '#FFFFFF',
  separator: '#2C2C2E',
  overlay: 'rgba(0,0,0,0.6)',
  danger: BrandColors.cardRed,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export function cardShadow(dark: boolean) {
  return {
    shadowColor: '#000',
    shadowOpacity: dark ? 0.3 : 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  };
}
