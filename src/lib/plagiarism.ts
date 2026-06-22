interface SearchResult {
  url: string
  title: string
  snippet: string
}

interface SourceMatch {
  url: string
  title: string
  similarity: number
  matchedText: string
}

function splitIntoSentences(text: string): string[] {
  return (text.match(/[^.!?]+[.!?]+/g) ?? [])
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 6)
}

function getSearchQueries(sentences: string[], max = 5): string[] {
  return sentences
    .sort((a, b) => b.split(/\s+/).length - a.split(/\s+/).length)
    .slice(0, max)
    .map((s) => s.replace(/[.!?"]/g, "").trim().slice(0, 200))
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 3)
  )
}

function jaccardSimilarity(text1: string, text2: string): number {
  const set1 = tokenize(text1)
  const set2 = tokenize(text2)
  if (set1.size === 0 || set2.size === 0) return 0
  let intersection = 0
  for (const word of set1) {
    if (set2.has(word)) intersection++
  }
  const union = set1.size + set2.size - intersection
  return union > 0 ? intersection / union : 0
}

async function searchWikipedia(query: string): Promise<SearchResult[]> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=3`
  const res = await fetch(url, {
    headers: { "User-Agent": "VeritasWrite/1.0 (contact@veritaswrite.com)" },
  })
  if (!res.ok) return []
  const data = (await res.json()) as {
    query?: { search?: { title: string; snippet: string; pageid: number }[] }
  }
  const results = data?.query?.search ?? []
  return results.map((r) => ({
    url: `https://en.wikipedia.org/?curid=${r.pageid}`,
    title: r.title,
    snippet: r.snippet.replace(/<[^>]+>/g, ""),
  }))
}

async function getWikipediaExtract(title: string): Promise<string> {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(title)}&format=json`
  const res = await fetch(url, {
    headers: { "User-Agent": "VeritasWrite/1.0 (contact@veritaswrite.com)" },
  })
  if (!res.ok) return ""
  const data = (await res.json()) as {
    query?: { pages?: Record<string, { extract?: string }> }
  }
  const pages = data?.query?.pages ?? {}
  const firstPage = Object.values(pages)[0]
  return firstPage?.extract ?? ""
}

async function searchCrossref(query: string): Promise<SearchResult[]> {
  const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=3`
  const res = await fetch(url, {
    headers: { "User-Agent": "VeritasWrite/1.0 (mailto:contact@veritaswrite.com)" },
  })
  if (!res.ok) return []
  const data = (await res.json()) as {
    message?: { items?: { title?: string[]; DOI?: string; abstract?: string; URL?: string }[] }
  }
  const items = data?.message?.items ?? []
  return items.map((item) => ({
    url: item.URL ?? `https://doi.org/${item.DOI}`,
    title: item.title?.[0] ?? "Untitled",
    snippet: (item.abstract ?? "").replace(/<[^>]+>/g, "").trim() || (item.title?.[0] ?? ""),
  }))
}

export async function checkPlagiarism(
  text: string
): Promise<{ overall: number; sources: SourceMatch[]; queriesRun: number }> {
  const sentences = splitIntoSentences(text)
  if (sentences.length === 0) {
    return { overall: 0, sources: [], queriesRun: 0 }
  }

  const queries = getSearchQueries(sentences)
  const sourceMap = new Map<string, SourceMatch>()

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i]

    // Search Wikipedia
    try {
      const wikiResults = await searchWikipedia(query)
      for (const result of wikiResults) {
        const extract = await getWikipediaExtract(result.title)
        if (!extract) continue
        const similarity = jaccardSimilarity(text, extract)
        if (similarity < 0.05) continue

        const existing = sourceMap.get(result.url)
        if (existing) {
          if (similarity > existing.similarity) {
            existing.similarity = similarity
            existing.matchedText = extract.slice(0, 300)
          }
        } else {
          sourceMap.set(result.url, {
            url: result.url,
            title: `Wikipedia: ${result.title}`,
            similarity,
            matchedText: extract.slice(0, 300),
          })
        }
      }
    } catch (err) {
      console.error(`Wikipedia search failed for query ${i}:`, err)
    }

    // Search Crossref (academic papers)
    try {
      const crossrefResults = await searchCrossref(query)
      for (const result of crossrefResults) {
        if (!result.snippet) continue
        const similarity = jaccardSimilarity(text, result.snippet)
        if (similarity < 0.05) continue

        const existing = sourceMap.get(result.url)
        if (existing) {
          if (similarity > existing.similarity) {
            existing.similarity = similarity
            existing.matchedText = result.snippet.slice(0, 300)
          }
        } else {
          sourceMap.set(result.url, {
            url: result.url,
            title: result.title,
            similarity,
            matchedText: result.snippet.slice(0, 300),
          })
        }
      }
    } catch (err) {
      console.error(`Crossref search failed for query ${i}:`, err)
    }
  }

  const sources = Array.from(sourceMap.values())
    .sort((a, b) => b.similarity - a.similarity)
    .map((s) => ({
      ...s,
      similarity: Math.round(s.similarity * 100),
    }))
    .filter((s) => s.similarity >= 10)
    .slice(0, 10)

  const overall =
    sources.length > 0
      ? Math.round(
          (sources.reduce((sum, s) => sum + s.similarity, 0) / sources.length) * 0.7
        )
      : 0

  return { overall: Math.min(overall, 100), sources, queriesRun: queries.length }
}
