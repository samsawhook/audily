import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Audily Intranet",
  description: "Transparent budget and talent profit pool for Audily.",
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
