// Backward compat — wrapper ke seeder.ts (default seeder)
import { runDefaultSeeder, clearAndSeedEmpty as clearReal, reseedForce } from './seeder'
import { sqlite } from './sqlite'

export async function seedIfEmpty() {
  return runDefaultSeeder()
}

export async function clearAllAndSeedRealEmpty() {
  return clearReal()
}

export async function seedDummyAgain() {
  return reseedForce()
}

// Deprecated alias, tapi tetap ada biar tidak breaking
export async function getStats() {
  await sqlite.init()
  return sqlite.getStats()
}
