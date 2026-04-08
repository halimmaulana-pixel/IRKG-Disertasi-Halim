/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:      '#050912',
        bg2:     '#0a1120',
        bg3:     '#0f1a2e',
        card:    '#111827',
        border:  '#1e2d45',
        border2: '#2a3f5f',
        usu:     '#003d7a',
        usu2:    '#1a5fa8',
        gold:    '#c8972a',
        gold2:   '#f0b840',
        dim:     '#334155',
      },
      fontFamily: {
        mono:    ['"Space Mono"', 'monospace'],
        display: ['Syne', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
