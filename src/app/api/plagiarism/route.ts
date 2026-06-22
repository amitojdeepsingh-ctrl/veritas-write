import { NextRequest, NextResponse } from "next/server"
import { checkPlagiarism } from "@/lib/plagiarism"
import { getAuthUser, checkWordLimit, consumeWords } from "@/lib/usage"

export const maxDuration = 60

export async function POST(req: NextRequest) {
  let text = ""
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await req.json()
    text = body.text
    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return NextResponse.json({ error: "Text must be at least 20 characters" }, { status: 400 })
    }

    const wordCount = text.trim().split(/\s+/).length
    const limit = await checkWordLimit(user.id, wordCount)
    if (!limit.allowed) {
      return NextResponse.json({ error: "Word limit exceeded. Upgrade your plan." }, { status: 429 })
    }

    const result = await checkPlagiarism(text)
    await consumeWords(user.id, wordCount)

    return NextResponse.json(result)
  } catch (err) {
    console.error("Plagiarism check error:", err)
    return NextResponse.json(
      { overall: 0, sources: [], queriesRun: 0, error: "Search temporarily unavailable" },
      { status: 200 }
    )
  }
}
