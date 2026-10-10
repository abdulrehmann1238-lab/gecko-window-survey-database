/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        elevated: "var(--elevated)",
        ink: {
          DEFAULT: "var(--ink)",
          2: "var(--ink-2)",
          3: "var(--ink-3)",
        },
        line: {
          DEFAULT: "var(--line)",
          strong: "var(--line-strong)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          active: "var(--primary-active)",
          tint: "var(--primary-tint)",
        },
        secondary: "var(--secondary)",
        accent: {
          DEFAULT: "var(--accent)",
          tint: "var(--accent-tint)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        error: "var(--error)",
        info: "var(--info)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        ui: ["var(--font-ui)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        r1: "var(--r1)",
        r2: "var(--r2)",
        r3: "var(--r3)",
        r4: "var(--r4)",
      },
      boxShadow: {
        "sh-1": "var(--sh-1)",
        "sh-2": "var(--sh-2)",
        "sh-3": "var(--sh-3)",
      },
      spacing: {
        s1: "var(--s1)",
        s2: "var(--s2)",
        s3: "var(--s3)",
        s4: "var(--s4)",
        s5: "var(--s5)",
        s6: "var(--s6)",
        s8: "var(--s8)",
        s10: "var(--s10)",
        s14: "var(--s14)",
        s20: "var(--s20)",
        s30: "var(--s30)",
      },
    },
  },
  plugins: [],
}
