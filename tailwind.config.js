/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./assets/app.js"],
  theme: {
    screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1200px" },
    extend: {
      colors: {
        sky: "rgb(var(--sky) / <alpha-value>)",
        mario: { DEFAULT: "#E52521", dark: "#9C1A17" },
        luigi: { DEFAULT: "#00B259", dark: "#006A2E" },
        brick: { DEFAULT: "#B84418", light: "#F8A878" },
        coin: { DEFAULT: "#F8B800", dark: "#B06A00" },
        cream: "#FCE4B0",
        ink: "#000000",
        night: "#0B0B14",
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', "ui-monospace", "monospace"],
        body: ['"Space Grotesk"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        "px-xs": ["8px", { lineHeight: "16px" }],
        "px-sm": ["12px", { lineHeight: "20px" }],
        "px-md": ["16px", { lineHeight: "24px" }],
        "px-lg": ["24px", { lineHeight: "32px" }],
        "px-xl": ["32px", { lineHeight: "40px" }],
      },
      borderWidth: { 3: "3px" },
      boxShadow: {
        "px-sm": "2px 2px 0 0 #000",
        px: "4px 4px 0 0 #000",
        "px-lg": "8px 8px 0 0 #000",
        "px-lift": "4px 8px 0 0 #000",
      },
      keyframes: {
        bump: { "0%,100%": { transform: "translateY(0)" }, "40%": { transform: "translateY(-12px)" } },
        "coin-pop": {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "60%": { transform: "translateY(-72px)", opacity: "1" },
          "100%": { transform: "translateY(-48px)", opacity: "0" },
        },
        "score-pop": { "0%": { transform: "translateY(0)", opacity: "1" }, "100%": { transform: "translateY(-40px)", opacity: "0" } },
        bob: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-4px)" } },
        drift: { from: { transform: "translateX(-20vw)" }, to: { transform: "translateX(120vw)" } },
        blink: { "50%": { opacity: "0" } },
        rainbow: { to: { filter: "hue-rotate(360deg)" } },
        burst: { "0%": { transform: "translate(0,0)", opacity: "1" }, "100%": { transform: "translate(var(--dx), var(--dy))", opacity: "0" } },
        hurt: { "50%": { opacity: "0" } },
      },
      animation: {
        bump: "bump 220ms steps(4) 1",
        "coin-pop": "coin-pop 600ms steps(10) forwards",
        "score-pop": "score-pop 800ms steps(8) forwards",
        bob: "bob 1.6s steps(2) infinite",
        drift: "drift 90s linear infinite",
        blink: "blink 1s steps(1) infinite",
        rainbow: "rainbow 600ms linear infinite",
        burst: "burst 900ms steps(9) forwards",
        hurt: "hurt 120ms steps(1) 8",
      },
    },
  },
  plugins: [],
};
