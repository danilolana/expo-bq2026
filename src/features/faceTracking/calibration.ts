import type { FaceReading } from './faceTracking.types'

export const CALIBRATION_DURATION_MS = 1700
export const CALIBRATION_STABILITY_RANGE = 0.018

export function getStableNosePosition(
  readings: readonly FaceReading[],
  now: number,
  durationMs = CALIBRATION_DURATION_MS,
): number | null {
  const recent = readings.filter(
    (reading) => reading.faceDetected && now - reading.timestamp <= durationMs,
  )

  if (recent.length < 12) return null
  if (recent[0].timestamp > now - durationMs + 180) return null

  const values = recent.map((reading) => reading.noseY)
  if (Math.max(...values) - Math.min(...values) > CALIBRATION_STABILITY_RANGE) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

