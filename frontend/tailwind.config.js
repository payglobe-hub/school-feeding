/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Ghana Government Brand Colors
        'ghana': {
          // Primary Brand Colors - Professional Government Blues
          'primary': {
            50: '#eff6ff',   // Very light blue
            100: '#dbeafe',  // Light blue
            200: '#bfdbfe',  // Lighter blue
            300: '#93c5fd',  // Light medium blue
            400: '#60a5fa',  // Medium light blue
            500: '#3b82f6',  // Medium blue
            600: '#1d4ed8',  // GSFP Blue (primary)
            700: '#1e40af',  // Darker blue
            800: '#1e3a8a',  // Dark blue (headers)
            900: '#1e293b',  // Very dark blue (navbars)
          },
          // Secondary Colors - Ghana Flag Inspired Greens
          'secondary': {
            50: '#f0fdf4',   // Very light green
            100: '#dcfce7',  // Light green
            200: '#bbf7d0',  // Lighter green
            300: '#86efac',  // Light medium green
            400: '#4ade80',  // Medium light green
            500: '#22c55e',  // Medium green
            600: '#059669',  // GSFP Green (accent/CTAs)
            700: '#047857',  // Dark green
            800: '#065f46',  // Darker green
            900: '#064e3b',  // Very dark green
          },
          // Neutral Colors - Professional Grays
          'neutral': {
            50: '#f8fafc',   // Very light gray
            100: '#f1f5f9',  // Light gray
            200: '#e2e8f0',  // Lighter gray
            300: '#cbd5e1',  // Light medium gray
            400: '#94a3b8',  // Medium light gray
            500: '#64748b',  // Medium gray
            600: '#475569',  // GSFP Gray (text)
            700: '#334155',  // Dark gray
            800: '#1e293b',  // Darker gray
            900: '#0f172a',  // Very dark gray
          },
          // Status Colors
          'success': '#059669',    // Green for success
          'warning': '#d97706',    // Amber for warnings
          'error': '#dc2626',      // Red for errors
          'info': '#1d4ed8',       // Blue for info
        },
        // Legacy support - map to new Ghana colors
        'brand': {
          'primary': '#1d4ed8',     // GSFP Blue
          'secondary': '#059669',   // GSFP Green
          'accent': '#059669',      // GSFP Green
          'neutral': '#475569',     // GSFP Gray
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'display': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    // Add any additional plugins here if needed
  ],
}
