// Wrapper ke seeder.ts — seeder SQLite (bukan dummy)
// Semua data dari src/db/defaultSeeder.ts → SQLite (IndexedDB)
import { runDefaultSeeder, clearAndSeedEmpty as clearReal, reseedForce } from './seeder'
import { sqlite } from './sqlite'

export async function seedIfEmpty() {
  return runDefaultSeeder()
}

export async function clearAllAndSeedRealEmpty() {
  return clearReal()
}

// Alias seeder — preferred name baru, dummy alias tetap untuk compat
export async function seedDummyAgain() {
  return reseedForce()
}
export async function seedSeederAgain() {
  return reseedForce()
}
export async function reseedSeederForce() {
  return reseedForce()
}

// Deprecated alias, tapi tetap ada biar tidak breaking
export async function getStats() {
  await sqlite.init()
  return sqlite.getStats()
}
