import { Router } from "express"
import { getMe } from "@/controllers/meController.js"
import { requireAuth } from "@/middlewares/requireAuth/requireAuth.js"

export const meRoutes = Router()

meRoutes.get("/api/me", requireAuth, getMe)
