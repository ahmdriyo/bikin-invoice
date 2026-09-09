// Default Seeder — data awal yang otomatis terisi saat clone / DB kosong
// Sumber: dummy.ts tapi dipoles jadi "realistic default" untuk opensource demo
// Semua data bisa dihapus via Settings → Mulai Data Real (Kosong) lalu isi data beneran
import type { Client, Project, Invoice, Contract, Settings } from '@/types'
import { dummyClients, dummyProjects, dummyInvoices, dummyContracts, dummySettings } from '@/data/dummy'

// Re-export dummy sebagai default seed — biar single source of truth
export const defaultClients: Client[] = dummyClients
export const defaultProjects: Project[] = dummyProjects
export const defaultInvoices: Invoice[] = dummyInvoices
export const defaultContracts: Contract[] = dummyContracts
export const defaultSettings: Settings = dummySettings

// Metadata seeder untuk UI / logging
export const seederMeta = {
  version: 1,
  name: 'Bikin Invoice Default Seeder',
  description: '10 clients, 8 projects, 12 invoices, 6 kontrak + settings Arka Studio',
  createdAt: '2026-09-08',
  isDefault: true,
}

// Helper untuk generate nomor berurutan (dipakai seeder tambahan jika mau)
export function nextInvoiceNumber(seq: number, year = 2026) {
  return `INV-${year}-${String(seq).padStart(4, '0')}`
}
export function nextContractNumber(seq: number, year = 2026) {
  return `SPK-${year}-${String(seq).padStart(4, '0')}`
}
