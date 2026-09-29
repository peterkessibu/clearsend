import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClearSend — West Africa FX + fee transparency",
  description:
    "Demo: all-in FX and fee transparency for NGN, GHS, and CFA/XOF corridors with soft MoMo receive handoff. PAPSS-aligned narrative. DEMO quotes only — no fund holding.",
  applicationName: "ClearSend",
  authors: [{ name: "ClearSend" }],
  keywords: [
    "ClearSend",
    "West Africa",
    "FX transparency",
    "MoMo",
    "NGN",
    "GHS",
    "XOF",
    "PAPSS",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f766e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
