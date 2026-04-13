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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Special+Elite&family=Permanent+Marker&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* SVG filter defs — invisible, referenced via url(#stamp-rough) */}
        <svg width="0" height="0" style={{ position: 'absolute' }}>
          <defs>
            <filter id="stamp-rough">
              <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="4" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
        </svg>
        {children}
      </body>
    </html>
  );
}
