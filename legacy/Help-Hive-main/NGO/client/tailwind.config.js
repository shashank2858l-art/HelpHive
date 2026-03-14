/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                text: {
                    primary: "var(--text-primary)",
                    secondary: "var(--text-secondary)",
                    tertiary: "var(--text-tertiary)",
                    inverse: "var(--text-inverse)",
                },
                bg: {
                    primary: "var(--bg-primary)",
                    secondary: "var(--bg-secondary)",
                    card: "var(--bg-card)",
                },
                accent: {
                    primary: "var(--accent-primary)",
                    secondary: "var(--accent-secondary)",
                    cyan: "var(--accent-cyan)",
                    purple: "var(--accent-purple)",
                    blue: "var(--accent-blue)",
                }
            },
            fontFamily: {
                sans: ['Inter', 'Outfit', 'sans-serif'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: .5 },
                }
            }
        },
    },
    plugins: [],
}
