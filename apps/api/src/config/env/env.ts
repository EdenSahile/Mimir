export function resolveUrl(name: string, value: string | undefined, fallback: string): string {
  if (value) return value
  if (process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable ${name} in production`)
  }
  return fallback
}

export const frontendUrl = resolveUrl("FRONTEND_URL", process.env.FRONTEND_URL, "http://localhost:5173")
export const betterAuthUrl = resolveUrl(
  "BETTER_AUTH_URL",
  process.env.BETTER_AUTH_URL,
  `http://localhost:${process.env.PORT ?? 3001}`,
)
