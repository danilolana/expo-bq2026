export function applyDeadZone(value: number, deadZone: number): number {
  if (Math.abs(value) <= deadZone) return 0
  return value > 0 ? value - deadZone : value + deadZone
}

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}

export function exponentialSmooth(current: number, target: number, smoothing: number): number {
  return current + (target - current) * clamp(smoothing, 0, 1)
}

export function normalizedNoseToGameY(
  noseY: number,
  neutralNoseY: number,
  gameHeight: number,
): number {
  const relative = applyDeadZone(noseY - neutralNoseY, 0.012)
  const normalized = clamp(relative / 0.16, -1, 1)
  return clamp(gameHeight / 2 + normalized * gameHeight * 0.38, 58, gameHeight - 58)
}

