/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        cyber: "var(--color-accent)",
        canvas: "var(--color-canvas)",
        surface: "var(--color-surface)",
      },
      boxShadow: {
        cyber: "0 0 28px var(--color-accent-glow)",
      },
      borderRadius: {
        panel: "1.25rem",
      },
    },
  },
};
