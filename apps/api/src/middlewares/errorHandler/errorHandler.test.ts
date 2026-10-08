import type { NextFunction, Request, Response } from "express"
import { describe, expect, it, vi } from "vitest"
import { errorHandler } from "@/middlewares/errorHandler/errorHandler.js"

function createResponse() {
  const response = {
    status: vi.fn(),
    json: vi.fn(),
  } as unknown as Response
  vi.mocked(response.status).mockReturnValue(response)
  vi.mocked(response.json).mockReturnValue(response)
  return response
}

describe("errorHandler", () => {
  it("responds 500 with a generic message for an error without status", () => {
    const unexpectedError = new Error("database exploded")
    const response = createResponse()
    vi.spyOn(console, "error").mockImplementation(() => {})

    errorHandler(unexpectedError, {} as Request, response, vi.fn() as NextFunction)

    expect(response.status).toHaveBeenCalledWith(500)
    expect(response.json).toHaveBeenCalledWith({ error: "Internal Server Error" })
  })

  it("responds with the error status and message for a client error", () => {
    const badRequest = Object.assign(new Error("email is required"), { status: 400 })
    const response = createResponse()

    errorHandler(badRequest, {} as Request, response, vi.fn() as NextFunction)

    expect(response.status).toHaveBeenCalledWith(400)
    expect(response.json).toHaveBeenCalledWith({ error: "email is required" })
  })
})
