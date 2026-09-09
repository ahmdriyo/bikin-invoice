// SQLite lokal di browser via sql.js (WASM) + persist ke IndexedDB/localStorage
// File DB fisik: disimpan sebagai Uint8Array di IndexedDB "bikin-invoice-db" -> bisa export .db untuk opensource
import * as SqlJs from 'sql.js'
import type { Database } from 'sql.js'
// sql.js is CJS with module.exports.default = initSqlJs — handle both ESM/CJS
const initSqlJs = (SqlJs as any).default ?? (SqlJs as any)

const DB_NAME = 'bikin-invoice-sqlite'
const DB_KEY = 'db-binary'
const WASM_URL = '/sql-wasm.wasm'
const WASM_BROWSER_URL = '/sql-wasm-browser.wasm'

let db: Database | null = null
let SQL: any = null

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv')
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function idbGet(key: string): Promise<Uint8Array | null> {
  try {
    const idb = await openIndexedDB()
    return await new Promise((resolve, reject) => {
      const tx = idb.transaction('kv', 'readonly')
      const req = tx.objectStore('kv').get(key)
      req.onsuccess = () => resolve(req.result || null)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return null
  }
}

async function idbSet(key: string, val: Uint8Array) {
  const idb = await openIndexedDB()
  await new Promise<void>((resolve, reject) => {
    const tx = idb.transaction('kv', 'readwrite')
    tx.objectStore('kv').put(val, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

async function idbDelete(key: string) {
  const idb = await openIndexedDB()
  await new Promise<void>((resolve, reject) => {
    const tx = idb.transaction('kv', 'readwrite')
    tx.objectStore('kv').delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export const sqlite = {
  async init() {
    if (db) return db
    SQL = await (initSqlJs as any)({ locateFile: (file: string) => {
      if (file.endsWith('sql-wasm-browser.wasm')) return WASM_BROWSER_URL
      if (file.endsWith('.wasm')) return WASM_URL
      return file
    }})
    // Coba load dari IndexedDB dulu, fallback: fetch default .db dari public (seeder), lalu localStorage
    let binary: Uint8Array | null = await idbGet(DB_KEY)
    if (!binary) {
      // Coba fetch default seeder .db (untuk clone fresh — default data)
      try {
        const res = await fetch('/bikin-invoice.db')
        if (res.ok) {
          const buf = await res.arrayBuffer()
          if (buf.byteLength > 100) binary = new Uint8Array(buf)
        }
      } catch {}
    }
    if (!binary) {
      const ls = localStorage.getItem('bikin-invoice-sqlite-b64')
      if (ls) {
        try {
          const str = atob(ls)
          binary = new Uint8Array(str.length)
          for (let i=0;i<str.length;i++) binary[i]=str.charCodeAt(i)
        } catch {}
      }
    }
    if (binary && binary.length > 0) {
      try {
        db = new SQL.Database(binary)
      } catch {
        db = new SQL.Database()
      }
    } else {
      db = new SQL.Database()
    }
    ensureTables()
    return db
  },

  get() {
    if (!db) throw new Error('DB not initialized, call sqlite.init() first')
    return db
  },

  async persist() {
    if (!db) return
    const binary = db.export()
    await idbSet(DB_KEY, binary)
    // juga simpan ke localStorage sebagai backup kecil (optional)
    try {
      let str = ''
      for (let i=0;i<binary.length;i++) str += String.fromCharCode(binary[i])
      localStorage.setItem('bikin-invoice-sqlite-b64', btoa(str))
    } catch {}
  },

  async exportFile(filename = 'bikin-invoice.db') {
    if (!db) await this.init()
    const binary = db!.export()
    const blob = new Blob([binary as any], { type: 'application/x-sqlite3' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  },

  async importFile(file: File) {
    const buf = await file.arrayBuffer()
    const binary = new Uint8Array(buf)
    if (SQL) {
      db = new SQL.Database(binary)
    } else {
      SQL = await (initSqlJs as any)({ locateFile: (f: string) => {
        if (f.endsWith('sql-wasm-browser.wasm')) return WASM_BROWSER_URL
        if (f.endsWith('.wasm')) return WASM_URL
        return f
      }})
      db = new SQL.Database(binary)
    }
    ensureTables()
    await this.persist()
    return db
  },

  async reset() {
    if (!db) await this.init()
    db!.exec(`DROP TABLE IF EXISTS invoices; DROP TABLE IF EXISTS contracts; DROP TABLE IF EXISTS projects; DROP TABLE IF EXISTS clients; DROP TABLE IF EXISTS settings; DROP TABLE IF EXISTS counters;`)
    ensureTables()
    await idbDelete(DB_KEY)
    localStorage.removeItem('bikin-invoice-sqlite-b64')
    await this.persist()
  },

  async getStats(): Promise<{clients:number;projects:number;invoices:number;contracts:number}> {
    if (!db) await this.init()
    const d = db!
    const q = (sql: string): number => {
      const res = d.exec(sql)
      const val = res[0]?.values[0]?.[0]
      return typeof val === 'number' ? val : Number(val ?? 0)
    }
    return {
      clients: q('SELECT COUNT(*) FROM clients'),
      projects: q('SELECT COUNT(*) FROM projects'),
      invoices: q('SELECT COUNT(*) FROM invoices'),
      contracts: q('SELECT COUNT(*) FROM contracts'),
    }
  }
}

function ensureTables() {
  if (!db) return
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      npwp TEXT,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      client_id TEXT REFERENCES clients(id),
      title TEXT,
      category TEXT,
      description TEXT,
      price_estimate INTEGER,
      deadline TEXT,
      status TEXT,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      number TEXT UNIQUE,
      client_id TEXT,
      project_id TEXT,
      items TEXT, -- JSON
      subtotal INTEGER,
      discount_type TEXT,
      discount_value INTEGER,
      tax_mode TEXT,
      tax_value INTEGER,
      total INTEGER,
      termin TEXT,
      termin_details TEXT,
      payment_method TEXT,
      due_mode TEXT,
      due_date TEXT,
      issue_date TEXT,
      late_fee TEXT,
      extra_cost TEXT,
      notes TEXT,
      terms TEXT,
      template_id TEXT,
      status TEXT,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS contracts (
      id TEXT PRIMARY KEY,
      number TEXT UNIQUE,
      client_id TEXT,
      project_id TEXT,
      title TEXT,
      party1_name TEXT,
      party1_role TEXT,
      party2_name TEXT,
      party2_role TEXT,
      duration TEXT,
      revisi TEXT,
      warranty TEXT,
      materai INTEGER,
      sign_count INTEGER,
      witness_name TEXT,
      ip_rights TEXT,
      clauses TEXT, -- JSON
      template_id TEXT,
      status TEXT,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      data TEXT -- JSON
    );
    CREATE TABLE IF NOT EXISTS counters (
      year TEXT PRIMARY KEY,
      last_invoice_seq INTEGER,
      last_contract_seq INTEGER
    );
  `)
}

// Helper untuk query
export function exec(sql: string, params: any[] = []) {
  const d = sqlite.get()
  const stmt = d.prepare(sql)
  stmt.bind(params)
  const rows: any[] = []
  while (stmt.step()) rows.push(stmt.getAsObject())
  stmt.free()
  return rows
}

export function run(sql: string, params: any[] = []) {
  const d = sqlite.get()
  d.run(sql, params)
  // auto persist (debounced di caller jika perlu)
}

export async function runAndPersist(sql: string, params: any[] = []) {
  run(sql, params)
  await sqlite.persist()
}
