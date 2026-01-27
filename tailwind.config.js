/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'x-blue': '#1d9bf0',
        'x-dark': '#0f1419',
        'x-gray': '#536471',
        'x-light-gray': '#eff3f4',
      },
    },
  },
  plugins: [],
  // 使用前缀避免与 X 平台样式冲突
  prefix: 'zui-',
};
