import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AWSKRUG 환불 신청",
  description: "AWSKRUG 밋업 환불 신청 페이지",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
