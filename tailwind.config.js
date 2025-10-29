/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    screens: {
      'xs': '475px',
      // => @media (min-width: 475px) { ... }
      
      'sm': '640px',
      // => @media (min-width: 640px) { ... }

      'md': '768px',
      // => @media (min-width: 768px) { ... }

      'lg': '1024px',
      // => @media (min-width: 1024px) { ... }

      'xl': '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
    },
    extend: {
      colors: {
        // Colores oscuros principales
        'dark': {
          '50': '#f9fafb',
          '100': '#f3f4f6',
          '200': '#e5e7eb',
          '300': '#d1d5db',
          '400': '#9ca3af',
          '500': '#6b7280',
          '600': '#4b5563',
          '700': '#374151',
          '800': '#1f2937',
          '900': '#111827',
        },
        // Colores accesibles según guía de estilos
        'primary-bg': '#0f0f0f',        // Fondo principal
        'surface': '#202020',           // Superficies y paneles
        'surface-alt': '#2c2c2c',       // Superficies alternas
        'text-primary': '#ffffff',      // Texto principal
        'text-secondary': '#c0c0c0',    // Texto secundario
        'text-tertiary': '#808080',     // Texto terciario
        'accent': '#7c4dff',            // Color de acento (púrpura)
        'accent-hover': '#5b2ecb',      // Color de acento en hover
        'success': '#00c853',           // Éxito
        'warning': '#ffab00',           // Advertencia
        'error': '#ff5252',             // Error
        'info': '#2979ff',              // Información
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.15)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      gradientColorStops: {
        'blue-cyan': ['#2563eb', '#0891b2'],
        'indigo-purple': ['#4f46e5', '#7e22ce'],
        'emerald-teal': ['#059669', '#0d9488'],
      },
      borderRadius: {
        'xl': '12px',  // Bordes redondeados para tarjetas
      },
      spacing: {
        '1': '4px',
        '2': '8px', 
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
      }
    },
  },
  plugins: [],
}
