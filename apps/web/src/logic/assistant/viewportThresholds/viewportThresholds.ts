export function shouldShowGreeting(viewportHeight: number): boolean {
  return viewportHeight >= 700
}

export function shouldShowRequestLabel(viewportHeight: number): boolean {
  return viewportHeight >= 640
}
