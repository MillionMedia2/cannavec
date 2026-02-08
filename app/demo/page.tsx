import { DemoSection } from "@/components/demo-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo — Cannavec API",
  description: "Try the Cannavec cannabis knowledge API. Search 1,601 verified records with evidence grading.",
};

export default function DemoPage() {
  return (
    <div className="pt-8">
      <DemoSection />
    </div>
  );
}
