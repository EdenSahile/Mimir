import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Link, MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"
import { AppRoutes } from "@/App"

function renderAtRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>
  )
}

const routes = [
  { path: "/", name: "Home" },
  { path: "/welcome", name: "Welcome" },
  { path: "/mimir", name: "Mimir" },
  { path: "/day", name: "Day" },
  { path: "/projects", name: "Projects" },
  { path: "/projects/123", name: "Project" },
  { path: "/news", name: "News" },
  { path: "/jobs", name: "Jobs" },
  { path: "/memory", name: "Memory" },
  { path: "/documents", name: "Documents" },
  { path: "/settings/general", name: "Settings" },
]

describe("Routing", () => {
  describe("route definitions", () => {
    it.each(routes)(
      "renders the $name page at $path",
      ({ path, name }) => {
        renderAtRoute(path)

        expect(
          screen.getByRole("heading", { name })
        ).toBeInTheDocument()
      }
    )
  })

  describe("navigation", () => {
    it("switches displayed page when navigating to another route", async () => {
      const user = userEvent.setup()

      render(
        <MemoryRouter initialEntries={["/mimir"]}>
          <AppRoutes />
          <Link to="/day">Go to Day</Link>
        </MemoryRouter>
      )
      expect(
        screen.getByRole("heading", { name: "Mimir" })
      ).toBeInTheDocument()

      await user.click(screen.getByRole("link", { name: "Go to Day" }))

      expect(
        screen.getByRole("heading", { name: "Day" })
      ).toBeInTheDocument()
      expect(
        screen.queryByRole("heading", { name: "Mimir" })
      ).not.toBeInTheDocument()
    })

    it("navigates to a route with a dynamic parameter", async () => {
      const user = userEvent.setup()

      render(
        <MemoryRouter initialEntries={["/projects"]}>
          <AppRoutes />
          <Link to="/projects/456">Go to Project</Link>
        </MemoryRouter>
      )
      expect(
        screen.getByRole("heading", { name: "Projects" })
      ).toBeInTheDocument()

      await user.click(screen.getByRole("link", { name: "Go to Project" }))

      expect(
        screen.getByRole("heading", { name: "Project" })
      ).toBeInTheDocument()
      expect(
        screen.queryByRole("heading", { name: "Projects" })
      ).not.toBeInTheDocument()
    })
  })
})
