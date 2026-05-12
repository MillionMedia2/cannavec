import type { Metadata } from "next";
import Link from "next/link";
import { Plane, ArrowRight, Zap, MapPin, ShieldCheck, FileText, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Cannabis Travel Planner — Cannavec Skills",
  description:
    "Can you travel with your prescribed cannabis? Find out in seconds — documents, step-by-step guidance, and transit warnings for medical cannabis patients.",
};

const FEATURES = [
  {
    icon: MapPin,
    title: "Transit hub detection",
    description:
      "Flying via Dubai, Doha, or Singapore? We flag it automatically and tell you exactly what that means for your trip.",
  },
  {
    icon: ShieldCheck,
    title: "Document checklist",
    description:
      "Country-specific documentation requirements — prescriptions, travel letters, permits — and how to get them in time.",
  },
  {
    icon: FileText,
    title: "Download your guide",
    description:
      "Save your personalised travel guide as a PDF to take with you, share with your clinic, or hand to a border officer.",
  },
  {
    icon: Plane,
    title: "Covers 60+ countries",
    description:
      "UK, Germany, Australia, Canada, and Schengen countries fully covered. High-risk destination and transit warnings for all major routes.",
  },
];

export default function TravelSkillPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 sm:py-20 cannavec-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Link
                href="/skills"
                className="inline-flex items-center gap-2 px-3 py-1 bg-cannavec-50 rounded-full hover:bg-cannavec-100 transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-cannavec-500" />
                <span className="text-xs font-medium text-cannavec-600 tracking-wide">
                  CANNAVEC SKILLS
                </span>
              </Link>
              <span className="text-xs text-warm-300">/</span>
              <span className="text-xs font-medium text-cannavec-500">
                Cannabis Travel Planner
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display text-cannavec-900 mb-4">
              Can I travel with my cannabis?
            </h1>
            <p className="text-lg text-warm-500 mb-4 max-w-2xl">
              The Cannabis Travel Planner tells medical cannabis patients whether
              they can travel with their prescribed medicine — and exactly what
              they need to do. Two questions, one clear answer.
            </p>
            <p className="text-sm text-warm-400 mb-8">
              Covers transit hub risks, country-specific documentation
              requirements, and step-by-step guidance — all sourced from the
              Cannabis Knowledge Foundation regulatory database.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth/signup"
                className="cannavec-btn-primary inline-flex items-center gap-2"
              >
                Create free account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/auth/login" className="cannavec-btn-secondary">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sign-up gate */}
      <section className="py-16 bg-white border-b border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-14 h-14 bg-[#f5f7f0] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-[#8a9a5a]" />
            </div>
            <h2 className="font-display text-2xl text-cannavec-900 mb-3">
              Free to use — sign up to access
            </h2>
            <p className="text-warm-500 text-sm mb-6 leading-relaxed">
              The Cannabis Travel Planner is available to all registered Cannavec users at no charge.
              Create a free account to use it now.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/signup"
                className="cannavec-btn-primary inline-flex items-center justify-center gap-2"
              >
                Create free account <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/auth/login"
                className="cannavec-btn-secondary inline-flex items-center justify-center gap-2"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl text-cannavec-900 mb-10">
            What you get
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="bg-white rounded-xl border border-warm-200 p-5"
              >
                <div className="w-9 h-9 bg-cannavec-50 rounded-lg flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-cannavec-500" />
                </div>
                <h3 className="font-medium text-cannavec-900 text-sm mb-1">{title}</h3>
                <p className="text-xs text-warm-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Back to all Skills */}
      <section className="py-8 bg-warm-50 border-t border-warm-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/skills"
            className="text-sm text-cannavec-500 hover:underline inline-flex items-center gap-1"
          >
            ← All Skills
          </Link>
        </div>
      </section>
    </>
  );
}
