import { Router } from "express"
import { healthRoutes } from "@/routes/healthRoutes.js"
import { meRoutes } from "@/routes/meRoutes.js"

// Routeur principal : monte les groupes de routes. La validation (validateBody)
// se déclare dans chaque groupe, sur les routes qui reçoivent un body.
export const routes = Router()

routes.use(healthRoutes)
routes.use(meRoutes)
