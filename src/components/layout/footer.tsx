import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">VW</span>
              </div>
              <span className="font-bold">Veritas Write</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              The honest AI writing integrity platform. Detect, humanize, verify, and cite — all in one place.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Product</h3>
            <div className="flex flex-col gap-2">
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">Dashboard</Link>
              <Link href="/plagiarism" className="text-sm text-muted-foreground hover:text-primary transition-colors">Plagiarism Check</Link>
              <Link href="/citations" className="text-sm text-muted-foreground hover:text-primary transition-colors">Citations</Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Company</h3>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">About</span>
              <span className="text-sm text-muted-foreground">Blog</span>
              <span className="text-sm text-muted-foreground">Privacy</span>
              <span className="text-sm text-muted-foreground">Terms</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Compare</h3>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">vs Lunchbreak AI</span>
              <span className="text-sm text-muted-foreground">vs Undetectable AI</span>
              <span className="text-sm text-muted-foreground">vs QuillBot</span>
              <span className="text-sm text-muted-foreground">vs GPTZero</span>
            </div>
          </div>
        </div>

        <div className="border-t mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Veritas Write. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with honesty. No fake guarantees. No sketchy billing.
          </p>
        </div>
      </div>
    </footer>
  )
}
