import { create } from 'zustand'
import type { Client, Project, Invoice, Contract, Settings } from '@/types'
import { repo } from '@/db/repo'
import { sqlite } from '@/db/sqlite'
import { dummySettings } from '@/data/dummy'

type AppState = {
  ready: boolean
  clients: Client[]
  projects: Project[]
  invoices: Invoice[]
  contracts: Contract[]
  settings: Settings
  loadAll: () => Promise<void>
  addClient: (c: Client) => Promise<void>
  updateClient: (id: string, c: Partial<Client>) => Promise<void>
  deleteClient: (id: string) => Promise<void>
  addProject: (p: Project) => Promise<void>
  updateProject: (id: string, p: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  addInvoice: (inv: Invoice) => Promise<void>
  updateInvoice: (id: string, inv: Partial<Invoice>) => Promise<void>
  deleteInvoice: (id: string) => Promise<void>
  addContract: (k: Contract) => Promise<void>
  updateContract: (id: string, k: Partial<Contract>) => Promise<void>
  deleteContract: (id: string) => Promise<void>
  updateSettings: (s: Partial<Settings>) => Promise<void>
  resetDummy: () => Promise<void>
  exportDB: () => Promise<void>
  importDB: (file: File) => Promise<void>
  clearRealData: () => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  clients: [],
  projects: [],
  invoices: [],
  contracts: [],
  settings: dummySettings,

  loadAll: async () => {
    await sqlite.init()
    const [clients, projects, invoices, contracts, settings] = await Promise.all([
      repo.getClients(),
      repo.getProjects(),
      repo.getInvoices(),
      repo.getContracts(),
      repo.getSettings(),
    ])
    set({
      clients,
      projects,
      invoices,
      contracts,
      settings: settings || dummySettings,
      ready: true,
    })
  },

  addClient: async (c) => {
    await repo.addClient(c)
    set((s) => ({ clients: [c, ...s.clients] }))
  },
  updateClient: async (id, c) => {
    await repo.updateClient(id, c)
    set((s) => ({ clients: s.clients.map(x => x.id === id ? { ...x, ...c } : x) }))
  },
  deleteClient: async (id) => {
    await repo.deleteClient(id)
    set((s) => ({ clients: s.clients.filter(x => x.id !== id) }))
  },

  addProject: async (p) => {
    await repo.addProject(p)
    set((s) => ({ projects: [p, ...s.projects] }))
  },
  updateProject: async (id, p) => {
    await repo.updateProject(id, p)
    set((s) => ({ projects: s.projects.map(x => x.id === id ? { ...x, ...p } : x) }))
  },
  deleteProject: async (id) => {
    await repo.deleteProject(id)
    set((s) => ({ projects: s.projects.filter(x => x.id !== id) }))
  },

  addInvoice: async (inv) => {
    await repo.addInvoice(inv)
    set((s) => ({ invoices: [inv, ...s.invoices] }))
  },
  updateInvoice: async (id, inv) => {
    await repo.updateInvoice(id, inv)
    set((s) => ({ invoices: s.invoices.map(x => x.id === id ? { ...x, ...inv } : x) }))
  },
  deleteInvoice: async (id) => {
    await repo.deleteInvoice(id)
    set((s) => ({ invoices: s.invoices.filter(x => x.id !== id) }))
  },

  addContract: async (k) => {
    await repo.addContract(k)
    set((s) => ({ contracts: [k, ...s.contracts] }))
  },
  updateContract: async (id, k) => {
    await repo.updateContract(id, k)
    set((s) => ({ contracts: s.contracts.map(x => x.id === id ? { ...x, ...k } : x) }))
  },
  deleteContract: async (id) => {
    await repo.deleteContract(id)
    set((s) => ({ contracts: s.contracts.filter(x => x.id !== id) }))
  },

  updateSettings: async (s2) => {
    const next = { ...get().settings, ...s2 }
    await repo.saveSettings(next)
    set({ settings: next })
  },

  resetDummy: async () => {
    const { seedDummyAgain } = await import('@/db/seed')
    await seedDummyAgain()
    await get().loadAll()
  },

  exportDB: async () => {
    await sqlite.exportFile(`bikin-invoice-${new Date().toISOString().slice(0,10)}.db`)
  },

  importDB: async (file: File) => {
    await sqlite.importFile(file)
    await get().loadAll()
  },

  clearRealData: async () => {
    const { clearAllAndSeedRealEmpty } = await import('@/db/seed')
    await clearAllAndSeedRealEmpty()
    await get().loadAll()
  },
}))
