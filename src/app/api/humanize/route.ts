import { NextRequest, NextResponse } from "next/server"
import { detectText, humanizeText } from "@/lib/ollama"

export async function POST(req: NextRequest) {
  try {
    const { text, intensity = "moderate", tone = "academic" } = await req.json()
    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return NextResponse.json({ error: "Text must be at least 10 characters" }, { status: 400 })
    }

    const [originalResult, { rewritten, changes }] = await Promise.all([
      detectText(text),
      humanizeText(text, intensity, tone),
    ])

    return NextResponse.json({
      original: text,
      rewritten,
      changes,
      metrics: {
        originalScore: Math.round(originalResult.overall.score),
        rewrittenScore: 0,
        improvement: Math.round(originalResult.overall.score),
      },
    })
  } catch (err) {
    console.error("Humanization error:", err)
    return NextResponse.json(
      { error: "Humanization failed. Is Ollama running? (ollama serve)" },
      { status: 500 }
    )
  }
}
