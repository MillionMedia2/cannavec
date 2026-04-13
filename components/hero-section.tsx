"use client";

import Link from "next/link";
import { ArrowRight, Shield, BookOpen, Zap } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 cannavec-gradient" />
      <div className="absolute inset-0 noise-overlay" />

      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse-soft" />
            <span className="text-xs font-medium text-white/90 tracking-wide">
              MEET US AT ICBC, BERLIN · APRIL 2026
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-white leading-[1.1] mb-6">
            Cannabis knowledge
            <br />
            <span className="text-accent-light">you can build on.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 font-body leading-relaxed mb-10 max-w-2xl">
            The Cannabis Knowledge Foundation API delivers editorially governed,
            evidence-graded cannabis science — ready for your platform, clinic
            or research pipeline. Thousands of verified records. Zero hallucination risk.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-4 mb-16">
            <Link href="/demo" className="cannavec-btn-accent text-base group">
              Try the Demo
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-6 py-3 text-white font-medium rounded-lg border-2 border-white/30 hover:bg-white/10 transition-all duration-200"
            >
              View Pricing
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Shield, label: "Editorially Governed", desc: "Named experts. Evidence graded A/B/C." },
              { icon: BookOpen, label: "Thousands of Verified Records", desc: "Cannabis science + product data." },
              { icon: Zap, label: "RAG-Optimised", desc: "Built for AI retrieval. Not scraped." },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
                <item.icon size={20} className="text-accent-light mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-white">{item.label}</div>
                  <div className="text-xs text-white/60 mt-0.5">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
