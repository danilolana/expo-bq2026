import type { Rect } from './game.types'

export function rectanglesOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width
    && a.x + a.width > b.x
    && a.y < b.y + b.height
    && a.y + a.height > b.y
}

export function circleIntersectsRect(
  circle: { x: number; y: number; radius: number },
  rect: Rect,
): boolean {
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width))
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height))
  const dx = circle.x - closestX
  const dy = circle.y - closestY
  return dx * dx + dy * dy <= circle.radius * circle.radius
}

