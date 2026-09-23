import express from "express"

const app = express()
const port = process.env.PORT || 3001

app.use(express.json())

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "mimir-api" })
})

app.listen(port, () => {
  console.log(`Mímir API running on port ${port}`)
})
