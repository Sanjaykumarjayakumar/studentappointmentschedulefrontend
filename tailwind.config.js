/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f7ff",
          100: "#e3eeff",
          200: "#c4dbff",
          300: "#94bfff",
          400: "#5a9bff",
          500: "#2f7bf5",
          600: "#1a5fe0",
          700: "#144bb8",
          800: "#123d94",
          900: "#0f2f73",
          950: "#0a1f4d",
        },
        ink: "#0b1f44",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
