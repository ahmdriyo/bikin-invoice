import { sqlite, exec, runAndPersist } from './sqlite'
import type { SqlValue } from 'sql.js'
import type { Client, Project, Invoice, Contract, Settings } from '@/types'

// Helper untuk cast SqlValue ke string
function asString(v: SqlValue | undefined): string {
  if (v === null || v === undefined) return ''
  return String(v)
}
function asNumber(v: SqlValue | undefined): number {
  if (typeof v === 'number') return v
  const n = Number(v)
  return isNaN(n) ? 0 : n
}
function asOptionalString(v: SqlValue | undefined): string | undefined {
  if (v === null || v === undefined) return undefined
  const s = String(v)
  return s || undefined
}

export const repo = {
  // Clients
  async getClients(): Promise<Client[]> {
    await sqlite.init()
    const rows = exec('SELECT * FROM clients ORDER BY created_at DESC')
    return rows.map(r => ({
      id: asString(r.id),
      name: asString(r.name),
      company: asString(r.company),
      email: asString(r.email),
      phone: asString(r.phone),
      address: asString(r.address),
      npwp: asOptionalString(r.npwp),
      createdAt: asString(r.created_at),
    }))
  },
  async addClient(c: Client): Promise<void> {
    await runAndPersist('INSERT INTO clients (id,name,company,email,phone,address,npwp,created_at) VALUES (?,?,?,?,?,?,?,?)',
      [c.id, c.name, c.company, c.email, c.phone, c.address, c.npwp ?? null, c.createdAt])
  },
  async updateClient(id: string, patch: Partial<Client>): Promise<void> {
    const fields: string[] = []
    const vals: SqlValue[] = []
    const map: Record<string,string> = { name:'name', company:'company', email:'email', phone:'phone', address:'address', npwp:'npwp', createdAt:'created_at' }
    for (const [k,v] of Object.entries(patch)) {
      const col = map[k]
      if (col) { fields.push(`${col}=?`); vals.push(v as SqlValue) }
    }
    if (!fields.length) return
    vals.push(id)
    await runAndPersist(`UPDATE clients SET ${fields.join(', ')} WHERE id=?`, vals)
  },
  async deleteClient(id: string): Promise<void> {
    await runAndPersist('DELETE FROM clients WHERE id=?', [id])
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    await sqlite.init()
    const rows = exec('SELECT * FROM projects ORDER BY created_at DESC')
    return rows.map(r => ({
      id: asString(r.id),
      clientId: asString(r.client_id),
      title: asString(r.title),
      category: asString(r.category) as Project['category'],
      description: asString(r.description),
      priceEstimate: asNumber(r.price_estimate),
      deadline: asOptionalString(r.deadline),
      status: asString(r.status) as Project['status'],
      createdAt: asString(r.created_at),
    }))
  },
  async addProject(p: Project): Promise<void> {
    await runAndPersist('INSERT INTO projects (id,client_id,title,category,description,price_estimate,deadline,status,created_at) VALUES (?,?,?,?,?,?,?,?,?)',
      [p.id, p.clientId, p.title, p.category, p.description, p.priceEstimate, p.deadline ?? null, p.status, p.createdAt])
  },
  async updateProject(id: string, patch: Partial<Project>): Promise<void> {
    const map: Record<string,string> = { clientId:'client_id', title:'title', category:'category', description:'description', priceEstimate:'price_estimate', deadline:'deadline', status:'status', createdAt:'created_at' }
    const fields: string[] = []
    const vals: SqlValue[] = []
    for (const [k,v] of Object.entries(patch)) {
      const col = map[k]; if (col) { fields.push(`${col}=?`); vals.push(v as SqlValue) }
    }
    if (!fields.length) return
    vals.push(id)
    await runAndPersist(`UPDATE projects SET ${fields.join(', ')} WHERE id=?`, vals)
  },
  async deleteProject(id: string): Promise<void> {
    await runAndPersist('DELETE FROM projects WHERE id=?', [id])
  },

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    await sqlite.init()
    const rows = exec('SELECT * FROM invoices ORDER BY created_at DESC')
    return rows.map(r => {
      // Derive DP/Pelunasan terpisah dari termin lama jika belum ada
      let dp = r.termin_dp as string | undefined
      let pel = r.termin_pelunasan as string | undefined
      if (!dp || !pel) {
        const t = asString(r.termin)
        if (t === '50/50') { dp = '50'; pel = '50' }
        else if (t === '25/75') { dp = '25'; pel = '75' }
        else if (t === '30/40/30') { dp = '30'; pel = '30' }
        else if (t === '100') { dp = '100'; pel = '100' }
        else if (t === '4x') { dp = '25'; pel = '25' }
        else { dp = dp ?? '50'; pel = pel ?? '50' }
      }
      // Normalisasi status lama ke Indonesia
      let st = asString(r.status)
      if (st === 'planned' || st === 'in_progress') st = 'proses'
      if (st === 'done') st = 'selesai'
      const itemsRaw = r.items as string | null
      const terminDetailsRaw = r.termin_details as string | null
      return {
        id: asString(r.id),
        number: asString(r.number),
        clientId: asString(r.client_id),
        projectId: asOptionalString(r.project_id),
        items: itemsRaw ? JSON.parse(itemsRaw) as Invoice['items'] : [],
        subtotal: asNumber(r.subtotal),
        discountType: asString(r.discount_type) as Invoice['discountType'],
        discountValue: asNumber(r.discount_value),
        taxMode: asString(r.tax_mode) as Invoice['taxMode'],
        taxValue: asNumber(r.tax_value),
        total: asNumber(r.total),
        termin: asString(r.termin) as Invoice['termin'],
        terminDP: dp as Invoice['terminDP'],
        terminPelunasan: pel as Invoice['terminPelunasan'],
        terminDPCustom: r.termin_dp_custom !== null && r.termin_dp_custom !== undefined ? asNumber(r.termin_dp_custom) : undefined,
        terminPelunasanCustom: r.termin_pelunasan_custom !== null && r.termin_pelunasan_custom !== undefined ? asNumber(r.termin_pelunasan_custom) : undefined,
        terminDetails: terminDetailsRaw ? JSON.parse(terminDetailsRaw) as Invoice['terminDetails'] : undefined,
        paymentMethod: asString(r.payment_method) as Invoice['paymentMethod'],
        dueMode: asString(r.due_mode) as Invoice['dueMode'],
        dueDate: asString(r.due_date),
        issueDate: asString(r.issue_date),
        lateFee: asString(r.late_fee) as Invoice['lateFee'],
        extraCost: asString(r.extra_cost) as Invoice['extraCost'],
        notes: asString(r.notes),
        terms: asString(r.terms),
        templateId: asString(r.template_id) as Invoice['templateId'],
        status: st as Invoice['status'],
        kind: (asOptionalString(r.invoice_kind) as Invoice['kind']) ?? 'dp',
        createdAt: asString(r.created_at),
      }
    })
  },
  async addInvoice(inv: Invoice): Promise<void> {
    // Derive termin gabungan untuk compat lama
    const termin = inv.termin || (inv.terminDP && inv.terminPelunasan ? `${inv.terminDP}/${inv.terminPelunasan}` : '50/50')
    const kind = (inv as { kind?: string; invoiceKind?: string }).kind ?? (inv as { invoiceKind?: string }).invoiceKind ?? 'dp'
    await runAndPersist(`INSERT INTO invoices (id,number,client_id,project_id,items,subtotal,discount_type,discount_value,tax_mode,tax_value,total,termin,termin_dp,termin_pelunasan,termin_dp_custom,termin_pelunasan_custom,termin_details,payment_method,due_mode,due_date,issue_date,late_fee,extra_cost,notes,terms,template_id,status,invoice_kind,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [inv.id, inv.number, inv.clientId, inv.projectId ?? null, JSON.stringify(inv.items), inv.subtotal, inv.discountType, inv.discountValue, inv.taxMode, inv.taxValue, inv.total, termin, inv.terminDP ?? '50', inv.terminPelunasan ?? '50', inv.terminDPCustom ?? null, inv.terminPelunasanCustom ?? null, inv.terminDetails ? JSON.stringify(inv.terminDetails) : null, inv.paymentMethod, inv.dueMode, inv.dueDate, inv.issueDate, inv.lateFee, inv.extraCost, inv.notes, inv.terms, inv.templateId, inv.status, kind, inv.createdAt])
  },
  async updateInvoice(id: string, patch: Partial<Invoice & { invoiceKind?: string }>): Promise<void> {
    const map: Record<string,string> = { number:'number', clientId:'client_id', projectId:'project_id', items:'items', subtotal:'subtotal', discountType:'discount_type', discountValue:'discount_value', taxMode:'tax_mode', taxValue:'tax_value', total:'total', termin:'termin', terminDP:'termin_dp', terminPelunasan:'termin_pelunasan', terminDPCustom:'termin_dp_custom', terminPelunasanCustom:'termin_pelunasan_custom', terminDetails:'termin_details', paymentMethod:'payment_method', dueMode:'due_mode', dueDate:'due_date', issueDate:'issue_date', lateFee:'late_fee', extraCost:'extra_cost', notes:'notes', terms:'terms', templateId:'template_id', status:'status', kind:'invoice_kind', invoiceKind:'invoice_kind', createdAt:'created_at' }
    const fields:string[]=[]; const vals:SqlValue[]=[]
    for (const [k,v] of Object.entries(patch)) {
      const col=map[k]; if(!col) continue
      let val: SqlValue = v as SqlValue
      if (k==='items' || k==='terminDetails') val = JSON.stringify(v) as SqlValue
      fields.push(`${col}=?`); vals.push(val)
    }
    if(!fields.length) return
    vals.push(id)
    await runAndPersist(`UPDATE invoices SET ${fields.join(', ')} WHERE id=?`, vals)
  },
  async deleteInvoice(id: string): Promise<void> {
    await runAndPersist('DELETE FROM invoices WHERE id=?', [id])
  },

  // Contracts
  async getContracts(): Promise<Contract[]> {
    await sqlite.init()
    const rows = exec('SELECT * FROM contracts ORDER BY created_at DESC')
    return rows.map(r => ({
      id: asString(r.id),
      number: asString(r.number),
      clientId: asString(r.client_id),
      projectId: asOptionalString(r.project_id),
      title: asString(r.title),
      party1Name: asString(r.party1_name),
      party1Role: asString(r.party1_role),
      party2Name: asString(r.party2_name),
      party2Role: asString(r.party2_role),
      duration: asString(r.duration) as Contract['duration'],
      revisi: asString(r.revisi) as Contract['revisi'],
      warranty: asString(r.warranty) as Contract['warranty'],
      materai: Boolean(r.materai),
      signCount: asNumber(r.sign_count) as Contract['signCount'],
      witnessName: asOptionalString(r.witness_name),
      ipRights: asString(r.ip_rights) as Contract['ipRights'],
      clauses: r.clauses ? JSON.parse(String(r.clauses)) as Contract['clauses'] : [],
      templateId: asString(r.template_id) as Contract['templateId'],
      status: asString(r.status) as Contract['status'],
      createdAt: asString(r.created_at),
    }))
  },
  async addContract(c: Contract): Promise<void> {
    await runAndPersist(`INSERT INTO contracts (id,number,client_id,project_id,title,party1_name,party1_role,party2_name,party2_role,duration,revisi,warranty,materai,sign_count,witness_name,ip_rights,clauses,template_id,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [c.id, c.number, c.clientId, c.projectId ?? null, c.title, c.party1Name, c.party1Role, c.party2Name, c.party2Role, c.duration, c.revisi, c.warranty, c.materai?1:0, c.signCount, c.witnessName ?? null, c.ipRights, JSON.stringify(c.clauses), c.templateId, c.status, c.createdAt])
  },
  async updateContract(id: string, patch: Partial<Contract>): Promise<void> {
    const map: Record<string,string> = { number:'number', clientId:'client_id', projectId:'project_id', title:'title', party1Name:'party1_name', party1Role:'party1_role', party2Name:'party2_name', party2Role:'party2_role', duration:'duration', revisi:'revisi', warranty:'warranty', materai:'materai', signCount:'sign_count', witnessName:'witness_name', ipRights:'ip_rights', clauses:'clauses', templateId:'template_id', status:'status', createdAt:'created_at' }
    const fields:string[]=[]; const vals:SqlValue[]=[]
    for (const [k,v] of Object.entries(patch)) {
      const col=map[k]; if(!col) continue
      let val: SqlValue = v as SqlValue
      if (k==='clauses') val=JSON.stringify(v) as SqlValue
      if (k==='materai') val=(v?1:0) as SqlValue
      fields.push(`${col}=?`); vals.push(val)
    }
    if(!fields.length) return
    vals.push(id)
    await runAndPersist(`UPDATE contracts SET ${fields.join(', ')} WHERE id=?`, vals)
  },
  async deleteContract(id: string): Promise<void> {
    await runAndPersist('DELETE FROM contracts WHERE id=?', [id])
  },

  // Settings
  async getSettings(): Promise<Settings | null> {
    await sqlite.init()
    const rows = exec('SELECT data FROM settings WHERE id=?', ['default'])
    if (!rows.length) return null
    const raw = rows[0].data
    return JSON.parse(String(raw)) as Settings
  },
  async saveSettings(s: Settings): Promise<void> {
    await sqlite.init()
    const existing = await this.getSettings()
    if (existing) {
      await runAndPersist('UPDATE settings SET data=? WHERE id=?', [JSON.stringify(s), 'default'])
    } else {
      await runAndPersist('INSERT INTO settings (id,data) VALUES (?,?)', ['default', JSON.stringify(s)])
    }
  },
}
