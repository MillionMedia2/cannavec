import { Shield, Eye, Heart, Scale, BookOpen, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Cannabis Knowledge Foundation",
  description: "The Cannabis Knowledge Foundation is a patient-governed editorial board ensuring the accuracy and credibility of cannabis science.",
};

const boardMembers = [
  {
    name: "Chris Hobday",
    role: "Head of Ops & External Projects, UPA",
    bio: "One of three patients instrumental in changing UK medical cannabis laws in 2018. First patient prescribed Cannabis Based Products for Medicinal use (CBPMs) by the Medical Cannabis Clinics (MCC). Brings direct lived experience and deep regulatory knowledge to the Foundation.",
  },
  {
    name: "Alt Spoonie",
    role: "Patient Advocate & Cannabis Educator",
    bio: "Medical cannabis patient of four years with a focus on cannabis education, harm reduction and patient advocacy. Ambassador for Blazy Susan, King Palm and Loud Box. Bridges the gap between patient communities and the clinical evidence base.",
  },
  {
    name: "Medcannadiaries",
    role: "Independent Reviewer & Educator",
    bio: "Plantz community member, criminology student and Alternaleaf_uk patient with 17 years of cannabis knowledge. Produces independent reviews and educational content, bringing rigorous analytical perspective to product and evidence evaluation.",
  },
  {
    name: "Yasha Khan",
    role: "Entrepreneur & Data Scientist",
    bio: "Nine years in the cannabis industry spanning marketing, data science and technology. Background in AI surveillance systems, with non-profit work supporting at-risk youth. Brings technical and commercial expertise to the Foundation's operations.",
  },
  {
    name: "MV (Duma)",
    role: "Research Contributor & Patient Scientist",
    bio: "Long-standing Plantz community member and fibromyalgia sufferer. An exploratory cannabis scientist who researches high-potency consumption methods, extraction techniques and novel delivery systems. Ensures the knowledge base reflects real-world patient experience.",
  },
];

const principles = [
  { icon: Shield, title: "Evidence Before Opinion", description: "Every record in the knowledge base is graded by evidence level. RCTs and meta-analyses carry more weight than expert opinion." },
  { icon: Eye, title: "Transparency Before Speed", description: "We'd rather be slow and right than fast and wrong. Sources are cited, contradictions are acknowledged, limitations are stated." },
  { icon: Heart, title: "Patient Safety Above Everything", description: "Contraindications, drug interactions and adverse effects are always documented. Compliance-safe language throughout." },
  { icon: Scale, title: "Independence From Commercial Influence", description: "No product marketing, no payment for favourable coverage, no hidden conflicts of interest. The knowledge serves patients, not shareholders." },
  { icon: BookOpen, title: "Knowledge as a Public Good", description: "The Foundation owns the knowledge as a community asset. Upon dissolution, the entire knowledge base is preserved in a public archive." },
  { icon: Users, title: "Patient Governance", description: "The editorial board includes patients, advocates and researchers — not pharmaceutical companies. Decisions are evidence-based, not popularity-based." },
];

export default function AboutPage() {
  return (
    <>
      <section className="py-20 sm:py-28 cannavec-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-display text-cannavec-900 mb-6">The Cannabis Knowledge Foundation</h1>
            <p className="text-lg text-warm-500 leading-relaxed">
              A patient-governed, evidence-first organisation that stewards the cannabis industry&apos;s most rigorous knowledge base. We exist to ensure that the science behind cannabis is accurate, transparent, independent and accessible to everyone who needs it.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-display text-cannavec-900 mb-6">Why We Exist</h2>
            <div className="space-y-4 text-warm-500 leading-relaxed">
              <p>The cannabis industry has a knowledge problem. Patients make decisions based on marketing claims. Clinics prescribe without standardised evidence. AI chatbots hallucinate dosing advice. Product labels use unsubstantiated therapeutic language.</p>
              <p>The Cannabis Knowledge Foundation was created to fix this. We maintain a curated, evidence-graded knowledge base covering cannabinoid mechanisms, clinical protocols, safety data, drug interactions, product formulations and regulatory frameworks — all reviewed by a named editorial board with real expertise and lived experience.</p>
              <p>Through the Cannavec API, this knowledge becomes infrastructure that any clinic, platform, brand or researcher can build on. The result is an industry where every piece of cannabis information traces back to evidence.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="standards" className="py-16 cannavec-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-display text-cannavec-900 mb-8">Constitutional Principles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {principles.map((p, i) => (
              <div key={i} className="p-6 bg-white rounded-xl border border-warm-200">
                <div className="w-10 h-10 bg-cannavec-50 rounded-lg flex items-center justify-center mb-4">
                  <p.icon size={20} className="text-cannavec-500" />
                </div>
                <h3 className="text-base font-display text-cannavec-900 mb-2">{p.title}</h3>
                <p className="text-sm text-warm-500 leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="board" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl font-display text-cannavec-900 mb-4">Editorial Board</h2>
            <p className="text-warm-500">The people who ensure every record in the knowledge base meets our evidence standards. Named, accountable, and committed to accuracy.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boardMembers.map((member, i) => (
              <div key={i} className="p-6 rounded-xl border border-warm-200 hover:border-cannavec-200 transition-colors">
                <div className="w-12 h-12 bg-cannavec-gradient rounded-full flex items-center justify-center mb-4">
                  <span className="text-white font-display text-lg">{member.name.charAt(0)}</span>
                </div>
                <h3 className="text-base font-display text-cannavec-900 mb-1">{member.name}</h3>
                <p className="text-xs font-medium text-cannavec-500 mb-3">{member.role}</p>
                <p className="text-sm text-warm-500 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="governance" className="py-16 cannavec-gradient-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-display text-cannavec-900 mb-6">Governance Structure</h2>
            <div className="space-y-6">
              {[
                { title: "Trustees", desc: "Legal and fiduciary oversight, licence enforcement, protection of the Foundation's charitable purpose. Trustees do not intervene in editorial decisions." },
                { title: "Editorial Council", desc: "Approves canonical content, sets evidence standards, resolves disputes between conflicting evidence, and issues versioned releases of the knowledge base. Decisions are evidence-based, not popularity-based." },
                { title: "Contributors", desc: "Submit content and evidence, flag inaccuracies, propose corrections. Contributors cannot approve canonical content or override editorial decisions." },
              ].map((level, i) => (
                <div key={i} className="p-6 bg-white rounded-xl border border-warm-200">
                  <h3 className="text-base font-display text-cannavec-900 mb-2">{level.title}</h3>
                  <p className="text-sm text-warm-500 leading-relaxed">{level.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-display text-cannavec-900 mb-6">Evidence Grading System</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-5 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="badge-level-a">Level A</span>
                <div>
                  <h4 className="text-sm font-medium text-cannavec-900 mb-1">Strong Evidence</h4>
                  <p className="text-sm text-warm-500">Randomised controlled trials, systematic reviews, meta-analyses. The highest confidence level.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 bg-amber-50 rounded-xl border border-amber-200">
                <span className="badge-level-b">Level B</span>
                <div>
                  <h4 className="text-sm font-medium text-cannavec-900 mb-1">Moderate Evidence</h4>
                  <p className="text-sm text-warm-500">Observational studies, cohort studies, clinical registries, well-designed case-control studies.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="badge-level-c">Level C</span>
                <div>
                  <h4 className="text-sm font-medium text-cannavec-900 mb-1">Limited Evidence</h4>
                  <p className="text-sm text-warm-500">Expert opinion, case reports, traditional use, preclinical studies. Included for completeness, always flagged.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
