import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#090D16',
        panel: '#121826',
        neonBlue: '#3B82F6',
        neonIndigo: '#4F46E5',
        coolSlate: '#94A3B8',
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(59, 130, 246, 0.4)',
        glowPurple: '0 0 25px -5px rgba(79, 70, 229, 0.4)',
      },
    },
  },
  plugins: [],
};
export default config;