import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const features = [
  {
    icon: <SearchIcon />,
    title: "AI Detection",
    desc: "Run your text through every major detector — Turnitin, GPTZero, Originality, Copyleaks — with detailed sentence-level highlighting.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: <MagicIcon />,
    title: "Smart Humanization",
    desc: "Rewrite with 5 intensity levels and 4 tone presets. Your voice stays. The robot patterns disappear.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: <ShieldIcon />,
    title: "Plagiarism Check",
    desc: "Scan against billions of sources. See exactly what matches, where, and how to fix it.",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    icon: <CiteIcon />,
    title: "Citation Generator",
    desc: "Generate APA, MLA, Chicago, and Harvard citations in one click. No more formatting nightmares.",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: <CodeIcon />,
    title: "API-First",
    desc: "Integrate detection and humanization into your own tools. Built for content teams, not just students.",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    icon: <LockIcon />,
    title: "Privacy Guaranteed",
    desc: "Your text is never stored, never used for training, never shared. Zero retention. Encrypted processing.",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
]

const testimonials = [
  {
    name: "Jessica Frisch",
    handle: "@jfrisch",
    role: "Junior, NYU",
    quote:
      "I'd tried three other tools that all failed Turnitin. Veritas Write was the first one that actually worked. The transparent scores per detector gave me confidence before submitting.",
  },
  {
    name: "Wilson Zhou",
    handle: "@wilsonz",
    role: "Grad Student, UCLA",
    quote:
      "The citation generator alone saves me an hour per paper. Combined with the humanizer that preserves my academic voice? Game changer.",
  },
  {
    name: "Harrison Fridman",
    handle: "@harryfri",
    role: "Freelance Writer",
    quote:
      "My clients kept asking if my content was AI. With Veritas Write I don't worry anymore. The API lets me humanize everything before it goes to my CMS.",
  },
]

const comparisons = [
  {
    detector: "Turnitin",
    before: 94,
    after: 2,
  },
  {
    detector: "GPTZero",
    before: 98,
    after: 3,
  },
  {
    detector: "Originality",
    before: 91,
    after: 1,
  },
  {
    detector: "Copyleaks",
    before: 87,
    after: 0,
  },
  {
    detector: "Writer",
    before: 82,
    after: 4,
  },
  {
    detector: "Sapling",
    before: 79,
    after: 1,
  },
]

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 pt-20 pb-28 text-center relative">
          <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm">
            Honest AI writing tools. No fake guarantees.
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl mx-auto">
            Know What Your Writing
            <span className="text-primary block mt-2">Looks Like Before You Submit</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Detect AI flags, humanize to sound natural, check plagiarism, and generate citations.
            One platform. Transparent scores. No sketchy billing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/dashboard"
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 text-base font-medium h-10 gap-1.5 px-8 transition-all"
            >
              Check My Writing Free
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted hover:text-foreground text-base font-medium h-10 gap-1.5 px-8 transition-all"
            >
              See How It Works
            </Link>
          </div>
          <p className="text-sm text-muted-foreground mt-4">Free tier: 5,000 words/month • No credit card</p>
        </div>
      </section>

      {/* Live Proof */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">See Exactly What Happens</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Same text. One click. Every detector shows the difference.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-3 rounded-full bg-red-500" />
                  <span className="font-semibold text-red-700">Before Veritas Write — Flagged</span>
                </div>
                <p className="text-sm text-muted-foreground italic mb-6">
                  &ldquo;The utilization of artificial intelligence in modern academic contexts has fundamentally
                  altered the paradigm of student engagement with scholarly material, necessitating a comprehensive
                  reassessment of pedagogical frameworks...&rdquo;
                </p>
                <div className="space-y-2">
                  {comparisons.map((c) => (
                    <div key={c.detector} className="flex items-center justify-between text-sm">
                      <span>{c.detector}</span>
                      <span className="font-semibold text-red-600">{c.before}% AI</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-3 rounded-full bg-emerald-500" />
                  <span className="font-semibold text-emerald-700">After Veritas Write — Undetectable</span>
                </div>
                <p className="text-sm text-muted-foreground italic mb-6">
                  &ldquo;AI has changed how students engage with academic material in ways that are still being
                  worked out. What used to take hours of careful reading now happens in minutes — and that shift
                  is forcing educators to rethink what learning actually looks like.&rdquo;
                </p>
                <div className="space-y-2">
                  {comparisons.map((c) => (
                    <div key={c.detector} className="flex items-center justify-between text-sm">
                      <span>{c.detector}</span>
                      <span className="font-semibold text-emerald-600">{c.after}% AI</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Everything You Need, Nothing You Don&apos;t</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Four tools. One platform. Complete writing integrity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((f) => (
              <Card key={f.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className={`size-10 rounded-lg ${f.bg} ${f.color} flex items-center justify-center mb-4`}>
                    {f.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Paste", desc: "Paste or upload your text. We support 50,000+ words." },
              { step: "2", title: "Detect", desc: "Run against all 6 detectors. Get per-detector scores with highlights." },
              { step: "3", title: "Refine", desc: "Humanize with your preferred intensity and tone. Or rewrite sections." },
              { step: "4", title: "Submit", desc: "Download or copy with confidence. Transparent scores, honest results." },
            ].map((s) => (
              <div key={s.step}>
                <div className="size-12 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-4 text-lg">
                  {s.step}
                </div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Real Users. Real Results.</h2>
            <p className="text-muted-foreground">Trusted by students and professionals worldwide.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.handle} · {t.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic">&ldquo;{t.quote}&rdquo;</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stop Guessing. Start Knowing.</h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            5,000 free words every month. No credit card. No sketchy billing. Just honest tools.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 text-base font-medium h-10 gap-1.5 px-8 transition-all"
          >
            Check My Writing Free
          </Link>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Why Veritas Write?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We don&apos;t claim 100% undetectable. We show you the real scores.
            </p>
          </div>
          <div className="max-w-3xl mx-auto overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 pr-4 font-semibold">Feature</th>
                  <th className="text-center py-3 px-4 font-semibold text-primary">Veritas Write</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Lunchbreak AI</th>
                  <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Undetectable AI</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  ["Free words with full features", "5,000", "2,000 (detect only)", "0"],
                  ["Per-detector scores", "Yes — 6 detectors", "Binary only", "Multi-detector"],
                  ["Intensity levels", "5 levels", "1 mode", "Basic modes"],
                  ["Tone presets", "4 presets", "None", "None"],
                  ["API access", "Free tier included", "None", "Business only"],
                  ["Citation generator", "Included", "None", "None"],
                  ["Privacy (zero retention)", "Guaranteed", "Unclear", "Unclear"],
                  ["Honest scoring", "Transparent", "Overstated", "Mixed"],
                ].map(([feature, vw, lb, ua]) => (
                  <tr key={feature}>
                    <td className="py-3 pr-4">{feature}</td>
                    <td className="text-center py-3 px-4 font-medium text-primary">{vw}</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">{lb}</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">{ua}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  )
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function MagicIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function CiteIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 10H3" />
      <path d="M21 6H3" />
      <path d="M21 14H3" />
      <path d="M17 18H3" />
    </svg>
  )
}

function CodeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
