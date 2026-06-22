"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DetectionResult, HumanizeOptions } from "@/types"

type Tab = "detect" | "humanize" | "results"

export default function DashboardPage() {
  const { data: session } = useSession()
  const [text, setText] = useState("")
  const [activeTab, setActiveTab] = useState<Tab>("detect")
  const [detecting, setDetecting] = useState(false)
  const [humanizing, setHumanizing] = useState(false)
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [humanizeOpts, setHumanizeOpts] = useState<HumanizeOptions>({
    intensity: "moderate",
    tone: "academic",
  })
  const [humanized, setHumanized] = useState("")
  const [error, setError] = useState("")

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const usage = session?.user
    ? { used: session.user.wordsUsed, limit: session.user.wordsLimit }
    : null
  const usagePercent = usage && usage.limit > 0 ? Math.round((usage.used / usage.limit) * 100) : 0

  const handleDetect = async () => {
    if (!text.trim()) return
    setDetecting(true)
    setError("")

    try {
      const res = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Detection failed")
      }
      const data = await res.json()
      setResult(data)
      setActiveTab("results")
    } catch (e) {
      setError((e as Error).message)
    }
    setDetecting(false)
  }

  const handleHumanize = async () => {
    if (!text.trim()) return
    setHumanizing(true)
    setError("")

    try {
      const res = await fetch("/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, intensity: humanizeOpts.intensity, tone: humanizeOpts.tone }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Humanization failed")
      }
      const data = await res.json()
      setHumanized(data.rewritten)
      if (data.metrics?.originalScore) {
        setResult({
          overall: { score: data.metrics.originalScore, verdict: "ai", confidence: data.metrics.originalScore },
          detectors: [],
          highlights: [],
        })
      }
      setActiveTab("results")
    } catch (e) {
      setError((e as Error).message)
    }
    setHumanizing(false)
  }

  const getScoreColor = (score: number) => {
    if (score < 30) return "text-emerald-500"
    if (score < 60) return "text-amber-500"
    return "text-red-500"
  }

  const getVerdictBadge = (verdict: string) => {
    if (verdict === "human") return <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">Human</Badge>
    if (verdict === "ai") return <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">AI</Badge>
    return <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">Uncertain</Badge>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Writing Dashboard</h1>
          <p className="text-muted-foreground">Paste your text below to analyze and improve it.</p>
        </div>
        {usage && usage.limit > 0 && (
          <div className="text-right">
            <p className="text-sm font-medium">{usage.used.toLocaleString()} / {usage.limit.toLocaleString()} words used</p>
            <div className="w-32 h-2 bg-muted rounded-full mt-1 ml-auto">
              <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(usagePercent, 100)}%` }} />
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Your Text</CardTitle>
                <span className="text-sm text-muted-foreground">{wordCount.toLocaleString()} words</span>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste your essay, article, or content here..."
                className="min-h-[300px] resize-y text-sm leading-relaxed"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Humanization Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Intensity</span>
                  <span className="text-muted-foreground capitalize">{humanizeOpts.intensity}</span>
                </div>
                <Slider
                  value={[["minimal", "light", "moderate", "heavy", "max"].indexOf(humanizeOpts.intensity)]}
                  onValueChange={(value) => {
                    const v = Array.isArray(value) ? value[0] : value
                    setHumanizeOpts({
                      ...humanizeOpts,
                      intensity: ["minimal", "light", "moderate", "heavy", "max"][v] as HumanizeOptions["intensity"],
                    })
                  }}
                  max={4}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Minimal</span>
                  <span>Light</span>
                  <span>Moderate</span>
                  <span>Heavy</span>
                  <span>Max</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium">Tone</span>
                <Select
                  value={humanizeOpts.tone}
                  onValueChange={(v) => setHumanizeOpts({ ...humanizeOpts, tone: v as HumanizeOptions["tone"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="conversational">Conversational</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="narrative">Narrative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={handleDetect}
                disabled={!text.trim() || detecting}
              >
                {detecting ? "Scanning..." : "Run AI Detection"}
              </Button>
              <Button
                className="w-full"
                variant="secondary"
                size="lg"
                onClick={handleHumanize}
                disabled={!text.trim() || humanizing}
              >
                {humanizing ? "Humanizing..." : "Humanize Text"}
              </Button>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Separator />
              <a href="/plagiarism" className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted hover:text-foreground text-sm font-medium h-9 gap-1.5 px-2.5 w-full transition-all">Check Plagiarism</a>
              <a href="/citations" className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted hover:text-foreground text-sm font-medium h-9 gap-1.5 px-2.5 w-full transition-all">Generate Citations</a>
            </CardContent>
          </Card>

          {result && (
            <Card className="border-emerald-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  Detection Results
                  {result.overall.verdict === "ai" ? (
                    <Badge className="bg-red-100 text-red-700 border-red-200">AI Detected</Badge>
                  ) : (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Human Written</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.detectors.map((d) => (
                  <div key={d.name} className="flex items-center justify-between py-1">
                    <span className="text-sm font-medium">{d.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${getScoreColor(d.score)}`}>
                        {d.score}%
                      </span>
                      {getVerdictBadge(d.verdict)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {humanized && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Humanized Text</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{humanized}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
