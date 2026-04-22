"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, LayoutDashboard, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { label: "Demo", href: "/demo" },
  { label: "Pricing", href: "/pricing" },
  { label: "API Docs", href: "/docs" },
  { label: "About", href: "/about" },
  { label: "Use Cases", href: "/use-cases" },
];

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-warm-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 cannavec-gradient rounded-md flex items-center justify-center">
              <span className="text-white font-mono text-xs font-bold">cv</span>
            </div>
            <span className="font-display text-xl text-cannavec-900 tracking-tight">
              cannavec
            </span>
            <span className="text-accent text-xs font-mono font-medium mt-1">.ai</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-warm-500 hover:text-cannavec-500 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="cannavec-btn-primary text-sm !py-2 !px-4 flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-cannavec-500 hover:text-cannavec-600 transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Login
                </Link>
                <Link href="/pricing" className="cannavec-btn-primary text-sm !py-2 !px-4">
                  Get API Access
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-warm-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-sm font-medium text-warm-500 hover:text-cannavec-500"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-warm-200 space-y-2">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="cannavec-btn-primary text-sm w-full text-center flex items-center justify-center gap-1.5"
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block text-sm font-medium text-cannavec-500 hover:text-cannavec-600 text-center py-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/pricing"
                    className="cannavec-btn-primary text-sm w-full text-center"
                    onClick={() => setMobileOpen(false)}
                  >
                    Get API Access
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
