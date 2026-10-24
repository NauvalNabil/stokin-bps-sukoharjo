import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "STOK-IN BPS Kabupaten Sukoharjo",
  description: "Sistem Tracking Operasional & Ketersediaan Inventaris ATK BPS Kabupaten Sukoharjo",
  icons: {
    icon: "/logo-bps.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-800"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
