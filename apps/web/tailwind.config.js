/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                fintech: {
                    dark: '#0A0E17',
                    primary: '#2D5BFF',
                    secondary: '#6C42F5',
                    accent: '#00D2FF',
                    success: '#00E096',
                    warning: '#FFB946',
                    error: '#FF4D4D',
                },
                glass: {
                    white: 'rgba(255, 255, 255, 0.1)',
                    dark: 'rgba(10, 14, 23, 0.7)',
                    stroke: 'rgba(255, 255, 255, 0.05)',
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #2D5BFF33 0deg, #00D2FF33 180deg, #6C42F533 360deg)',
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                'glow': '0 0 20px rgba(45, 91, 255, 0.5)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
