import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./public-pages.css";
import "./public-accessibility-fixes.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://biaslens.beaccessible.co.za"),
  title: "BiasLens | Evidence-Led Algorithmic Accountability by BeAccessible",
  description:
    "Assess one AI system at a time. BiasLens helps organisations separate evidence from assumption, identify bias risks, document uncertainty and build an accountable evidence trail.",
  openGraph: {
    title: "BiasLens | Evidence-Led Algorithmic Accountability",
    description:
      "Know what your evidence supports — and what it does not. Assess one AI system with BiasLens by BeAccessible.",
    type: "website",
    url: "https://biaslens.beaccessible.co.za",
  },
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
