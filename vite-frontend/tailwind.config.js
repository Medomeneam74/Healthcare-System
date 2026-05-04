/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: 'oklch(97.5% 0.007 75)',
          raised: 'oklch(99% 0.005 75)',
          subtle: 'oklch(94.5% 0.009 75)',
          deep: 'oklch(91% 0.012 75)',
        },
        sidebar: {
          DEFAULT: 'oklch(27% 0.020 252)',
          hover: 'oklch(33% 0.020 252)',
          active: 'oklch(54% 0.21 232)',
          border: 'oklch(35% 0.016 252)',
          muted: 'oklch(63% 0.012 252)',
          subtle: 'oklch(35% 0.022 252)',
        },
        accent: {
          DEFAULT: 'oklch(54% 0.21 232)',
          hover: 'oklch(49% 0.21 232)',
          active: 'oklch(45% 0.21 232)',
          light: 'oklch(93.5% 0.07 232)',
          muted: 'oklch(87% 0.10 232)',
          fg: 'oklch(99% 0.004 232)',
        },
        ink: {
          DEFAULT: 'oklch(17% 0.008 265)',
          secondary: 'oklch(48% 0.008 265)',
          muted: 'oklch(64% 0.007 265)',
          faint: 'oklch(76% 0.006 265)',
        },
        line: {
          DEFAULT: 'oklch(87% 0.009 75)',
          strong: 'oklch(80% 0.010 75)',
          subtle: 'oklch(92% 0.007 75)',
        },
        danger: {
          DEFAULT: 'oklch(34% 0.12 15)',
          hover: 'oklch(30% 0.12 15)',
          light: 'oklch(95.5% 0.022 15)',
          fg: 'oklch(98.5% 0.004 15)',
        },
        sev: {
          'critical-bg':   'oklch(95.5% 0.022 15)',
          'critical-fg':   'oklch(34% 0.12 15)',
          'critical-line': 'oklch(87% 0.04 15)',
          'high-bg':       'oklch(95.5% 0.038 63)',
          'high-fg':       'oklch(37% 0.10 63)',
          'high-line':     'oklch(87% 0.058 63)',
          'moderate-bg':   'oklch(95.5% 0.032 78)',
          'moderate-fg':   'oklch(41% 0.09 78)',
          'moderate-line': 'oklch(87% 0.048 78)',
          'low-bg':        'oklch(94.5% 0.048 232)',
          'low-fg':        'oklch(37% 0.10 232)',
          'low-line':      'oklch(87% 0.065 232)',
          'none-bg':       'oklch(94.5% 0.038 145)',
          'none-fg':       'oklch(34% 0.10 145)',
          'none-line':     'oklch(87% 0.055 145)',
          'unknown-bg':    'oklch(93.5% 0.005 265)',
          'unknown-fg':    'oklch(46% 0.006 265)',
          'unknown-line':  'oklch(86.5% 0.007 265)',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
      },
      boxShadow: {
        card:       '0 1px 2px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.04)',
        'card-md':  '0 3px 8px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.04)',
        'card-lg':  '0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
}
