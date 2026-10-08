import { beforeEach, describe, expect, it, vi } from "vitest"

const { createAuthClientMock } = vi.hoisted(() => ({
  createAuthClientMock: vi.fn(() => ({
    useSession: vi.fn(),
    signIn: { email: vi.fn() },
    signUp: { email: vi.fn() },
    signOut: vi.fn(),
  })),
}))

vi.mock("better-auth/react", () => ({
  createAuthClient: createAuthClientMock,
}))

beforeEach(() => {
  vi.resetModules()
  createAuthClientMock.mockClear()
})

describe("authClient", () => {
  it("creates the auth client with a configured baseURL", async () => {
    await import("@/lib/authClient")

    const [createAuthClientConfig] = createAuthClientMock.mock.calls[0] as unknown as [
      { baseURL: string },
    ]
    expect(typeof createAuthClientConfig.baseURL).toBe("string")
    expect(createAuthClientConfig.baseURL.length).toBeGreaterThan(0)
  })

  it("exposes useSession, signIn, signUp and signOut", async () => {
    const authClientModule = await import("@/lib/authClient")

    expect(authClientModule.useSession).toBeDefined()
    expect(authClientModule.signIn).toBeDefined()
    expect(authClientModule.signUp).toBeDefined()
    expect(authClientModule.signOut).toBeDefined()
  })
})
