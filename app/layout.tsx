// app/layout.tsx

import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

// Load Outfit font with correct configuration
const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  title: "CraftCode",
  description: "Crafting brands people remember.",
  icons: {
    icon: "/craftcode.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable}`}>
      <body className="bg-black text-white min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}