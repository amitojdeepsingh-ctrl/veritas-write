const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY
const MISTRAL_MODEL = process.env.MISTRAL_MODEL || "mistral-small-latest"
const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434"
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "mistral"

const useMistralAPI = !!MISTRAL_API_KEY

interface GenerateOpts {
  prompt: string
  system?: string
  temperature?: number
  maxTokens?: number
}

async function generate(opts: GenerateOpts): Promise<string> {
  if (useMistralAPI) {
    return generateMistral(opts)
  }
  return generateOllama(opts)
}

async function generateMistral(opts: GenerateOpts): Promise<string> {
  const messages = []
  if (opts.system) {
    messages.push({ role: "system", content: opts.system })
  }
  messages.push({ role: "user", content: opts.prompt })

  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: MISTRAL_MODEL,
      messages,
      temperature: opts.temperature ?? 0.1,
      max_tokens: opts.maxTokens ?? 2048,
    }),
  })

  if (!res.ok) {
    throw new Error(`Mistral API error: ${res.status} ${await res.text()}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() ?? ""
}

async function generateOllama(opts: GenerateOpts): Promise<string> {
  const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt: opts.prompt,
      system: opts.system,
      temperature: opts.temperature ?? 0.1,
      options: { num_predict: opts.maxTokens ?? 2048 },
      stream: false,
    }),
  })

  if (!res.ok) {
    throw new Error(`Ollama error: ${res.status} ${await res.text()}`)
  }

  const data = await res.json()
  return data.response.trim()
}

async function generateJSON<T>(opts: GenerateOpts): Promise<T> {
  let raw: string

  if (useMistralAPI) {
    const messages = []
    if (opts.system) {
      messages.push({ role: "system", content: opts.system })
    }
    messages.push({ role: "user", content: opts.prompt })

    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages,
        temperature: opts.temperature ?? 0.05,
        max_tokens: opts.maxTokens ?? 2048,
        response_format: { type: "json_object" },
      }),
    })

    if (!res.ok) {
      throw new Error(`Mistral API error: ${res.status} ${await res.text()}`)
    }

    const data = await res.json()
    raw = data.choices?.[0]?.message?.content?.trim() ?? ""
  } else {
    raw = await generateOllama(opts)
  }

  const jsonStr = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim()

  const start = jsonStr.indexOf("{")
  const end = jsonStr.lastIndexOf("}")
  if (start === -1 || end === -1) throw new Error("No JSON found in response: " + raw.slice(0, 200))

  return JSON.parse(jsonStr.slice(start, end + 1)) as T
}

export async function detectText(text: string) {
  const raw = await generateJSON<{
    overall?: { score?: number; verdict?: string; confidence?: number }
    detectors?: { name?: string; score?: number; verdict?: string }[]
    highlights?: { start?: number; end?: number; probability?: number; text?: string }[]
  }>({
    prompt: `Analyze this text for AI patterns. Return JSON with:
- overall: { score (integer 0-100 where higher = more AI-like), verdict ("ai"|"human"|"uncertain"), confidence (integer 0-100) }
- detectors: array of { name, score (integer 0-100), verdict ("ai"|"human"|"uncertain") } for each of: Turnitin, GPTZero, Originality, Copyleaks, Writer, Sapling
- highlights: array of { start (character offset), end (character offset), probability (integer 0-100), text (the matched substring) }

IMPORTANT: All scores must be integers between 0 and 100, NOT decimals.

Text: """${text.slice(0, 3000)}"""`,
    temperature: 0.05,
    maxTokens: 1500,
  })

  const normalizeScore = (s: number | undefined): number => {
    const val = s ?? 50
    if (val <= 1) return Math.round(val * 100)
    return Math.round(val)
  }

  const normalizeVerdict = (v: string | undefined): "ai" | "human" | "uncertain" => {
    if (!v) return "uncertain"
    const lower = v.toLowerCase()
    if (lower.includes("ai") || lower.includes("likely")) return "ai"
    if (lower.includes("human")) return "human"
    return "uncertain"
  }

  const overall = {
    score: normalizeScore(raw.overall?.score),
    verdict: normalizeVerdict(raw.overall?.verdict),
    confidence: normalizeScore(raw.overall?.confidence),
  }

  const detectors = (raw.detectors ?? []).map((d) => ({
    name: d.name ?? "Unknown",
    score: normalizeScore(d.score),
    verdict: normalizeVerdict(d.verdict),
  }))

  const highlights = (raw.highlights ?? []).map((h) => ({
    start: h.start ?? 0,
    end: h.end ?? 0,
    probability: normalizeScore(h.probability),
    text: h.text ?? "",
  }))

  return { overall, detectors, highlights }
}

export async function humanizeText(
  text: string,
  intensity: string,
  tone: string
): Promise<{ rewritten: string; changes: { type: string; description: string }[] }> {
  const prompt = `Rewrite the following text with:
- Intensity: ${intensity} (minimal = light touch, max = complete rewrite)
- Tone: ${tone} (academic, conversational, professional, or narrative)

Rules:
- Keep all facts, data, and meaning intact
- Remove AI-sounding patterns (repetitive structures, formal transitions, uniform pacing)
- Make it sound naturally written by a human
- Vary sentence length and structure
- Use appropriate vocabulary for the tone
- Return ONLY the rewritten text, no explanations

Text to rewrite:
${text.slice(0, 3000)}`

  const rewritten = await generate({
    prompt,
    system: "You are an expert at humanizing AI-generated text. You rewrite content to sound naturally written by a person while preserving all meaning.",
    temperature: tone === "academic" ? 0.3 : 0.5,
    maxTokens: 4000,
  })

  const changes = []
  if (intensity !== "minimal") changes.push({ type: "vocabulary", description: `Replaced formal terms with natural alternatives (${tone} tone)` })
  if (intensity !== "minimal") changes.push({ type: "structure", description: `Varied sentence length and structure` })
  if (["heavy", "max"].includes(intensity)) changes.push({ type: "rhythm", description: "Adjusted paragraph flow and transitions" })
  changes.push({ type: "formality", description: `Adjusted formality for ${tone} tone` })

  return { rewritten, changes }
}
