import request from "supertest"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/config/auth.js", () => ({
  auth: {
    api: { getSession: vi.fn() },
    handler: vi.fn(),
  },
}))

import { app } from "@/app.js"
import { auth } from "@/config/auth.js"

const getSessionMock = vi.mocked(auth.api.getSession)

beforeEach(() => {
  getSessionMock.mockReset()
})

describe("public routes", () => {
  it("responds 200 on /health without authentication", async () => {
    const healthResponse = await request(app).get("/health")

    expect(healthResponse.status).toBe(200)
  })

  it("does not read the session for the public /health route", async () => {
    await request(app).get("/health")

    expect(getSessionMock).not.toHaveBeenCalled()
  })
})

describe("protected route /api/me", () => {
  it("responds 401 when no session is present", async () => {
    getSessionMock.mockResolvedValue(null)

    const meResponse = await request(app).get("/api/me")

    expect(meResponse.status).toBe(401)
  })

  it("responds 200 with the authenticated user when a session is present", async () => {
    getSessionMock.mockResolvedValue({ user: { id: "user-1", email: "ada@mimir.app" } })

    const meResponse = await request(app).get("/api/me")

    expect(meResponse.status).toBe(200)
    expect(meResponse.body.user.email).toBe("ada@mimir.app")
  })
})
