import type { NextFunction, Request, Response } from "express"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { requireAuth } from "@/middlewares/requireAuth/requireAuth.js"
import { auth } from "@/config/auth.js"

vi.mock("@/config/auth.js", () => ({
  auth: { api: { getSession: vi.fn() } },
}))

const getSessionMock = vi.mocked(auth.api.getSession)

function createResponse() {
  const response = {
    status: vi.fn(),
    json: vi.fn(),
  } as unknown as Response
  vi.mocked(response.status).mockReturnValue(response)
  vi.mocked(response.json).mockReturnValue(response)
  return response
}

beforeEach(() => {
  getSessionMock.mockReset()
})

describe("requireAuth", () => {
  it("calls next when a session is present", async () => {
    const authenticatedSession = { user: { id: "user-1", email: "ada@mimir.app" } }
    getSessionMock.mockResolvedValue(authenticatedSession)
    const request = { headers: {} } as Request
    const response = createResponse()
    const next = vi.fn() as NextFunction

    await requireAuth(request, response, next)

    expect(next).toHaveBeenCalledOnce()
    expect(response.status).not.toHaveBeenCalled()
  })

  it("responds 401 and does not call next when no session is present", async () => {
    getSessionMock.mockResolvedValue(null)
    const request = { headers: {} } as Request
    const response = createResponse()
    const next = vi.fn() as NextFunction

    await requireAuth(request, response, next)

    expect(response.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })
})
