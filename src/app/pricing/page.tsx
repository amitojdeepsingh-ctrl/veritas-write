"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { plans } from "@/lib/pricing"

export default function PricingPage() {
  const [ctaMsg, setCtaMsg] = useState<string | null>(null)

  const router = useRouter()

  const handleUpgrade = (planName: string) => {
    if (planName === "Free") {
      router.push("/dashboard")
      return
    }
    setCtaMsg(`${planName} plan — coming soon! You can use all features on the free tier for now.`)
    setTimeout(() => setCtaMsg(null), 4000)
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">Simple, Transparent Pricing</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          5,000 free words every month with full features. No crippled free tier. No sketchy billing.
          Upgrade only when you need more.
        </p>
      </div>

      {ctaMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg text-sm text-center max-w-md">
          {ctaMsg}
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col ${
              plan.highlighted
                ? "border-primary shadow-lg shadow-primary/10 scale-105"
                : "border"
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1">
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="mt-3">
                {plan.price < 0 ? (
                  <span className="text-3xl font-bold">Custom</span>
                ) : (
                  <>
                    <span className="text-4xl font-bold">
                      ${plan.price}
                    </span>
                    <span className="text-muted-foreground ml-1">/{plan.period}</span>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {plan.words > 0 && (
                <p className="text-sm text-muted-foreground mb-4">
                  {(plan.words / 1000).toLocaleString()}K words/month
                </p>
              )}
              {plan.words < 0 && (
                <p className="text-sm text-muted-foreground mb-4">Unlimited words</p>
              )}
              <ul className="space-y-3 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-emerald-500 shrink-0 mt-0.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleUpgrade(plan.name)}
                className={`w-full mt-auto ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-primary/80"
                    : "border border-border bg-background hover:bg-muted hover:text-foreground"
                }`}
              >
                {plan.cta}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Compare Plans</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 pr-4 font-semibold">Feature</th>
                {plans.map((p) => (
                  <th key={p.name} className="text-center py-3 px-4 font-semibold">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {[
                ["AI Detection (per-detector)", "6 detectors", "6 detectors", "6 detectors", "6 detectors"],
                ["Humanization levels", "5 levels + 4 tones", "5 levels + 4 tones", "5 levels + 4 tones", "Custom model"],
                ["Words per month", "5,000", "50,000", "500,000", "Unlimited"],
                ["API access", "—", "1K req/day", "Unlimited", "Unlimited"],
                ["Plagiarism check", "Included", "Included", "Included", "Included"],
                ["Citation generator", "All 4 formats", "All 4 formats", "All 4 formats", "All 4 formats"],
                ["Team workspace", "—", "—", "Included", "Included"],
                ["Brand voice presets", "—", "—", "Included", "Custom trained"],
                ["Private deployment", "—", "—", "—", "Included"],
                ["Support", "Community", "Priority", "Dedicated", "24/7 + SLA"],
              ].map(([feature, ...vals]) => (
                <tr key={feature}>
                  <td className="py-3 pr-4 font-medium">{feature}</td>
                  {vals.map((v, i) => (
                    <td key={i} className="text-center py-3 px-4 text-muted-foreground">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
