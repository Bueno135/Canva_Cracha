/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand-indigo': '#3949ab',
                'brand-blue': '#2196F3',
                'brand-blue-hover': '#1976D2',
                'brand-bg': '#f5f5f5',
                'brand-surface': '#ffffff',
                'brand-border': '#e0e0e0',
                'brand-text': '#333333',
                'brand-muted': '#888888',
            },
            fontFamily: {
                sans: ['"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
