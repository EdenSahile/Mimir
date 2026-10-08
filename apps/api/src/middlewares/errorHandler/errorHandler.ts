import type { NextFunction, Request, Response } from "express"

type HttpError = Error & { status?: number }

// 4 paramètres : c'est à l'arité qu'Express 5 reconnaît un middleware d'erreur.
export function errorHandler(err: HttpError, _req: Request, res: Response, _next: NextFunction) {
  const status = typeof err.status === "number" ? err.status : 500

  if (status >= 500) console.error(err)

  res.status(status).json({
    error: status >= 500 ? "Internal Server Error" : err.message,
  })
}
