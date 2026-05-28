/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        quinto: {
          50: "#f0f7ff",
          100: "#ddecff",
          200: "#b9dbff",
          300: "#89c3ff",
          400: "#51a0ff",
          500: "#1f7cff",
          600: "#075bdb",
          700: "#0046b8",
          800: "#083d87",
          900: "#0d335f",
        },
        ink: "#132238",
      },
      boxShadow: {
        soft: "0 20px 50px -30px rgba(19, 34, 56, 0.35)",
      },
    },
  },
  plugins: [],
};
