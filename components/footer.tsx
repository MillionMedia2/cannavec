import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-cannavec-950 text-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-white/10 rounded-md flex items-center justify-center">
                <span className="text-white font-mono text-xs font-bold">cv</span>
              </div>
              <span className="font-display text-lg text-white">cannavec</span>
              <span className="text-accent text-xs font-mono">.ai</span>
            </Link>
            <p className="text-sm leading-relaxed">
              Evidence-based cannabis knowledge as a service. Powered by the
              Cannabis Knowledge Foundation.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-white mb-4">Product</h4>
            <ul className="space-y-3">
              {[
                { label: "Demo", href: "/demo" },
                { label: "Pricing", href: "/pricing" },
                { label: "API Documentation", href: "/docs" },
                { label: "Use Cases", href: "/use-cases" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm hover:text-white transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-white mb-4">Foundation</h4>
            <ul className="space-y-3">
              {[
                { label: "About CKF", href: "/about" },
                { label: "Editorial Board", href: "/about#board" },
                { label: "Evidence Standards", href: "/about#standards" },
                { label: "Governance", href: "/about#governance" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm hover:text-white transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-white mb-4">Get in Touch</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-sm hover:text-white transition-colors">Contact</Link>
              </li>
              <li>
                <a href="https://plantz.io" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-white transition-colors">Plantz.io</a>
              </li>
            </ul>
            <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-xs text-white/40">
                Part of the{" "}
                <a href="https://plantz.io" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Plantz</a>{" "}
                ecosystem
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Cannabis Knowledge Foundation. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            Evidence before opinion. Transparency before speed. Patient safety above everything.
          </p>
        </div>
      </div>
    </footer>
  );
}
