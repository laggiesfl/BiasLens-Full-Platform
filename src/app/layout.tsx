import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BiasLens — by BeAccessible",
  description:
    "BiasLens is an algorithmic bias testing and accountability platform that helps organisations and affected communities identify, document and respond to bias in AI-enabled systems.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Allow zooming up to 500% for low-vision users (do not set maximum-scale).
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
