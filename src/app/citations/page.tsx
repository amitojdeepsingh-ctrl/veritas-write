"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

type CitationFormat = "apa" | "mla" | "chicago" | "harvard"
type CitationType = "book" | "journal" | "website" | "video"

interface CitationResult {
  format: CitationFormat
  text: string
  type: CitationType
}

export default function CitationsPage() {
  const [format, setFormat] = useState<CitationFormat>("apa")
  const [type, setType] = useState<CitationType>("book")
  const [authors, setAuthors] = useState("")
  const [title, setTitle] = useState("")
  const [publisher, setPublisher] = useState("")
  const [year, setYear] = useState("")
  const [url, setUrl] = useState("")
  const [doi, setDoi] = useState("")
  const [results, setResults] = useState<CitationResult[]>([])
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const handleGenerate = () => {
    if (!authors.trim() || !title.trim()) return

    const newCitation: CitationResult = {
      format,
      type,
      text: generateCitation(format, type, authors, title, publisher, year, url, doi),
    }

    setResults((prev) => [newCitation, ...prev])
  }

  const handleCopy = (index: number, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(index)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Citation Generator</h1>
        <p className="text-muted-foreground">
          Generate APA, MLA, Chicago, and Harvard citations in one click.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Citation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Format</label>
                <Select value={format} onValueChange={(v) => setFormat(v as CitationFormat)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apa">APA (7th ed.)</SelectItem>
                    <SelectItem value="mla">MLA (9th ed.)</SelectItem>
                    <SelectItem value="chicago">Chicago</SelectItem>
                    <SelectItem value="harvard">Harvard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Source Type</label>
                <Select value={type} onValueChange={(v) => setType(v as CitationType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="book">Book</SelectItem>
                    <SelectItem value="journal">Journal Article</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Authors</label>
              <Input
                placeholder="Smith, J., & Doe, A."
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Title of the work"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Publisher</label>
                <Input
                  placeholder="Publisher name"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <Input
                  placeholder="2024"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">URL / DOI</label>
              <Input
                placeholder="https://doi.org/..."
                value={url || doi}
                onChange={(e) => {
                  setUrl(e.target.value)
                  setDoi(e.target.value)
                }}
              />
            </div>

            <Button className="w-full" size="lg" onClick={handleGenerate} disabled={!authors.trim() || !title.trim()}>
              Generate Citation
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {results.length === 0 ? (
            <Card className="bg-muted/30">
              <CardContent className="p-12 text-center">
                <div className="text-4xl mb-4 opacity-30">"</div>
                <p className="text-muted-foreground">
                  Your citations will appear here. Fill in the details and click Generate.
                </p>
              </CardContent>
            </Card>
          ) : (
            results.map((r, i) => (
              <Card key={i} className="group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="uppercase text-xs">
                          {r.format}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {r.type}
                        </Badge>
                      </div>
                      <p className="text-sm leading-relaxed">{r.text}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleCopy(i, r.text)}
                    >
                      {copiedId === i ? "Copied!" : "Copy"}
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

function generateCitation(
  format: CitationFormat,
  type: CitationType,
  authors: string,
  title: string,
  publisher: string,
  year: string,
  url: string,
  doi: string
): string {
  const yr = year || "n.d."

  switch (format) {
    case "apa":
      if (type === "book") return `${authors} (${yr}). *${title}*. ${publisher}.`
      if (type === "journal") return `${authors} (${yr}). ${title}. *Journal Name*, *Volume*(Issue), Pages. ${doi}`
      if (type === "website") return `${authors} (${yr}). *${title}*. ${publisher}. ${url}`
      return `${authors} (${yr}). *${title}* [Video]. ${publisher}. ${url}`

    case "mla":
      if (type === "book") return `${authors}. *${title}*. ${publisher}, ${yr}.`
      if (type === "journal") return `${authors}. &quot;${title}.&quot; *Journal Name*, vol. Volume, no. Issue, ${yr}, pp. Pages.`
      if (type === "website") return `${authors}. &quot;${title}.&quot; *Website Name*, ${yr}, ${url}.`
      return `${authors}. &quot;${title}.&quot; *Platform*, ${yr}, ${url}.`

    case "chicago":
      if (type === "book") return `${authors}. *${title}*. ${publisher}, ${yr}.`
      if (type === "journal") return `${authors}. &quot;${title}.&quot; *Journal Name* Volume, no. Issue (${yr}): Pages.`
      if (type === "website") return `${authors}. &quot;${title}.&quot; ${publisher}. Accessed ${yr}. ${url}.`
      return `${authors}. &quot;${title}.&quot; ${type}. ${publisher}, ${yr}. ${url}.`

    case "harvard":
      if (type === "book") return `${authors} (${yr}) *${title}*. ${publisher}.`
      if (type === "journal") return `${authors} (${yr}) &apos;${title}&apos;, *Journal Name*, Volume(Issue), pp. Pages.`
      if (type === "website") return `${authors} (${yr}) *${title}*. Available at: ${url} (Accessed: ${new Date().toLocaleDateString()}).`
      return `${authors} (${yr}) *${title}*. Available at: ${url} (Accessed: ${new Date().toLocaleDateString()}).`
  }
}
