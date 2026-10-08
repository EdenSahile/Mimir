import { createAuthClient } from "better-auth/react"

const apiBaseURL = import.meta.env.VITE_API_URL ?? "http://localhost:3001"

export const authClient = createAuthClient({ baseURL: apiBaseURL })

export const { useSession, signIn, signUp, signOut } = authClient
