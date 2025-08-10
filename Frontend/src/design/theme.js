// Centralized theming system with light/dark modes and semantic tokens
export function createTheme(mode = 'dark') {
  const isDark = mode === 'dark';
  const surfaceBase = isDark ? 'hsl(240 15% 14%)' : 'hsl(240 15% 97%)';
  const surfaceElev = isDark ? 'hsl(240 15% 19%)' : 'hsl(240 15% 92%)';
  const text = isDark ? 'hsl(0 0% 96%)' : 'hsl(240 15% 10%)';
  const textSecondary = isDark ? 'hsl(240 10% 70%)' : 'hsl(240 10% 40%)';
  const primary = 'hsl(270 95% 65%)';
  const primaryAlt = 'hsl(300 95% 65%)';
  const gradientPrimary = `linear-gradient(135deg, ${primary}, ${primaryAlt})`;
  return {
    mode,
    isDark,
    colors: {
      primary,
      primaryAlt,
      gradientPrimary,
      primaryHover: 'hsl(270 95% 58%)',
      primaryTransparent: 'hsla(270,95%,65%,0.18)',
      surface: surfaceBase,
      surface2: surfaceElev,
      surface3: isDark ? 'hsl(240 15% 24%)' : 'hsl(240 15% 87%)',
      surfaceTransparent: isDark? 'hsla(240,15%,14%,0.75)':'hsla(240,15%,97%,0.75)',
      background: isDark ? 'linear-gradient(160deg,#0d0d16,#181826 55%,#221b30)' : 'linear-gradient(160deg,#fafaff,#f3f1ff 55%,#ece8ff)',
      text,
      textSecondary,
  white: '#ffffff',
      success: 'hsl(150 70% 45%)',
      successHover: 'hsl(150 70% 38%)',
      error: 'hsl(0 85% 60%)',
      errorHover: 'hsl(0 85% 53%)',
      errorTransparent: 'hsla(0 85% 60% / 0.15)',
      warning: 'hsl(38 95% 55%)',
      info: 'hsl(210 90% 60%)',
      border: isDark ? 'hsla(240,20%,60%,0.22)' : 'hsla(240,20%,30%,0.25)',
      focus: 'hsl(270 95% 70%)',
      codeBg: isDark ? '#1e2030' : '#f5f7fa'
    },
    shadows: {
      sm: '0 2px 6px -1px rgba(0,0,0,.3)',
      md: '0 6px 20px -2px rgba(0,0,0,.35)',
      lg: '0 12px 42px -4px rgba(0,0,0,.45)',
      glow: '0 0 0 3px hsla(270,95%,65%,0.35)'
    },
    radii: { xs: '6px', sm: '10px', md: '16px', lg: '22px', pill: '999px' },
    transitions: { fast: '.15s cubic-bezier(.4,.0,.2,1)', base: '.25s cubic-bezier(.4,.0,.2,1)' },
    layout: { maxWidth: '1280px' },
    glass: (alpha=0.65, blur=18) => `background:hsla(240,15%,${isDark? '16%':'98%'},${alpha});backdrop-filter:blur(${blur}px) saturate(190%);-webkit-backdrop-filter:blur(${blur}px) saturate(190%);border:1px solid hsla(240,20%,${isDark? '95%':'5%'},0.15);`,
  // Legacy compatibility + convenience aliases
  borderRadius: '22px',
  borderRadiusSmall: '14px',
  boxShadow: '0 12px 42px -4px rgba(0,0,0,.45)',
  boxShadowSubtle: '0 4px 18px -2px rgba(0,0,0,.35)',
  glassEffect: `background:hsla(240,15%,${isDark? '16%':'98%'},0.65);backdrop-filter:blur(18px) saturate(190%);-webkit-backdrop-filter:blur(18px) saturate(190%);border:1px solid hsla(240,20%,${isDark? '95%':'5%'},0.15);`
  };
}

export const themeDark = createTheme('dark');
export const themeLight = createTheme('light');
