import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function getAuthUser() {
  const session = await auth()
  if (!session?.user?.id) return null
  return session.user
}

export async function checkWordLimit(userId: string, inputWords: number, outputWords: number = 0) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { wordsUsed: true, wordsLimit: true, plan: true },
  })
  if (!user) return { allowed: false, reason: "User not found" } as const

  const cost = inputWords + outputWords
  if (user.wordsLimit === -1) return { allowed: true, remaining: Infinity, plan: user.plan } as const

  const remaining = user.wordsLimit - user.wordsUsed
  if (remaining < cost) {
    return { allowed: false, reason: "Word limit exceeded", remaining, plan: user.plan } as const
  }
  return { allowed: true, remaining: remaining - cost, plan: user.plan } as const
}

export async function consumeWords(userId: string, inputWords: number, outputWords: number = 0) {
  await prisma.user.update({
    where: { id: userId },
    data: { wordsUsed: { increment: inputWords + outputWords } },
  })
}
