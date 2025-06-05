// src/app/layout.tsx
import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: "Translator App",
  description: "Live translator app with multi-language support.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
