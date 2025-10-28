import "./styles.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Law Letter AI",
  description: "Generate professional legal letters with AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
