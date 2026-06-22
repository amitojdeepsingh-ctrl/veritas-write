import { NextRequest, NextResponse } from "next/server"
import { detectText } from "@/lib/ollama"

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return NextResponse.json({ error: "Text must be at least 10 characters" }, { status: 400 })
    }

    const result = await detectText(text)
    return NextResponse.json(result)
  } catch (err) {
    console.error("Detection error:", err)
    return NextResponse.json(
      { error: "Detection failed. Is Ollama running? (ollama serve)" },
      { status: 500 }
    )
  }
}
