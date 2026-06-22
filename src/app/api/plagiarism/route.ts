import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    await new Promise((r) => setTimeout(r, 1000))

    const overall = Math.floor(Math.random() * 25) + 3

    return NextResponse.json({
      overall,
      sources: [
        {
          url: "https://example.com/article-1",
          title: "Matched academic source",
          similarity: Math.floor(Math.random() * 15) + 1,
          matchedText: text.slice(0, 80),
        },
        {
          url: "https://example.org/research",
          title: "Related publication",
          similarity: Math.floor(Math.random() * 10) + 1,
          matchedText: text.slice(20, 100),
        },
      ],
    })
  } catch {
    return NextResponse.json({ error: "Plagiarism check failed" }, { status: 500 })
  }
}
