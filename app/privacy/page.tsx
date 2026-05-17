import type { Metadata } from "next";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Notice — Cannavec",
  description: "How Cannavec handles your personal data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-warm-50">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 bg-[#f5f7f0] rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#8a9a5a]" />
          </div>
          <h1 className="font-display text-3xl text-cannavec-900">Privacy Notice</h1>
        </div>
        <p className="text-sm text-warm-500 mb-8">Last updated: 15 May 2026</p>

        <div className="bg-white border border-warm-200 rounded-xl shadow-sm p-8 space-y-6 text-warm-700 leading-relaxed">
          <Section title="Who we are">
            <p>
              Cannavec is operated by <strong>Million Media Ltd</strong>, registered in
              England and Wales. We provide a cannabis knowledge platform for clinicians,
              researchers, and patients.
            </p>
          </Section>

          <Section title="What this notice covers">
            <p>
              This notice covers personal data you provide when using Cannavec's tools,
              including the <strong>Free Eligibility Check</strong> (also called the
              Triage Agent), and your visits to cannavec.ai.
            </p>
          </Section>

          <Section title="What we collect from the Eligibility Check">
            <p>If you complete the eligibility check, we collect:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Your name, email, mobile number, age, gender, and UK postcode</li>
              <li>The condition you're hoping to treat and any detail you provided</li>
              <li>Your answers to the eligibility questions (prior treatments, mental
                health history, pregnancy status, current medications)</li>
              <li>Your booking time preference, if you gave one</li>
              <li>The verdict our system produced based on your answers</li>
            </ul>
          </Section>

          <Section title="What we do with it">
            <p>
              We pass these details to the medical cannabis clinic you've consented to
              be contacted by. The clinic uses them to call you back and arrange a
              consultation. That's it.
            </p>
            <p className="mt-3">
              <strong>We do not:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Use your details for marketing</li>
              <li>Sell your data to anyone</li>
              <li>Share your data with advertisers, brokers, or data partners</li>
              <li>Use your details to train AI models</li>
            </ul>
          </Section>

          <Section title="Lawful basis">
            <p>
              We process your data on the basis of your <strong>explicit consent</strong>,
              which you give by ticking the consent checkbox before submitting the
              eligibility check. You can withdraw consent at any time (see "Your rights"
              below).
            </p>
          </Section>

          <Section title="Where your data lives">
            <p>
              Booking details are stored as calendar events on a Google Calendar managed
              by Cannavec. Web traffic logs (IP address, browser type) may be retained
              by our hosting provider (Vercel) for security and abuse prevention.
            </p>
            <p className="mt-3">
              We don't keep a separate database of patient eligibility check submissions
              beyond the calendar event for the booking.
            </p>
          </Section>

          <Section title="How long we keep it">
            <p>
              We keep your booking details for as long as is reasonable for the clinic
              to action it, typically 12 months. After that, the booking event is
              deleted from the calendar.
            </p>
          </Section>

          <Section title="Your rights">
            <p>Under UK GDPR you have the right to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Access the personal data we hold about you</li>
              <li>Correct any inaccurate data</li>
              <li>Have your data erased ("the right to be forgotten")</li>
              <li>Withdraw consent at any time</li>
              <li>Lodge a complaint with the Information Commissioner's Office
                (<a href="https://ico.org.uk" className="underline hover:text-cannavec-900">ico.org.uk</a>)</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us using the details on our{" "}
              <a href="/contact" className="underline hover:text-cannavec-900">contact page</a>.
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              Cannavec uses minimal cookies, limited to what's required for the site to
              function (authentication for logged-in users, rate limiting). We don't
              use third-party analytics or advertising cookies on the Eligibility Check.
            </p>
          </Section>

          <Section title="Changes to this notice">
            <p>
              If we update this notice we'll update the "Last updated" date above. For
              material changes that affect how we use your data, we'll do our best to
              notify you directly.
            </p>
          </Section>
        </div>

        <div className="mt-8 text-center">
          <a href="/" className="text-sm text-warm-500 hover:text-cannavec-900 underline">
            ← Back to Cannavec
          </a>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-lg text-cannavec-900 mb-2">{title}</h2>
      <div className="text-sm">{children}</div>
    </section>
  );
}
