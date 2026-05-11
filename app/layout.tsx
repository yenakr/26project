import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "CODE BLUE - 중증응급환자 이송 지원",
  description: "병원 전 인계 표준화 및 수용 현황 프로토타입",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <div id="app">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
