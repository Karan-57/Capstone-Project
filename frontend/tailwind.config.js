/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          cyan: "#38bdf8",
          purple: "#a855f7",
          pink: "#ec4899",
        },
        dark: {
          base: '#07090E',
          sidebar: '#0B0F17',
          card: '#101522',
          cardHover: '#151C2D',
          border: 'rgba(255, 255, 255, 0.08)',
          subtle: 'rgba(255, 255, 255, 0.03)',
        },
        collabo: {
          bg: "#0c0e17",
          card: "#121526",
          cardHover: "#181d33",
          border: "#1f253d",
          borderLight: "#2c3454",
          text: "#f1f5f9",
          muted: "#94a3b8",
          faint: "#64748b",
        },
        creator: {
          DEFAULT: "#a855f7",
          dark: "#7c3aed",
          light: "#c084fc",
          badge: "#3b1e6d",
          glow: "rgba(168, 85, 247, 0.4)",
        },
        editor: {
          DEFAULT: "#3b82f6",
          dark: "#2563eb",
          light: "#60a5fa",
          badge: "#1e2c6d",
          glow: "rgba(59, 130, 246, 0.4)",
        },
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "'Inter'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "'Inter'", "sans-serif"],
      },
      keyframes: {
        floatSlow: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(1.5deg)" },
        },
        floatSubtle: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-6px) rotate(-1deg)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
        waveScroll: {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(6px)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "float-slow": "floatSlow 8s ease-in-out infinite",
        "float-subtle": "floatSubtle 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 4s ease-in-out infinite",
        "wave-scroll": "waveScroll 2s ease-in-out infinite",
      },
      boxShadow: {
        'glow-purple': '0 0 25px -5px rgba(124, 58, 237, 0.4)',
        'glow-subtle': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        glowPurple: "0 0 35px -5px rgba(168, 85, 247, 0.45)",
        glowBlue: "0 0 35px -5px rgba(59, 130, 246, 0.45)",
        glowCyan: "0 0 35px -5px rgba(56, 189, 248, 0.35)",
        dock: "0 20px 50px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.8)",
      },
    },
  },
  plugins: [],
}
