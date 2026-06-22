import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { authors, title, publisher, year, format = "apa", type = "book" } = await req.json()

    if (!authors || !title) {
      return NextResponse.json({ error: "Authors and title are required" }, { status: 400 })
    }

    const yr = year || "n.d."
    let citation = ""

    switch (format) {
      case "apa":
        citation = `${authors} (${yr}). *${title}*. ${publisher || "Publisher"}.`
        break
      case "mla":
        citation = `${authors}. *${title}*. ${publisher || "Publisher"}, ${yr}.`
        break
      case "chicago":
        citation = `${authors}. *${title}*. ${publisher || "Publisher"}, ${yr}.`
        break
      case "harvard":
        citation = `${authors} (${yr}) *${title}*. ${publisher || "Publisher"}.`
        break
    }

    return NextResponse.json({
      citation,
      format,
      type,
      generated: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: "Citation generation failed" }, { status: 500 })
  }
}
