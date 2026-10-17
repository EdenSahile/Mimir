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
  // Pas de baseURL : le client tape la meme origine sur son chemin par defaut
  // /api/auth, ou le serveur monte deja le handler. En dev, le proxy de
  // vite.config.ts renvoie /api vers le port 3001 (voir DEC-012).
  it("creates the auth client without a baseURL so it stays same-origin", async () => {
    await import("@/lib/authClient")

    const [createAuthClientConfig] = createAuthClientMock.mock.calls[0] as unknown as [
      { baseURL?: string } | undefined,
    ]
    expect(createAuthClientConfig?.baseURL).toBeUndefined()
  })

  it("exposes useSession, signIn, signUp and signOut", async () => {
    const authClientModule = await import("@/lib/authClient")

    expect(authClientModule.useSession).toBeDefined()
    expect(authClientModule.signIn).toBeDefined()
    expect(authClientModule.signUp).toBeDefined()
    expect(authClientModule.signOut).toBeDefined()
  })
})
