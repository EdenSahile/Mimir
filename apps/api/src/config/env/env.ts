export function resolveUrl(name: string, value: string | undefined, fallback: string): string {
  if (value) return value
  if (process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable ${name} in production`)
  }
  return fallback
}

// VERCEL_URL porte l'URL generee propre au deploiement, sans le protocole, et
// n'est donc utilisee qu'en preview : en production elle vaudrait le *.vercel.app
// au lieu du domaine personnalise, ce qui enverrait cookies et origines de
// confiance sur le mauvais hote (voir DEC-012).
function resolvePreviewUrl(): string | undefined {
  if (process.env.VERCEL_ENV !== "preview") return undefined
  const host = process.env.VERCEL_URL
  if (!host) {
    throw new Error("Missing required environment variable VERCEL_URL in preview")
  }
  return `https://${host}`
}

const previewUrl = resolvePreviewUrl()

export const frontendUrl =
  previewUrl ?? resolveUrl("FRONTEND_URL", process.env.FRONTEND_URL, "http://localhost:5173")
export const betterAuthUrl =
  previewUrl ??
  resolveUrl("BETTER_AUTH_URL", process.env.BETTER_AUTH_URL, `http://localhost:${process.env.PORT ?? 3001}`)
