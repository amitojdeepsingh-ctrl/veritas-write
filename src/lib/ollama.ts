const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434"
const MODEL = process.env.OLLAMA_MODEL || "mistral"

interface OllamaGenerateOpts {
  prompt: string
  system?: string
  temperature?: number
  maxTokens?: number
  format?: "json"
}

export async function generate(opts: OllamaGenerateOpts) {
  const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      prompt: opts.prompt,
      system: opts.system,
      temperature: opts.temperature ?? 0.1,
      options: {
        num_predict: opts.maxTokens ?? 2048,
      },
      format: opts.format,
      stream: false,
    }),
  })

  if (!res.ok) {
    throw new Error(`Ollama error: ${res.status} ${await res.text()}`)
  }

  const data = await res.json()
  return data.response.trim()
}

export async function generateJSON<T>(opts: OllamaGenerateOpts): Promise<T> {
  const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      prompt: opts.prompt,
      system: opts.system,
      temperature: opts.temperature ?? 0.05,
      options: {
        num_predict: opts.maxTokens ?? 2048,
      },
      stream: false,
    }),
  })

  if (!res.ok) {
    throw new Error(`Ollama error: ${res.status} ${await res.text()}`)
  }

  const data = await res.json()
  const raw = data.response.trim()

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
    prompt: `Analyze this text for AI patterns. Return JSON with overall.score/verdict/confidence, detectors array (names: Turnitin, GPTZero, Originality, Copyleaks, Writer, Sapling each with score and verdict), and highlights array with start/end/probability/text.

Text: """${text.slice(0, 3000)}"""`,
    temperature: 0.05,
    maxTokens: 1500,
  })

  const overall = {
    score: raw.overall?.score ?? 50,
    verdict: raw.overall?.verdict ?? "uncertain",
    confidence: raw.overall?.confidence ?? 50,
  }

  const detectors = (raw.detectors ?? []).map((d) => ({
    name: d.name ?? "Unknown",
    score: d.score ?? 50,
    verdict: d.verdict ?? "uncertain",
  }))

  const highlights = (raw.highlights ?? []).map((h) => ({
    start: h.start ?? 0,
    end: h.end ?? 0,
    probability: h.probability ?? 50,
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
