module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Legacy Vibe colors
        'vibe-dark': '#121212',
        'vibe-darker': '#0a0a0a',
        'vibe-gray': '#181818',
        'vibe-light': '#282828',
        'vibe-purple': '#8b5cf6',
        'vibe-pink': '#ec4899',
        
        // Material Design 3 Color System
        'm3': {
          // Primary
          'primary': 'var(--m3-primary)',
          'on-primary': 'var(--m3-on-primary)',
          'primary-container': 'var(--m3-primary-container)',
          'on-primary-container': 'var(--m3-on-primary-container)',
          
          // Secondary
          'secondary': 'var(--m3-secondary)',
          'on-secondary': 'var(--m3-on-secondary)',
          'secondary-container': 'var(--m3-secondary-container)',
          'on-secondary-container': 'var(--m3-on-secondary-container)',
          
          // Tertiary
          'tertiary': 'var(--m3-tertiary)',
          'on-tertiary': 'var(--m3-on-tertiary)',
          'tertiary-container': 'var(--m3-tertiary-container)',
          'on-tertiary-container': 'var(--m3-on-tertiary-container)',
          
          // Error
          'error': 'var(--m3-error)',
          'on-error': 'var(--m3-on-error)',
          'error-container': 'var(--m3-error-container)',
          'on-error-container': 'var(--m3-on-error-container)',
          
          // Surface & Background
          'surface': 'var(--m3-surface)',
          'on-surface': 'var(--m3-on-surface)',
          'surface-variant': 'var(--m3-surface-variant)',
          'on-surface-variant': 'var(--m3-on-surface-variant)',
          'surface-container-lowest': 'var(--m3-surface-container-lowest)',
          'surface-container-low': 'var(--m3-surface-container-low)',
          'surface-container': 'var(--m3-surface-container)',
          'surface-container-high': 'var(--m3-surface-container-high)',
          'surface-container-highest': 'var(--m3-surface-container-highest)',
          
          // Outline
          'outline': 'var(--m3-outline)',
          'outline-variant': 'var(--m3-outline-variant)',
          
          // Inverse
          'inverse-surface': 'var(--m3-inverse-surface)',
          'inverse-on-surface': 'var(--m3-inverse-on-surface)',
          'inverse-primary': 'var(--m3-inverse-primary)',
          
          // Background
          'background': 'var(--m3-background)',
          'on-background': 'var(--m3-on-background)',
        },
      },
      borderRadius: {
        // M3 Shape Scale
        'm3-none': '0px',
        'm3-xs': '4px',
        'm3-sm': '8px',
        'm3-md': '12px',
        'm3-lg': '16px',
        'm3-xl': '28px',
        'm3-full': '9999px',
      },
      boxShadow: {
        // M3 Elevation levels
        'm3-1': '0 1px 2px 0 rgba(0,0,0,0.3), 0 1px 3px 1px rgba(0,0,0,0.15)',
        'm3-2': '0 1px 2px 0 rgba(0,0,0,0.3), 0 2px 6px 2px rgba(0,0,0,0.15)',
        'm3-3': '0 1px 3px 0 rgba(0,0,0,0.3), 0 4px 8px 3px rgba(0,0,0,0.15)',
        'm3-4': '0 2px 3px 0 rgba(0,0,0,0.3), 0 6px 10px 4px rgba(0,0,0,0.15)',
        'm3-5': '0 4px 4px 0 rgba(0,0,0,0.3), 0 8px 12px 6px rgba(0,0,0,0.15)',
      },
      animation: {
        'm3-ripple': 'ripple 0.6s ease-out',
        'm3-fade-in': 'fadeIn 0.3s ease-out',
        'm3-scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      transitionTimingFunction: {
        'm3-standard': 'cubic-bezier(0.2, 0, 0, 1)',
        'm3-emphasized': 'cubic-bezier(0.2, 0, 0, 1)',
        'm3-emphasized-decelerate': 'cubic-bezier(0.05, 0.7, 0.1, 1)',
        'm3-emphasized-accelerate': 'cubic-bezier(0.3, 0, 0.8, 0.15)',
      },
      transitionDuration: {
        'm3-short1': '50ms',
        'm3-short2': '100ms',
        'm3-short3': '150ms',
        'm3-short4': '200ms',
        'm3-medium1': '250ms',
        'm3-medium2': '300ms',
        'm3-medium3': '350ms',
        'm3-medium4': '400ms',
        'm3-long1': '450ms',
        'm3-long2': '500ms',
      },
    },
  },
  plugins: [],
}

