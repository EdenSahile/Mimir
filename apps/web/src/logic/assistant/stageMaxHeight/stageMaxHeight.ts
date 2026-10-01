export function stageMaxHeight({
  viewportHeight,
  requestInProgress,
}: {
  viewportHeight: number
  requestInProgress: boolean
}): number {
  if (requestInProgress && viewportHeight < 640) return 120
  return 480
}
