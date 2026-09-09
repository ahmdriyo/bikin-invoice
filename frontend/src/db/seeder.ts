// Seeder runner — dipakai di browser (auto saat DB kosong) dan di Node (generate .db file)
import { sqlite } from './sqlite'
import { repo } from './repo'
import { defaultClients, defaultProjects, defaultInvoices, defaultContracts, defaultSettings, seederMeta } from './defaultSeeder'

export async function runDefaultSeeder(options?: { force?: boolean }) {
  await sqlite.init()
  const stats = await sqlite.getStats()
  const isEmpty = stats.clients === 0 && stats.invoices === 0 && stats.contracts === 0

  if (!isEmpty && !options?.force) {
    return { seeded: false, reason: 'DB sudah ada data real, skip seeder default', stats, meta: seederMeta }
  }

  if (options?.force) {
    await sqlite.reset()
  }

  // Insert berurutan biar FK aman (clients dulu, baru projects, baru invoices/contracts)
  for (const c of defaultClients) await repo.addClient(c)
  for (const p of defaultProjects) await repo.addProject(p)
  for (const inv of defaultInvoices) await repo.addInvoice(inv)
  for (const k of defaultContracts) await repo.addContract(k)
  await repo.saveSettings(defaultSettings)

  const newStats = await sqlite.getStats()
  return { seeded: true, stats: newStats, meta: seederMeta }
}

export async function clearAndSeedEmpty() {
  await sqlite.reset()
  await repo.saveSettings({
    businessName: 'Arka Studio',
    address: 'Jl. Teknologi No. 9, Jakarta Selatan 12190',
    phone: '+6281234567899',
    email: 'hello@arkastudio.id',
    bankName: 'BCA',
    bankAccount: '1234567890',
    bankHolder: 'Arka Studio',
    defaultTerms: 'Pembayaran via Transfer BCA. DP 50% sebelum pengerjaan, pelunasan sebelum serah terima.',
    defaultNotes: 'Terima kasih atas kepercayaan Anda.',
  })
  return sqlite.getStats()
}

export async function reseedForce() {
  return runDefaultSeeder({ force: true })
}
