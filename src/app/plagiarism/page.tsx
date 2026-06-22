"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface PlagiarismResult {
  overall: number
  sources: { url: string; title: string; similarity: number; matchedText?: string }[]
  queriesRun?: number
  error?: string
}

export default function PlagiarismPage() {
  const [text, setText] = useState("")
  const [scanning, setScanning] = useState(false)
  const [results, setResults] = useState<PlagiarismResult | null>(null)
  const [error, setError] = useState("")

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  const handleScan = async () => {
    if (!text.trim()) return
    setScanning(true)
    setError("")
    setResults(null)

    try {
      const res = await fetch("/api/plagiarism", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Scan failed")
      }
      const data = await res.json()
      setResults(data)
    } catch (e) {
      setError((e as Error).message)
    }
    setScanning(false)
  }

  const getScoreColor = (score: number) => {
    if (score < 10) return "text-emerald-500"
    if (score < 25) return "text-amber-500"
    return "text-red-500"
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Plagiarism Check</h1>
        <p className="text-muted-foreground">Scan your text against web sources to ensure originality.</p>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Your Text</CardTitle>
            <span className="text-sm text-muted-foreground">{wordCount.toLocaleString()} words</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your essay, article, or paper..."
            className="min-h-[250px] resize-y text-sm leading-relaxed"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button
            size="lg"
            onClick={handleScan}
            disabled={!text.trim() || scanning}
            className="w-full sm:w-auto"
          >
            {scanning ? "Searching web sources..." : "Check Plagiarism"}
          </Button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
      </Card>

      {results && (
        <>
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg">Results</CardTitle>
                <Badge
                  variant="secondary"
                  className={
                    results.overall < 10
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : results.overall < 25
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-red-50 text-red-700 border-red-200"
                  }
                >
                  {results.overall}% Match
                </Badge>
                {results.queriesRun != null && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    {results.queriesRun} searches performed
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      results.overall < 10 ? "bg-emerald-500" : results.overall < 25 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(results.overall, 100)}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {results.overall < 10
                  ? "Your text appears to be original. No significant matches found."
                  : results.overall < 25
                    ? "Some matches found. Review the sources below."
                    : "High similarity detected. Review and revise flagged sections."}
              </p>
            </CardContent>
          </Card>

          {results.sources.length > 0 ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Matched Sources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.sources.map((s, i) => (
                  <div key={i} className="py-2 border-b last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium text-sm hover:underline truncate max-w-[70%]">
                        {s.title}
                      </a>
                      <span className={`text-sm font-semibold ${getScoreColor(s.similarity)}`}>
                        {s.similarity}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{s.url}</p>
                    {s.matchedText && (
                      <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2 mt-1 line-clamp-2">
                        {s.matchedText}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No matching sources found. Your text appears original.
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
