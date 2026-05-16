/** @type {import('tailwindcss').Config} */
//
// Heritage-luxe palette and type system for Pazhamozhi Pattu.
// Cream + ink + deep maroon with a gold whisper. Nothing neon, nothing flat.
//
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Page surfaces — warm, paper-like.
        cream: {
          50:  '#fdf9f3',
          100: '#f7f0e3',
          200: '#ead7be',
          300: '#dabc94',
        },
        // Text + soft text.
        ink: {
          900: '#2a1d10',
          700: '#4a3722',
          500: '#6b5946',
          300: '#a89578',
        },
        // Brand accent — deep saree maroon.
        maroon: {
          50:  '#fbeef2',
          100: '#f3d6df',
          200: '#e6acbd',
          400: '#b8395a',
          500: '#a8294e',
          600: '#8a1538',
          700: '#6f0f2c',
          800: '#560822',
        },
        // Gold whisper for borders + accents (used sparingly).
        gold: {
          400: '#d4af37',
          500: '#c19828',
          600: '#a07d1a',
        },
      },
      fontFamily: {
        // Display = elegant serif for headlines.
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        // Body = modern, readable sans.
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        // Editorial display sizes.
        'display-xl': ['clamp(3rem, 7vw, 5.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-lg': ['clamp(2.25rem, 5vw, 3.75rem)', { lineHeight: '1.1',  letterSpacing: '-0.015em' }],
        'display-md': ['clamp(1.75rem, 3.5vw, 2.5rem)', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
      },
      boxShadow: {
        soft: '0 1px 3px rgba(40, 25, 10, 0.06), 0 4px 16px rgba(40, 25, 10, 0.04)',
        lift: '0 6px 14px rgba(40, 25, 10, 0.10), 0 18px 40px rgba(40, 25, 10, 0.10)',
        glow: '0 0 0 1px rgba(138, 21, 56, 0.15), 0 8px 28px rgba(138, 21, 56, 0.12)',
      },
      backgroundImage: {
        // Soft paper grain — applied as a transparent overlay on the page.
        grain:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.16  0 0 0 0 0.11  0 0 0 0 0.06  0 0 0 0.04 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        // Hero ornament: subtle radial gradient.
        'hero-glow':
          'radial-gradient(60% 50% at 70% 35%, rgba(212, 175, 55, 0.18) 0%, rgba(253, 249, 243, 0) 60%), radial-gradient(50% 40% at 20% 70%, rgba(138, 21, 56, 0.12) 0%, rgba(253, 249, 243, 0) 60%)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
}
