import { PricingPlan } from "@/types"

export const plans: PricingPlan[] = [
  {
    name: "Free",
    price: 0,
    period: "month",
    words: 5000,
    features: [
      "AI detection (detailed scores)",
      "Humanization with basic controls",
      "5,000 words/month",
      "Standard support",
    ],
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: 9.99,
    period: "month",
    words: 50000,
    features: [
      "Everything in Free",
      "5 intensity levels + 4 tone presets",
      "50,000 words/month",
      "API access (1,000 req/day)",
      "Priority support",
    ],
    highlighted: true,
    cta: "Start Free Trial",
  },
  {
    name: "Team",
    price: 29.99,
    period: "month",
    words: 500000,
    features: [
      "Everything in Pro",
      "500,000 words/month",
      "Team workspace + shared history",
      "API access (unlimited)",
      "Brand voice presets",
      "Dedicated support",
    ],
    cta: "Contact Sales",
  },
  {
    name: "Enterprise",
    price: -1,
    period: "month",
    words: -1,
    features: [
      "Everything in Team",
      "Unlimited words",
      "Private deployment / white-label",
      "Custom fine-tuned model",
      "SLA & compliance audit trail",
      "On-premise option",
    ],
    cta: "Talk to Us",
  },
]
