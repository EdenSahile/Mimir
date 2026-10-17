import cors from "cors"
import express from "express"
import { toNodeHandler } from "better-auth/node"
import { auth } from "@/config/auth.js"
import { frontendUrl } from "@/config/env/env.js"
import { errorHandler } from "@/middlewares/errorHandler/errorHandler.js"
import { notFound } from "@/middlewares/notFound/notFound.js"
import { routes } from "@/routes/index.js"

export const app = express()

// Express annonce sa presence dans x-powered-by par defaut. Ca ne sert qu'a
// renseigner un attaquant sur la stack a cibler.
app.disable("x-powered-by")

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  }),
)

// Cas particulier assumé : le handler Better Auth sert /api/auth/* directement,
// sans passer par routes→controllers→services. Monté avant express.json() car
// Better Auth lit le corps brut de la requête (voir docs/decisions.md).
app.all("/api/auth/*splat", toNodeHandler(auth))

app.use(express.json())
app.use(routes)
app.use(notFound)
app.use(errorHandler)
