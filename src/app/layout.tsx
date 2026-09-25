import type { Metadata } from "next";
import { Bebas_Neue, DM_Sans } from "next/font/google";
import { BRAND } from "@/lib/brand";
import "./globals.css";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — Outdoor Advertising`,
    template: `%s · ${BRAND.name}`,
  },
  description:
    "Book premium billboards with Waqas Advertisers. Live availability, honest quotes, and city-level outdoor reach.",
  metadataBase: new URL(
    process.env.AUTH_URL || "https://waqasadvertisers.com"
  ),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
