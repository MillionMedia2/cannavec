import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="absolute inset-0 cannavec-gradient" />
      <div className="absolute inset-0 noise-overlay" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display text-white mb-6">
          Start building with
          <br />
          verified cannabis science.
        </h2>
        <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
          Join for free and start building on the Cannabis Knowledge Foundation.
          From £75/month for full API & MCP access, with enterprise plans available on request.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/pricing" className="cannavec-btn-accent text-base group">
            Join For Free
            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 text-white font-medium rounded-lg border-2 border-white/30 hover:bg-white/10 transition-all duration-200"
          >
            Talk to Us About Enterprise
          </Link>
        </div>

        <p className="text-sm text-white/40 mt-8">
          Meet us at Cannabis Europa, London · May 26 & 27
        </p>
      </div>
    </section>
  );
}
