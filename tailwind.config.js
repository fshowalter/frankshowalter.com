/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    backgroundColor: {
      canvas: "var(--bg-canvas)",
      default: "var(--bg-default)",
      footer: "var(--bg-footer)",
      subtle: "var(--bg-subtle)",
    },
    borderColor: {
      default: "var(--border-default)",
    },
    colors: {
      accent: "var(--fg-accent)",
      default: "var(--fg-default)",
      inherit: "inherit",
      inverse: "var(--fg-inverse)",
      subtle: "var(--fg-subtle)",
    },
    extend: {
      aspectRatio: {
        cover: "1 / 1.5",
      },
      boxShadow: {
        hover: "0 0 1px 1px var(--border-default)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
        serif: "var(--font-serif)",
      },
      fontSize: {
        "2.5xl": "1.625rem",
      },
      maxWidth: {
        unset: "unset",
      },
      padding: {
        container: "var(--container-padding)",
      },
    },
    letterSpacing: {
      wide: ".8px",
    },
    screens: {
      desktop: "1280px",
      max: "1696px",
      tablet: "768px",
    },
  },
};
