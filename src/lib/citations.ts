export type CitationFormat = "apa" | "mla" | "chicago" | "harvard"
export type WorkType = "book" | "journal" | "website"

export interface Work {
  id: string
  type: WorkType
  title: string
  authors: string[]
  year?: string
  publisher?: string
  journal?: string
  volume?: string
  issue?: string
  pages?: string
  doi?: string
  url?: string
  isbn?: string
  abstract?: string
}

interface CrossrefAuthor {
  given?: string
  family?: string
}

interface CrossrefItem {
  DOI?: string
  title?: string[]
  author?: CrossrefAuthor[]
  "container-title"?: string[]
  published?: { "date-parts"?: number[][] }
  volume?: string
  issue?: string
  page?: string
  publisher?: string
  type?: string
  URL?: string
  abstract?: string
  ISBN?: string[]
}

interface OpenLibraryDoc {
  key: string
  title: string
  author_name?: string[]
  first_publish_year?: number
  publisher?: string[]
  isbn?: string[]
  cover_i?: number
}

function formatAuthors(authors: string[]): string {
  if (authors.length === 0) return "Unknown"
  if (authors.length === 1) return authors[0]
  if (authors.length === 2) return `${authors[0]} & ${authors[1]}`
  return `${authors[0]} et al.`
}

function formatAuthorsMLA(authors: string[]): string {
  if (authors.length === 0) return "Unknown"
  if (authors.length === 1) return authors[0]
  if (authors.length === 2) return `${authors[0]}, and ${authors[1]}`
  return `${authors[0]}, et al.`
}

function parseCrossrefAuthors(authors: CrossrefAuthor[] | undefined): string[] {
  if (!authors || authors.length === 0) return []
  return authors.slice(0, 6).map((a) => {
    if (a.family && a.given) return `${a.family}, ${a.given[0]}.`
    return a.family || a.given || "Unknown"
  })
}

function parseCrossrefDate(dateParts: number[][] | undefined): string | undefined {
  if (!dateParts || !dateParts[0] || dateParts[0].length === 0) return undefined
  const [year, month, day] = dateParts[0]
  if (!year) return undefined
  if (month && day) return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  if (month) return `${year}-${String(month).padStart(2, "0")}`
  return String(year)
}

function getYear(dateStr: string | undefined): string {
  if (!dateStr) return "n.d."
  const match = dateStr.match(/^(\d{4})/)
  return match ? match[1] : "n.d."
}

export async function searchCrossrefWorks(query: string, rows = 8): Promise<Work[]> {
  const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${rows}&select=DOI,title,author,container-title,published,volume,issue,page,publisher,type,URL,abstract,ISBN`
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "VeritasWrite/1.0 (mailto:contact@veritaswrite.com)" },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return []
    const data = (await res.json()) as { message?: { items?: CrossrefItem[] } }
    const items = data?.message?.items ?? []
    return items.map((item) => {
      const type: WorkType = item.type === "book" || item.type === "book-chapter" || item.type === "monograph"
        ? "book"
        : "journal"
      return {
        id: item.DOI ?? `crossref-${Math.random().toString(36).slice(2)}`,
        type,
        title: item.title?.[0] ?? "Untitled",
        authors: parseCrossrefAuthors(item.author),
        year: parseCrossrefDate(item.published?.["date-parts"]),
        publisher: item.publisher,
        journal: item["container-title"]?.[0],
        volume: item.volume,
        issue: item.issue,
        pages: item.page,
        doi: item.DOI,
        url: item.URL ?? (item.DOI ? `https://doi.org/${item.DOI}` : undefined),
        isbn: item.ISBN?.[0],
        abstract: item.abstract ? item.abstract.replace(/<[^>]+>/g, "").trim() : undefined,
      }
    })
  } catch {
    return []
  }
}

export async function searchOpenLibrary(query: string, rows = 8): Promise<Work[]> {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${rows}&fields=key,title,author_name,first_publish_year,publisher,isbn,cover_i`
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "VeritasWrite/1.0 (contact@veritaswrite.com)" },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return []
    const data = (await res.json()) as { docs?: OpenLibraryDoc[] }
    const docs = data?.docs ?? []
    return docs.map((doc) => ({
      id: doc.key,
      type: "book" as WorkType,
      title: doc.title,
      authors: (doc.author_name ?? []).slice(0, 6),
      year: doc.first_publish_year ? String(doc.first_publish_year) : undefined,
      publisher: doc.publisher?.[0],
      isbn: doc.isbn?.[0],
      url: doc.key ? `https://openlibrary.org${doc.key}` : undefined,
    }))
  } catch {
    return []
  }
}

