export interface DetectionResult {
  overall: {
    score: number
    verdict: "human" | "ai" | "uncertain"
    confidence: number
  }
  detectors: {
    name: string
    score: number
    verdict: "human" | "ai" | "uncertain"
  }[]
  highlights: {
    start: number
    end: number
    probability: number
    text: string
  }[]
}

export interface HumanizeOptions {
  intensity: "minimal" | "light" | "moderate" | "heavy" | "max"
  tone: "academic" | "conversational" | "professional" | "narrative"
}

export interface HumanizeResult {
  original: string
  rewritten: string
  changes: {
    type: "vocabulary" | "structure" | "rhythm" | "formality"
    description: string
  }[]
  metrics: {
    originalScore: number
    rewrittenScore: number
    improvement: number
  }
}

export interface Citation {
  type: "book" | "journal" | "website" | "video" | "podcast"
  authors: string[]
  title: string
  year: number
  publisher?: string
  url?: string
  doi?: string
  pages?: string
  format: "apa" | "mla" | "chicago" | "harvard"
}

export interface PlagiarismResult {
  overall: number
  sources: {
    url: string
    title: string
    similarity: number
    matchedText: string
  }[]
}

export interface PricingPlan {
  name: string
  price: number
  period: "month" | "year"
  words: number
  features: string[]
  highlighted?: boolean
  cta: string
}
