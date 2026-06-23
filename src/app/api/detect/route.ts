import { NextRequest, NextResponse } from "next/server"
import { detectText } from "@/lib/ollama"
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
    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return NextResponse.json({ error: "Text must be at least 10 characters" }, { status: 400 })
    }

    const wordCount = text.trim().split(/\s+/).length
    const limit = await checkWordLimit(user.id, wordCount)
    if (!limit.allowed) {
      return NextResponse.json({ error: "Word limit exceeded. Upgrade your plan." }, { status: 429 })
    }

    const result = await detectText(text)
    await consumeWords(user.id, wordCount)

    return NextResponse.json(result)
  } catch (err) {
    console.error("Detection error:", err)
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: `Detection failed: ${message}` }, { status: 500 })
  }
}
