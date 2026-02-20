import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                "bg-primary": "var(--bg-primary)",
                "bg-secondary": "var(--bg-secondary)",
                "bg-tertiary": "var(--bg-tertiary)",
                "text-primary": "var(--text-primary)",
                "text-secondary": "var(--text-secondary)",
                "accent-cyan": "var(--accent-cyan)",
                "accent-blue": "var(--accent-blue)",
                "accent-green": "var(--accent-green)",
                "accent-orange": "var(--accent-orange)",
                "accent-red": "var(--accent-red)",
            },
        },
    },
    plugins: [],
};
export default config;
