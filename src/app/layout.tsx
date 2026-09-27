import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '이런저런 🏃‍♂️🏃‍♀️ 러닝크루 자동 출석 관리',
  description: '카카오톡 대화록 기반 자동 출석 체크 및 학기별 회원 등급 관리 시스템',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
