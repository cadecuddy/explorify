import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
      colors: {
        background: "#1D232A",
        secondary: "#F6F7EB"
      }
    },
  },
  plugins: [
    require('daisyui'),
  ],
} satisfies Config;
