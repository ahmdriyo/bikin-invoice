import { sqlite, exec, runAndPersist } from './sqlite'
import type { Client, Project, Invoice, Contract, Settings } from '@/types'

export const repo = {
  // Clients
  async getClients(): Promise<Client[]> {
    await sqlite.init()
    const rows = exec('SELECT * FROM clients ORDER BY created_at DESC')
    return rows.map(r => ({
      id: r.id, name: r.name, company: r.company, email: r.email, phone: r.phone, address: r.address, npwp: r.npwp, createdAt: r.created_at
    }))
  },
  async addClient(c: Client) {
    await runAndPersist('INSERT INTO clients (id,name,company,email,phone,address,npwp,created_at) VALUES (?,?,?,?,?,?,?,?)',
      [c.id, c.name, c.company, c.email, c.phone, c.address, c.npwp || null, c.createdAt])
  },
  async updateClient(id: string, patch: Partial<Client>) {
    const fields: string[] = []
    const vals: any[] = []
    const map: Record<string,string> = { name:'name', company:'company', email:'email', phone:'phone', address:'address', npwp:'npwp', createdAt:'created_at' }
    for (const [k,v] of Object.entries(patch)) {
      const col = map[k]
      if (col) { fields.push(`${col}=?`); vals.push(v) }
    }
    if (!fields.length) return
    vals.push(id)
    await runAndPersist(`UPDATE clients SET ${fields.join(', ')} WHERE id=?`, vals)
  },
  async deleteClient(id: string) {
    await runAndPersist('DELETE FROM clients WHERE id=?', [id])
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    await sqlite.init()
    const rows = exec('SELECT * FROM projects ORDER BY created_at DESC')
    return rows.map(r => ({
      id: r.id, clientId: r.client_id, title: r.title, category: r.category, description: r.description, priceEstimate: r.price_estimate, deadline: r.deadline, status: r.status, createdAt: r.created_at
    }))
  },
  async addProject(p: Project) {
    await runAndPersist('INSERT INTO projects (id,client_id,title,category,description,price_estimate,deadline,status,created_at) VALUES (?,?,?,?,?,?,?,?,?)',
      [p.id, p.clientId, p.title, p.category, p.description, p.priceEstimate, p.deadline || null, p.status, p.createdAt])
  },
  async updateProject(id: string, patch: Partial<Project>) {
    const map: Record<string,string> = { clientId:'client_id', title:'title', category:'category', description:'description', priceEstimate:'price_estimate', deadline:'deadline', status:'status', createdAt:'created_at' }
    const fields: string[] = []
    const vals: any[] = []
    for (const [k,v] of Object.entries(patch)) {
      const col = map[k]; if (col) { fields.push(`${col}=?`); vals.push(v) }
    }
    if (!fields.length) return
    vals.push(id)
    await runAndPersist(`UPDATE projects SET ${fields.join(', ')} WHERE id=?`, vals)
  },
  async deleteProject(id: string) {
    await runAndPersist('DELETE FROM projects WHERE id=?', [id])
  },

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    await sqlite.init()
    const rows = exec('SELECT * FROM invoices ORDER BY created_at DESC')
    return rows.map(r => ({
      id: r.id, number: r.number, clientId: r.client_id, projectId: r.project_id,
      items: r.items ? JSON.parse(r.items) : [],
      subtotal: r.subtotal, discountType: r.discount_type, discountValue: r.discount_value,
      taxMode: r.tax_mode, taxValue: r.tax_value, total: r.total,
      termin: r.termin, terminDetails: r.termin_details ? JSON.parse(r.termin_details) : undefined,
      paymentMethod: r.payment_method, dueMode: r.due_mode, dueDate: r.due_date, issueDate: r.issue_date,
      lateFee: r.late_fee, extraCost: r.extra_cost, notes: r.notes, terms: r.terms, templateId: r.template_id, status: r.status, createdAt: r.created_at
    }))
  },
  async addInvoice(inv: Invoice) {
    await runAndPersist(`INSERT INTO invoices (id,number,client_id,project_id,items,subtotal,discount_type,discount_value,tax_mode,tax_value,total,termin,termin_details,payment_method,due_mode,due_date,issue_date,late_fee,extra_cost,notes,terms,template_id,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [inv.id, inv.number, inv.clientId, inv.projectId || null, JSON.stringify(inv.items), inv.subtotal, inv.discountType, inv.discountValue, inv.taxMode, inv.taxValue, inv.total, inv.termin, inv.terminDetails ? JSON.stringify(inv.terminDetails) : null, inv.paymentMethod, inv.dueMode, inv.dueDate, inv.issueDate, inv.lateFee, inv.extraCost, inv.notes, inv.terms, inv.templateId, inv.status, inv.createdAt])
  },
  async updateInvoice(id: string, patch: Partial<Invoice>) {
    const map: Record<string,string> = { number:'number', clientId:'client_id', projectId:'project_id', items:'items', subtotal:'subtotal', discountType:'discount_type', discountValue:'discount_value', taxMode:'tax_mode', taxValue:'tax_value', total:'total', termin:'termin', terminDetails:'termin_details', paymentMethod:'payment_method', dueMode:'due_mode', dueDate:'due_date', issueDate:'issue_date', lateFee:'late_fee', extraCost:'extra_cost', notes:'notes', terms:'terms', templateId:'template_id', status:'status', createdAt:'created_at' }
    const fields:string[]=[]; const vals:any[]=[]
    for (const [k,v] of Object.entries(patch)) {
      const col=map[k]; if(!col) continue
      let val=v
      if (k==='items' || k==='terminDetails') val = JSON.stringify(v)
      fields.push(`${col}=?`); vals.push(val)
    }
    if(!fields.length) return
    vals.push(id)
    await runAndPersist(`UPDATE invoices SET ${fields.join(', ')} WHERE id=?`, vals)
  },
  async deleteInvoice(id: string) {
    await runAndPersist('DELETE FROM invoices WHERE id=?', [id])
  },

  // Contracts
  async getContracts(): Promise<Contract[]> {
    await sqlite.init()
    const rows = exec('SELECT * FROM contracts ORDER BY created_at DESC')
    return rows.map(r => ({
      id: r.id, number: r.number, clientId: r.client_id, projectId: r.project_id, title: r.title,
      party1Name: r.party1_name, party1Role: r.party1_role, party2Name: r.party2_name, party2Role: r.party2_role,
      duration: r.duration, revisi: r.revisi, warranty: r.warranty, materai: !!r.materai, signCount: r.sign_count, witnessName: r.witness_name,
      ipRights: r.ip_rights, clauses: r.clauses ? JSON.parse(r.clauses) : [], templateId: r.template_id, status: r.status, createdAt: r.created_at
    }))
  },
  async addContract(c: Contract) {
    await runAndPersist(`INSERT INTO contracts (id,number,client_id,project_id,title,party1_name,party1_role,party2_name,party2_role,duration,revisi,warranty,materai,sign_count,witness_name,ip_rights,clauses,template_id,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [c.id, c.number, c.clientId, c.projectId || null, c.title, c.party1Name, c.party1Role, c.party2Name, c.party2Role, c.duration, c.revisi, c.warranty, c.materai?1:0, c.signCount, c.witnessName || null, c.ipRights, JSON.stringify(c.clauses), c.templateId, c.status, c.createdAt])
  },
  async updateContract(id: string, patch: Partial<Contract>) {
    const map: Record<string,string> = { number:'number', clientId:'client_id', projectId:'project_id', title:'title', party1Name:'party1_name', party1Role:'party1_role', party2Name:'party2_name', party2Role:'party2_role', duration:'duration', revisi:'revisi', warranty:'warranty', materai:'materai', signCount:'sign_count', witnessName:'witness_name', ipRights:'ip_rights', clauses:'clauses', templateId:'template_id', status:'status', createdAt:'created_at' }
    const fields:string[]=[]; const vals:any[]=[]
    for (const [k,v] of Object.entries(patch)) {
      const col=map[k]; if(!col) continue
      let val:any=v
      if (k==='clauses') val=JSON.stringify(v)
      if (k==='materai') val=v?1:0
      fields.push(`${col}=?`); vals.push(val)
    }
    if(!fields.length) return
    vals.push(id)
    await runAndPersist(`UPDATE contracts SET ${fields.join(', ')} WHERE id=?`, vals)
  },
  async deleteContract(id: string) {
    await runAndPersist('DELETE FROM contracts WHERE id=?', [id])
  },

  // Settings
  async getSettings(): Promise<Settings | null> {
    await sqlite.init()
    const rows = exec('SELECT data FROM settings WHERE id=?', ['default'])
    if (!rows.length) return null
    return JSON.parse(rows[0].data)
  },
  async saveSettings(s: Settings) {
    await sqlite.init()
    const existing = await this.getSettings()
    if (existing) {
      await runAndPersist('UPDATE settings SET data=? WHERE id=?', [JSON.stringify(s), 'default'])
    } else {
      await runAndPersist('INSERT INTO settings (id,data) VALUES (?,?)', ['default', JSON.stringify(s)])
    }
  },
}
