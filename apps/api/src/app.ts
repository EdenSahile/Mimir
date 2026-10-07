import cors from "cors"
import express from "express"
import { toNodeHandler } from "better-auth/node"
import { auth } from "@/config/auth.js"
import { routes } from "@/routes/index.js"

export const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    credentials: true,
  }),
)

// Cas particulier assumé : le handler Better Auth sert /api/auth/* directement,
// sans passer par routes→controllers→services. Monté avant express.json() car
// Better Auth lit le corps brut de la requête (voir docs/decisions.md).
app.all("/api/auth/*splat", toNodeHandler(auth))

app.use(express.json())
app.use(routes)
