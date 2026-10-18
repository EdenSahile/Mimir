// Passerelle versionnee : Vercel resout l'entrypoint d'un service AVANT le build,
// contre le contenu du depot, or dist/index.mjs est un artefact de build. Ce fichier
// existe donc dans le depot pour satisfaire la validation, et ne charge le bundle
// qu'a l'execution, une fois produit (voir DEC-012).
//
// L'extension .mjs, ici et sur le bundle, n'est pas cosmetique : Node decide du
// format d'un .js d'apres le package.json le PLUS PROCHE, et le paquet de fonction
// produit par Vercel n'en contient pas toujours un. Le 2026-10-18, un paquet sans
// package.json a fait charger le bundle ESM comme du CommonJS, avec
// "SyntaxError: Cannot use import statement outside a module" a l'invocation.
// Un .mjs est ESM par extension, donc independant de l'empaquetage.
import "./dist/index.mjs"
