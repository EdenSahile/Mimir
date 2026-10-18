// Passerelle versionnee : Vercel resout l'entrypoint d'un service AVANT le build,
// contre le contenu du depot, or dist/index.js est un artefact de build. Ce fichier
// existe donc dans le depot pour satisfaire la validation, et ne charge le bundle
// qu'a l'execution, une fois produit (voir DEC-012).
import "./dist/index.js"
