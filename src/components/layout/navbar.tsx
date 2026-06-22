"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/plagiarism", label: "Plagiarism" },
  { href: "/citations", label: "Citations" },
  { href: "/pricing", label: "Pricing" },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">VW</span>
          </div>
          <span className="font-bold text-lg">Veritas Write</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === l.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted hover:text-foreground text-sm font-medium h-7 gap-1.5 px-2.5 transition-all"
          >
            Check My Writing
          </Link>
          <Link
            href="/pricing"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 text-sm font-medium h-7 gap-1.5 px-2.5 transition-all"
          >
            Get Started
          </Link>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="md:hidden">
            <Button variant="ghost" size="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] sm:w-[350px]">
            <div className="flex flex-col gap-4 mt-8">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary py-2",
                    pathname === l.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {l.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                <Link
                  href="/dashboard"
                  className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted hover:text-foreground text-sm font-medium h-9 gap-1.5 px-2.5 w-full transition-all"
                >
                  Check My Writing
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 text-sm font-medium h-9 gap-1.5 px-2.5 w-full transition-all"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
