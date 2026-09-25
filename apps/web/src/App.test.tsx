import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { App } from "@/App"

describe("App", () => {
  it("renders AppBackground", () => {
    render(<App />)

    const background = screen.getByTestId("app-background")

    expect(background).toBeInTheDocument()
  })
})
