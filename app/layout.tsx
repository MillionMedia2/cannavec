import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { FooterWrapper } from "@/components/footer-wrapper";

export const metadata: Metadata = {
  title: "Cannavec — Cannabis Knowledge API",
  description:
    "Evidence-based cannabis knowledge as a service. The Cannabis Knowledge Foundation API provides editorially governed, evidence-graded cannabis science for clinics, platforms and researchers.",
  keywords: [
    "cannabis API",
    "medical cannabis",
    "cannabis knowledge",
    "evidence-based cannabis",
    "cannabis data",
    "CKF",
  ],
  openGraph: {
    title: "Cannavec — Cannabis Knowledge API",
    description:
      "Evidence-based cannabis knowledge as a service. Editorially governed, evidence-graded, RAG-optimised.",
    url: "https://cannavec.ai",
    siteName: "Cannavec",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cannavec — Cannabis Knowledge API",
    description:
      "Evidence-based cannabis knowledge as a service.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">{children}</main>
        <FooterWrapper />
      </body>
    </html>
  );
}
