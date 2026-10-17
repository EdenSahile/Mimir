import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { resolveUrl } from "@/config/env/env.js"

const originalEnv = { ...process.env }

beforeEach(() => {
  vi.resetModules()
})

afterEach(() => {
  process.env = { ...originalEnv }
})

describe("resolveUrl", () => {
  it("returns the provided value when the variable is set", () => {
    process.env.NODE_ENV = "production"

    expect(resolveUrl("FRONTEND_URL", "https://mimir.app", "http://localhost:5173")).toBe("https://mimir.app")
  })

  it("falls back to the default outside production when the variable is missing", () => {
    process.env.NODE_ENV = "development"

    expect(resolveUrl("FRONTEND_URL", undefined, "http://localhost:5173")).toBe("http://localhost:5173")
  })

  it("throws in production when the variable is missing", () => {
    process.env.NODE_ENV = "production"

    expect(() => resolveUrl("FRONTEND_URL", undefined, "http://localhost:5173")).toThrow(/FRONTEND_URL/)
  })
})

describe("frontendUrl and betterAuthUrl in production", () => {
  it("uses the fixed variables rather than the deployment URL", async () => {
    process.env.NODE_ENV = "production"
    process.env.VERCEL_ENV = "production"
    process.env.VERCEL_URL = "mimir-abc123.vercel.app"
    process.env.FRONTEND_URL = "https://mimir.app"
    process.env.BETTER_AUTH_URL = "https://mimir.app"

    const env = await import("@/config/env/env.js")

    expect(env.frontendUrl).toBe("https://mimir.app")
    expect(env.betterAuthUrl).toBe("https://mimir.app")
  })

  it("throws when a fixed variable is missing", async () => {
    process.env.NODE_ENV = "production"
    process.env.VERCEL_ENV = "production"
    delete process.env.FRONTEND_URL
    delete process.env.BETTER_AUTH_URL

    await expect(import("@/config/env/env.js")).rejects.toThrow(/FRONTEND_URL/)
  })
})

describe("frontendUrl and betterAuthUrl in preview", () => {
  it("derives both from VERCEL_URL, which carries no protocol", async () => {
    process.env.NODE_ENV = "production"
    process.env.VERCEL_ENV = "preview"
    process.env.VERCEL_URL = "mimir-abc123.vercel.app"

    const env = await import("@/config/env/env.js")

    expect(env.frontendUrl).toBe("https://mimir-abc123.vercel.app")
    expect(env.betterAuthUrl).toBe("https://mimir-abc123.vercel.app")
  })

  it("ignores the fixed production variables", async () => {
    process.env.NODE_ENV = "production"
    process.env.VERCEL_ENV = "preview"
    process.env.VERCEL_URL = "mimir-abc123.vercel.app"
    process.env.FRONTEND_URL = "https://mimir.app"
    process.env.BETTER_AUTH_URL = "https://mimir.app"

    const env = await import("@/config/env/env.js")

    expect(env.frontendUrl).toBe("https://mimir-abc123.vercel.app")
  })

  it("throws when VERCEL_URL is missing instead of falling back to localhost", async () => {
    process.env.NODE_ENV = "production"
    process.env.VERCEL_ENV = "preview"
    delete process.env.VERCEL_URL

    await expect(import("@/config/env/env.js")).rejects.toThrow(/VERCEL_URL/)
  })
})

describe("frontendUrl and betterAuthUrl in development", () => {
  it("falls back to the local ports", async () => {
    process.env.NODE_ENV = "development"
    delete process.env.VERCEL_ENV
    delete process.env.VERCEL_URL
    delete process.env.FRONTEND_URL
    delete process.env.BETTER_AUTH_URL
    delete process.env.PORT

    const env = await import("@/config/env/env.js")

    expect(env.frontendUrl).toBe("http://localhost:5173")
    expect(env.betterAuthUrl).toBe("http://localhost:3001")
  })
})
