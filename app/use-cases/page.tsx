import { TrustedBySection } from "@/components/trusted-by-section";
import { CTASection } from "@/components/cta-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Use Cases — Cannavec API",
  description: "How clinics, tech platforms, brands and researchers use the Cannavec cannabis knowledge API.",
};

export default function UseCasesPage() {
  return (
    <>
      <section className="py-16 sm:py-20 cannavec-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-display text-cannavec-900 mb-4">Use Cases</h1>
          <p className="text-lg text-warm-500 max-w-2xl">
            From clinical prescribing platforms to AI-powered consumer tools — see how the cannabis industry builds on verified knowledge.
          </p>
        </div>
      </section>
      <TrustedBySection />
      <CTASection />
    </>
  );
}
