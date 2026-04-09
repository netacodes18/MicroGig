/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        daInfo: {
          blue: '#2563eb', // Stark, high-contrast blue similar to the screenshot
          dark: '#0a0a0a', // Almost pure black for sections
          light: '#fafafa', // Slightly off-white for some panels
          grid: '#e5e7eb', // Grid line color
        }
      },
      fontFamily: {
        // We'll use system fonts that mimic the clean geometric sans look
        sans: ['Inter', 'system-ui', '-apple-system', 'Helvetica Neue', 'sans-serif'],
      },
      boxShadow: {
        // Minimalist shadow, mostly replacing glows
        'solid': '4px 4px 0px 0px rgba(0,0,0,1)', // Solid offset shadow
      },
    },
  },
  plugins: [],
}
