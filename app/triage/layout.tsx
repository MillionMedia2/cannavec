/**
 * Empty layout for the /triage standalone route.
 *
 * Next.js requires this file to exist for the route to be nested correctly,
 * but it intentionally doesn't add markup — the actual rendering of "no nav
 * and no footer" is handled by Navigation and FooterWrapper checking the
 * pathname and returning null when on /triage*.
 *
 * See: components/navigation.tsx and components/footer-wrapper.tsx
 */
export default function TriageStandaloneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
