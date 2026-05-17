"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./footer";

export function FooterWrapper() {
  const pathname = usePathname();
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin") || pathname?.startsWith("/triage")) {
    return null;
  }
  return <Footer />;
}
