import { afterEach, describe, expect, it } from "vitest"
import { resolveUrl } from "@/config/env/env.js"

const originalNodeEnv = process.env.NODE_ENV

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv
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
