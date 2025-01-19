const PROSE_CONTENT_WIDTH = "39rem";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,js,jsx,md,mdx,ts,tsx}"],
  theme: {
    backgroundColor: {
      abandoned: "var(--bg-abandoned)",
      accent: "var(--bg-accent)",
      canvas: "var(--bg-canvas)",
      default: "var(--bg-default)",
      footer: "var(--bg-footer)",
      group: "var(--bg-group)",
      inverse: "var(--bg-inverse)",
      stripe: "var(--bg-stripe)",
      subtle: "var(--bg-subtle)",
      unreviewed: "var(--bg-unreviewed)",
      unset: "unset",
    },
    borderColor: {
      default: "var(--border-default)",
    },
    colors: {
      accent: "var(--fg-accent)",
      border: "var(--border-default)",
      "border-accent": "var(--border-accent)",
      default: "var(--fg-default)",
      emphasis: "var(--fg-emphasis)",
      inherit: "inherit",
      inverse: "var(--fg-inverse)",
      "inverse-subtle": "var(--fg-inverse-subtle)",
      muted: "var(--fg-muted)",
      progress: "var(--fg-progress)",
      subtle: "var(--fg-subtle)",
    },
    extend: {
      aspectRatio: {
        cover: "1 / 1.5",
      },
      boxShadow: {
        all: "0 0 0 1px var(--border-default)",
        bottom: "0px 1px var(--border-default)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
        serif: "var(--font-serif)",
      },
      fontSize: {
        "2.5xl": "1.625rem",
        md: ["1.125rem", "1.5rem"],
        xxs: "0.6875rem",
      },
      maxWidth: {
        button: "430px",
        popout: `calc(64px + ${PROSE_CONTENT_WIDTH})`,
        prose: PROSE_CONTENT_WIDTH,
        unset: "unset",
      },
      padding: {
        container: "var(--container-padding)",
      },
      width: {
        "list-item-cover": "var(--list-item-cover-width)",
      },
    },
    letterSpacing: {
      normal: "0",
      prose: ".3px",
      "serif-wide": ".6px",
      wide: ".8px",
      wider: "1.1px",
      widest: "2px",
    },
    screens: {
      desktop: "1280px",
      max: "1696px",
      tablet: "768px",
      "tablet-landscape": "1024px",
    },
  },
};
