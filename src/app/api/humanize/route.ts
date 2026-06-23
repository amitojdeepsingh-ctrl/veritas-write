import { NextRequest, NextResponse } from "next/server"
import { detectText, humanizeText } from "@/lib/ollama"
import { getAuthUser, checkWordLimit, consumeWords } from "@/lib/usage"

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await req.json()
    const text = body.text
    const tone = body.tone ?? "academic"
    const intensity = body.intensity ?? "moderate"
    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return NextResponse.json({ error: "Text must be at least 10 characters" }, { status: 400 })
    }

    const wordCount = text.trim().split(/\s+/).length
    const limit = await checkWordLimit(user.id, wordCount, wordCount)
    if (!limit.allowed) {
      return NextResponse.json({ error: "Word limit exceeded. Upgrade your plan." }, { status: 429 })
    }

    const [originalResult, { rewritten, changes }] = await Promise.all([
      detectText(text),
      humanizeText(text, intensity, tone),
    ])

    const outputWords = rewritten.trim().split(/\s+/).length
    await consumeWords(user.id, wordCount, outputWords)

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
    console.error("Humanize error:", err)
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: `Humanization failed: ${message}` }, { status: 500 })
  }
}
