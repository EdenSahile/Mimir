import { Router } from "express"
import { healthRoutes } from "@/routes/healthRoutes.js"
import { meRoutes } from "@/routes/meRoutes.js"

export const routes = Router()

routes.use(healthRoutes)
routes.use(meRoutes)
