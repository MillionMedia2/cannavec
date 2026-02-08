import { HeroSection } from "@/components/hero-section";
import { DemoSection } from "@/components/demo-section";
import { ValuePropSection } from "@/components/value-prop-section";
import { BuildVsBuySection } from "@/components/build-vs-buy-section";
import { TrustedBySection } from "@/components/trusted-by-section";
import { CTASection } from "@/components/cta-section";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <DemoSection />
      <ValuePropSection />
      <BuildVsBuySection />
      <TrustedBySection />
      <CTASection />
    </>
  );
}
