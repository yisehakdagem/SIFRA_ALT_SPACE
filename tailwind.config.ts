import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: "#5A5B44",
        cream: "#F3EEE7",
        dark: "#2F2B24",
        gold: "#C7A86A",
        beige: "#E8D8C1",
      },
      fontFamily: {
        serif: ['var(--font-serif)', "serif"],
        sans: ['var(--font-sans)', "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;