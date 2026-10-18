import { build } from "esbuild"
import apiPkg from "./package.json" with { type: "json" }
import dbPkg from "../../packages/db/package.json" with { type: "json" }
import sharedPkg from "../../packages/shared/package.json" with { type: "json" }

// Les paquets @mimir/* exposent du TypeScript brut et doivent donc etre inlines.
// Tout le reste reste externe. Les 3 package.json sont agreges parce que les
// dependances de @mimir/db (@prisma/client, @prisma/adapter-neon) entrent dans
// le graphe du bundle des lors que @mimir/db est inline : batir la liste sur le
// seul package.json de l'api ferait tenter a esbuild de bundler Prisma.
const externalPackages = [apiPkg, dbPkg, sharedPkg]
  .flatMap((pkg) => Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }))
  .filter((name) => !name.startsWith("@mimir/"))

await build({
  entryPoints: ["src/index.ts"],
  // .mjs et non .js : le format ESM tient alors a l'extension, et ne depend plus
  // du package.json le plus proche dans le paquet de fonction (voir vercel.entry.mjs).
  outfile: "dist/index.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node24",
  external: [...new Set(externalPackages)],
})
