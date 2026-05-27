import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
