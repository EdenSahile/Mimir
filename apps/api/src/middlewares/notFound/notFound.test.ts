import type { Request, Response } from "express"
import { describe, expect, it, vi } from "vitest"
import { notFound } from "@/middlewares/notFound/notFound.js"

function createResponse() {
  const response = {
    status: vi.fn(),
    json: vi.fn(),
  } as unknown as Response
  vi.mocked(response.status).mockReturnValue(response)
  vi.mocked(response.json).mockReturnValue(response)
  return response
}

describe("notFound", () => {
  it("responds 404 with a not-found error", () => {
    const response = createResponse()

    notFound({} as Request, response)

    expect(response.status).toHaveBeenCalledWith(404)
    expect(response.json).toHaveBeenCalledWith({ error: "Not Found" })
  })
})
