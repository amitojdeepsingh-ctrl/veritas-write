import { NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/usage"
import { searchWorks, formatCitation, type CitationFormat, type Work, type WorkType } from "@/lib/citations"

export const maxDuration = 30

export async function GET(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")
  const type = (searchParams.get("type") ?? "all") as WorkType | "all"

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 })
  }

  try {
    const works = await searchWorks(q.trim(), type)
    return NextResponse.json({ works, query: q, count: works.length })
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  try {
    const { work, format = "apa" } = (await req.json()) as { work: Work; format: CitationFormat }

    if (!work || !work.title) {
      return NextResponse.json({ error: "Work with title is required" }, { status: 400 })
    }

    const citation = formatCitation(work, format)
    return NextResponse.json({
      citation,
      format,
      type: work.type,
      generated: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({ error: "Citation generation failed" }, { status: 500 })
  }
}
