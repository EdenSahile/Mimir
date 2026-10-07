import { Router } from "express"
import { getMe } from "@/controllers/meController.js"
import { requireAuth } from "@/middlewares/requireAuth/requireAuth.js"

export const meRoutes = Router()

// GET sans body : requireAuth garde la route, pas de validateBody (aucun body reçu).
meRoutes.get("/api/me", requireAuth, getMe)
