/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',  // Ajustado para React
  ],
  theme: {
    extend: {
      height: {
        '25': '6.25rem',  // Clase h-25
      },
      gridTemplateRows: {
        layout: '64px 1fr 100px',  // Clase personalizada para diseño en filas
      },
      colors: {
        'naranja-bg': '#EE8532',
        'azul-bg': '#0f172b',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        josefin: ['Josefin Slab', 'serif'],
        raleway: ['Raleway', 'sans-serif'], 
      },
    },
  },
  plugins: [],
};
