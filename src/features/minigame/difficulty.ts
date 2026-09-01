export interface Difficulty {
  speed: number
  gapHeight: number
  spawnInterval: number
}

export function getDifficulty(elapsedSeconds: number): Difficulty {
  if (elapsedSeconds < 10) return { speed: 172, gapHeight: 220, spawnInterval: 2.4 }
  if (elapsedSeconds < 20) return { speed: 195, gapHeight: 202, spawnInterval: 2.22 }
  return { speed: 216, gapHeight: 188, spawnInterval: 2.08 }
}

