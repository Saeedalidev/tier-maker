const basePalette = {
    background: '#F7F7FB',
    surface: '#FFFFFF',
    surfaceLight: '#F3F3FD',
    card: '#FFFFFF',
    border: '#E1E1E8',
    text: '#1A1A2E',
    textSecondary: '#62627A',
    textMuted: '#9E9EBA',
    textInverse: '#FFFFFF',
    error: '#FF4D6D',
};

export const Colors = {
    // Shared Colors
    primary: '#00B2FF', // Vibrant Aqua
    secondary: '#00E8FF', // Bright Cyan
    accent: '#00D1FF', // Electric Accent
    ...basePalette,

    // Theme Specific Colors
    dark: {
        background: '#0A0A0F',
        surface: '#111118',
        card: '#16161F',
        cardBorder: '#1E1E2E',
        border: '#1A1A2A',
        textPrimary: '#F0F0FA',
        textSecondary: '#8585A0',
        textMuted: '#45455A',
        accentSoft: 'rgba(0, 209, 255, 0.15)',
        accentGlow: 'rgba(0, 209, 255, 0.35)',
    },
    light: {
        background: '#F7F7FB',
        surface: '#FFFFFF',
        card: '#FFFFFF',
        cardBorder: '#E1E1E8',
        border: '#EDEDF5',
        textPrimary: '#1A1A2E',
        textSecondary: '#62627A',
        textMuted: '#9E9EBA',
        accentSoft: 'rgba(0, 209, 255, 0.08)',
        accentGlow: 'rgba(0, 209, 255, 0.2)',
    }
};

export const getDesignTokens = (theme: 'dark' | 'light') => {
    const t = Colors[theme];
    return {
        bg: t.background,
        surface: t.surface,
        card: t.card,
        cardBorder: t.cardBorder,
        accent: Colors.accent,
        accentSoft: t.accentSoft,
        accentGlow: t.accentGlow,
        cyan: '#00D4FF',
        cyanSoft: 'rgba(0, 212, 255, 0.12)',
        green: '#00E676',
        greenSoft: 'rgba(0, 230, 118, 0.12)',
        red: '#FF4D6D',
        redSoft: 'rgba(255, 77, 109, 0.12)',
        amber: '#FFB300',
        amberSoft: 'rgba(255, 179, 0, 0.12)',
        textPrimary: t.textPrimary,
        textSecondary: t.textSecondary,
        textMuted: t.textMuted,
        border: t.border,
        pill: theme === 'dark' ? '#1A1A28' : '#F0F0F7',
    };
};

export const Spacing = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
};

export const Shadows = {
    soft: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    sharp: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        elevation: 4,
    }
};