export async function searchWorks(query: string, type: WorkType | "all" = "all"): Promise<Work[]> {
  if (type === "book") {
    return searchOpenLibrary(query)
  }
  if (type === "journal") {
    return searchCrossrefWorks(query)
  }
  const [books, journals] = await Promise.all([
    searchOpenLibrary(query, 5),
    searchCrossrefWorks(query, 5),
  ])
  return [...books, ...journals]
}

export function formatCitation(work: Work, format: CitationFormat): string {
  const year = getYear(work.year)
  const authors = work.authors
  const title = work.title

  switch (format) {
    case "apa": {
      const authorStr = formatAuthors(authors)
      if (work.type === "journal") {
        let cite = `${authorStr} (${year}). ${title}.`
        if (work.journal) cite += ` *${work.journal}*`
        if (work.volume) {
          cite += `, *${work.volume}*`
          if (work.issue) cite += `(${work.issue})`
        }
        if (work.pages) cite += `, ${work.pages}`
        if (work.doi) cite += `. https://doi.org/${work.doi}`
        return cite
      }
      if (work.type === "book") {
        let cite = `${authorStr} (${year}). *${title}*.`
        if (work.publisher) cite += ` ${work.publisher}.`
        if (work.doi) cite += ` https://doi.org/${work.doi}`
        else if (work.url) cite += ` ${work.url}`
        return cite
      }
      return `${authorStr} (${year}). *${title}*. ${work.url ?? ""}`.trim()
    }

    case "mla": {
      const authorStr = formatAuthorsMLA(authors)
      if (work.type === "journal") {
        let cite = `${authorStr}. "${title}."`
        if (work.journal) cite += ` *${work.journal}*`
        if (work.volume) cite += `, vol. ${work.volume}`
        if (work.issue) cite += `, no. ${work.issue}`
        cite += `, ${year}`
        if (work.pages) cite += `, pp. ${work.pages}`
        if (work.doi) cite += `. https://doi.org/${work.doi}`
        return cite + "."
      }
      if (work.type === "book") {
        let cite = `${authorStr}. *${title}*.`
        if (work.publisher) cite += ` ${work.publisher}`
        if (year !== "n.d.") cite += `, ${year}`
        return cite + "."
      }
      return `${authorStr}. "${title}." ${work.url ?? ""}.`.trim()
    }

    case "chicago": {
      const authorStr = formatAuthors(authors)
      if (work.type === "journal") {
        let cite = `${authorStr}. "${title}."`
        if (work.journal) cite += ` *${work.journal}*`
        if (work.volume) cite += ` ${work.volume}`
        if (work.issue) cite += `, no. ${work.issue}`
        cite += ` (${year})`
        if (work.pages) cite += `: ${work.pages}`
        if (work.doi) cite += `. https://doi.org/${work.doi}`
        return cite + "."
      }
      if (work.type === "book") {
        let cite = `${authorStr}. *${title}*.`
        if (work.publisher) cite += ` ${work.publisher}`
        if (year !== "n.d.") cite += `, ${year}`
        return cite + "."
      }
      return `${authorStr}. "${title}." Accessed ${new Date().toISOString().slice(0, 10)}. ${work.url ?? ""}.`
    }

    case "harvard": {
      const authorStr = formatAuthors(authors)
      if (work.type === "journal") {
        let cite = `${authorStr} ${year}, '${title}',`
        if (work.journal) cite += ` *${work.journal}*`
        if (work.volume) {
          cite += `, vol. ${work.volume}`
          if (work.issue) cite += `, no. ${work.issue}`
        }
        if (work.pages) cite += `, pp. ${work.pages}`
        if (work.doi) cite += `. Available at: https://doi.org/${work.doi}`
        return cite + "."
      }
      if (work.type === "book") {
        let cite = `${authorStr} ${year}, *${title}*.`
        if (work.publisher) cite += ` ${work.publisher}`
        return cite
      }
      return `${authorStr} ${year}, *${title}*. Available at: ${work.url ?? ""} (Accessed: ${new Date().toISOString().slice(0, 10)}).`
    }
  }
}
