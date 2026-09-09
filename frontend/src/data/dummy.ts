// @deprecated — JANGAN impor dari file ini untuk kode baru.
// File ini hanya untuk backward compat. Sumber tunggal sekarang: src/db/defaultSeeder.ts
// Semua data runtime diambil dari SQLite (seeder → IndexedDB), bukan dummy in-memory.
// Re-export agar import lama `from '@/data/dummy'` tetap jalan tapi tidak jadi source of truth.
export {
  defaultClients as dummyClients,
  defaultProjects as dummyProjects,
  defaultInvoices as dummyInvoices,
  defaultContracts as dummyContracts,
  defaultSettings as dummySettings,
  templateConfigs,
  seederClausesMock as dummyClausesMock,
  seederClausesMock,
} from '@/db/defaultSeeder'
export { seederMeta as dummyMeta } from '@/db/defaultSeeder'
