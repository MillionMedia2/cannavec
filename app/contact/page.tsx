import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact — Cannavec",
  description: "Get in touch about Cannavec API access, enterprise partnerships, or the Cannabis Knowledge Foundation.",
};

export default function ContactPage() {
  return (
    <>
      <section className="py-20 sm:py-28 cannavec-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-display text-cannavec-900 mb-6">
              Get in touch.
            </h1>
            <p className="text-lg text-warm-500">
              Whether you&apos;re exploring Enterprise access, want to discuss integration, or have questions about the Foundation — we&apos;d love to hear from you.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-warm-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-display text-cannavec-900 mb-6">
                Send us a message
              </h2>
              <p className="text-warm-500 mb-8">
                For Enterprise discussions, custom integrations, bulk pricing or partnership opportunities, fill in the form and we&apos;ll get back to you promptly.
              </p>

              <ContactForm />

              <div className="mt-8 p-6 bg-cannavec-50 rounded-xl border border-cannavec-100">
                <h3 className="text-base font-display text-cannavec-900 mb-2">
                  Meeting us at Cannabis Europa?
                </h3>
                <p className="text-sm text-warm-500 mb-4">
                  We&apos;ll be at Cannabis Europa, London on May 26 &amp; 27. Drop us a line to arrange a meeting at the event.
                </p>
                <a
                  href="mailto:hello@cannavec.ai?subject=Cannabis%20Europa%20Meeting"
                  className="cannavec-btn-primary text-sm"
                >
                  Book a Meeting
                  <ArrowRight size={16} className="ml-2" />
                </a>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-display text-cannavec-900 mb-6">Quick Start</h2>
              <div className="space-y-4">
                {[
                  { title: "Try the API", desc: "See what the knowledge base returns with our interactive demo.", href: "/demo", cta: "Open Demo" },
                  { title: "View Pricing", desc: "Free to get started. Individual plans from £75/month.", href: "/pricing", cta: "See Plans" },
                  { title: "Read the Docs", desc: "Full API reference with authentication, endpoints and examples.", href: "/docs", cta: "API Docs" },
                ].map((item, i) => (
                  <Link key={i} href={item.href} className="block p-5 bg-white rounded-xl border border-warm-200 hover:border-cannavec-200 transition-colors group">
                    <h3 className="text-base font-display text-cannavec-900 mb-1 group-hover:text-cannavec-600 transition-colors">{item.title}</h3>
                    <p className="text-sm text-warm-500 mb-3">{item.desc}</p>
                    <span className="text-sm font-medium text-cannavec-500 flex items-center gap-1">
                      {item.cta}
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
