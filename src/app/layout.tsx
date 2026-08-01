import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sprout — Nursery Management Platform",
  description: "Multi-nursery admin and parent portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
