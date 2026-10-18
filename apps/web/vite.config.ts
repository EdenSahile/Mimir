import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tailwindcss(), react(), tsconfigPaths()],
  server: {
    port: 5173,
    // Echouer si 5173 est pris, au lieu de glisser sur un autre port. Depuis le
    // passage en same-origin, le navigateur appelle sa propre origine : un port
    // different ne correspondrait plus a trustedOrigins et casserait l'auth
    // sans message clair (voir DEC-012).
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
})
