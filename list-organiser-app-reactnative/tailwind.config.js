/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./app/(tabs)/**/*.{js,jsx,ts,tsx}",
    "./app/(tabs)/myForm/**/*.{js,jsx,ts,tsx}",
    "./app/(tabs)/myForm/(formTabs)**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./services/**/*.{js,jsx,ts,tsx}",
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")], 
  theme: {
    extend: {
      colors: {
        boxShadow: {
            card: "0px 4px 6px rgba(0,0,0,0.1)",
        },
        primary: {
          100: '#B3B7EE',
          200: '#9395D3',
          300: '#8485AB',
          400: '#868CA2',
          500: '#959CB7',
        },
        background: {
          primary: '#9395D3',
          secondary: '#B3B7EE',
          tertiary: '#FBF9FF',
          base: '#E6E4FA',
          cardBg: '#D7D4F0',
          border: '#E5E7EB',
        },
        text: {
          primary: '#000000',
          secondary: '#ffffffff',
          tertiary: '#959CB7',
          lilac: '#9395D3',
          navy: '#45456bff', 
          purple: '#4B4B76',
        },
        status: {
          edit: '#CDDFBD',
          view: '#BBC6EE',
          delete: '#E5B3B3',
        }
      },
      fontFamily: {
        // DM Sans
        'dmsans': ['DMSans-Regular', 'sans-serif'],
        'dmsans-medium': ['DMSans-Medium', 'sans-serif'],
        'dmsans-bold': ['DMSans-Bold', 'sans-serif'],
        
        // DM Serif Display 
        'dmserif': ['DMSerifDisplay-Regular', 'serif'],
        'dmserif-italic': ['DMSerifDisplay-Italic', 'serif'],
      },
    },
  },
  plugins: [],
}