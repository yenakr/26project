/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/utils/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        crew: {
          green: "#d9f2d9", // 신입회원 배경 (엑셀 동일 초록 계열)
          blue: "#dbeafe",  // 정회원 배경 (엑셀 동일 연파랑 계열)
          pink: "#fce7f3",  // OB회원 배경 (엑셀 동일 연분홍 계열)
          primary: "#2563eb",
        }
      }
    },
  },
  plugins: [],
};
