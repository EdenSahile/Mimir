import { Router } from "express"
import { getHealth } from "@/controllers/healthController.js"

export const healthRoutes = Router()

// GET sans body : validateBody ne concerne que les routes qui reçoivent un body.
healthRoutes.get("/health", getHealth)
