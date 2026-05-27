import type { Metadata } from "next";
import { Inter, Archivo_Black } from "next/font/google";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const display = Archivo_Black({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Rococo Punch Budget",
  description: "Transparent budget and talent profit pool for Rococo Punch.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen antialiased font-sans">{children}</body>
    </html>
  );
}
