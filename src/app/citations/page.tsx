"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { formatCitation, type CitationFormat, type Work, type WorkType } from "@/lib/citations"

interface CitationResult {
  id: string
  format: CitationFormat
  text: string
  type: WorkType
  title: string
}

export default function CitationsPage() {
  const [format, setFormat] = useState<CitationFormat>("apa")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState<WorkType | "all">("all")
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Work[]>([])
  const [searchError, setSearchError] = useState("")
  const [selectedWork, setSelectedWork] = useState<Work | null>(null)
  const [results, setResults] = useState<CitationResult[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    setSearchError("")
    setSearchResults([])
    try {
      const res = await fetch(`/api/citations?q=${encodeURIComponent(searchQuery)}&type=${searchType}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Search failed")
      }
      const data = (await res.json()) as { works: Work[] }
      setSearchResults(data.works)
      if (data.works.length === 0) {
        setSearchError("No results found. Try a different query.")
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Search failed")
    } finally {
      setSearching(false)
    }
  }

  const handleSelectWork = (work: Work) => {
    setSelectedWork(work)
  }

  const handleGenerate = (work: Work, fmt: CitationFormat) => {
    const text = formatCitation(work, fmt)
    const result: CitationResult = {
      id: `${work.id}-${fmt}-${Date.now()}`,
      format: fmt,
      text,
      type: work.type,
      title: work.title,
    }
    setResults((prev) => [result, ...prev])
  }

  const handleGenerateAll = () => {
    if (!selectedWork) return
    handleGenerate(selectedWork, format)
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Citation Generator</h1>
        <p className="text-muted-foreground">
          Search real academic papers and books. Generate APA, MLA, Chicago, and Harvard citations.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Search for a source</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Select value={searchType} onValueChange={(v) => setSearchType(v as WorkType | "all")}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sources</SelectItem>
                  <SelectItem value="book">Books</SelectItem>
                  <SelectItem value="journal">Journal articles</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Search by title, author, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch()
                }}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={searching || !searchQuery.trim()}>
                {searching ? "Searching..." : "Search"}
              </Button>
            </div>

            {searchError && <p className="text-sm text-destructive">{searchError}</p>}

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {searchResults.map((work) => (
                  <button
                    key={work.id}
                    onClick={() => handleSelectWork(work)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors hover:bg-accent ${
                      selectedWork?.id === work.id ? "border-primary bg-accent" : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs">
                            {work.type === "book" ? "Book" : "Journal"}
                          </Badge>
                          {work.year && (
                            <span className="text-xs text-muted-foreground">{work.year}</span>
                          )}
                        </div>
                        <p className="font-medium text-sm line-clamp-2">{work.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {work.authors.length > 0 ? work.authors.join(", ") : "Unknown author"}
                          {work.journal ? ` — ${work.journal}` : ""}
                          {work.publisher ? ` — ${work.publisher}` : ""}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedWork && (
          <Card className="border-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Generate citation</span>
                <Badge variant="outline" className="text-xs">
                  {selectedWork.type}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {(["apa", "mla", "chicago", "harvard"] as CitationFormat[]).map((fmt) => (
                  <Button
                    key={fmt}
                    variant={format === fmt ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormat(fmt)}
                    className="uppercase"
                  >
                    {fmt}
                  </Button>
                ))}
              </div>

              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Selected source:</p>
                <p className="font-medium text-sm">{selectedWork.title}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedWork.authors.join(", ") || "Unknown author"}
                  {selectedWork.year ? ` (${selectedWork.year})` : ""}
                  {selectedWork.journal ? ` — ${selectedWork.journal}` : ""}
                  {selectedWork.doi ? ` — DOI: ${selectedWork.doi}` : ""}
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">
                {(["apa", "mla", "chicago", "harvard"] as CitationFormat[]).map((fmt) => (
                  <Button
                    key={`gen-${fmt}`}
                    variant="secondary"
                    size="sm"
                    onClick={() => handleGenerate(selectedWork, fmt)}
                  >
                    Generate {fmt.toUpperCase()}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Generated citations</h2>
            {results.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setResults([])}>
                Clear all
              </Button>
            )}
          </div>

          {results.length === 0 ? (
            <Card className="bg-muted/30">
              <CardContent className="p-12 text-center">
                <div className="text-4xl mb-4 opacity-30">&quot;</div>
                <p className="text-muted-foreground">
                  Search for a source above, then generate citations in any format.
                </p>
              </CardContent>
            </Card>
          ) : (
            results.map((r) => (
              <Card key={r.id} className="group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="outline" className="uppercase text-xs">
                          {r.format}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {r.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground truncate">{r.title}</span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{r.text}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleCopy(r.id, r.text)}
                    >
                      {copiedId === r.id ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
