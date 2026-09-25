import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import AppBackground from "@/components/ui/AppBackground/AppBackground"

describe("AppBackground", () => {
  it("renders a fixed-position container", () => {
    render(<AppBackground />)

    const background = screen.getByTestId("app-background")

    expect(background).toBeInTheDocument()
    expect(background).toHaveClass("fixed")
  })

  it("covers the full viewport", () => {
    render(<AppBackground />)

    const background = screen.getByTestId("app-background")

    expect(background).toHaveClass("inset-0")
  })

  it("renders exactly 46 stars", () => {
    render(<AppBackground />)

    const stars = screen.getAllByTestId("star")

    expect(stars).toHaveLength(46)
  })

  it("applies scintillation animation to stars via CSS class", () => {
    render(<AppBackground />)

    const stars = screen.getAllByTestId("star")

    stars.forEach((star) => {
      expect(star).toHaveClass("star")
    })
  })

  it("renders stars with varying animation durations between 6s and 12s", () => {
    render(<AppBackground />)

    const stars = screen.getAllByTestId("star")

    stars.forEach((star) => {
      const duration = parseFloat(star.style.getPropertyValue("--dur"))
      expect(duration).toBeGreaterThanOrEqual(6)
      expect(duration).toBeLessThanOrEqual(12)
    })
  })

  it("renders the gradient layer", () => {
    render(<AppBackground />)

    const gradient = screen.getByTestId("bg-gradient")

    expect(gradient).toBeInTheDocument()
  })

  it("renders the grid layer", () => {
    render(<AppBackground />)

    const grid = screen.getByTestId("bg-grid")

    expect(grid).toBeInTheDocument()
  })
})
