import type { Metadata, Viewport } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0B0E14",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "The Arena — Party Game Hub",
  description:
    "A cinematic party game hub. Play Codenames, Imposter, Truth or Dare, Never Have I Ever, Charades, Mafia & Ink Arena — all in one place.",
  manifest: "/manifest.json",
  keywords: ["party games", "codenames", "imposter", "truth or dare", "never have i ever", "charades", "mafia", "game night"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "The Arena",
  },
  openGraph: {
    title: "The Arena — Party Game Hub",
    description: "6 tactical party games. One cinematic hub. Enter The Arena.",
    type: "website",
    siteName: "The Arena",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Arena — Party Game Hub",
    description: "6 tactical party games. One cinematic hub. Enter The Arena.",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${inter.variable} ${syne.variable} antialiased`} suppressHydrationWarning>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').then((reg) => {
                    // Force update check on every page load so the SW
                    // always reflects the latest version (fixes PWA stale cache).
                    reg.update().catch(() => {});
                  }).catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
