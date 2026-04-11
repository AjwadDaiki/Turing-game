import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TURING",
  description: "Party game multijoueur — Démasquez le Robot et le Traître",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
