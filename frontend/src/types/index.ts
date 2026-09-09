export type InvoiceStatus = 'planned' | 'in_progress' | 'done'
export type ContractStatus = 'planned' | 'in_progress' | 'done'
export type ProjectStatus = 'planned' | 'in_progress' | 'done'

export type Client = {
  id: string
  name: string
  company: string
  email: string
  phone: string
  address: string
  npwp?: string
  createdAt: string
}

export type Project = {
  id: string
  clientId: string
  title: string
  category: 'Company Profile' | 'E-commerce' | 'Custom' | 'Landing Page'
  description: string
  priceEstimate: number
  deadline?: string
  status: ProjectStatus
  createdAt: string
}

export type InvoiceItem = {
  id: string
  name: string
  desc: string
  qty: number
  unit: string
  price: number
  discount: number
}

export type Invoice = {
  id: string
  number: string
  clientId: string
  projectId?: string
  items: InvoiceItem[]
  subtotal: number
  discountType: 'percent' | 'fixed'
  discountValue: number
  taxMode: 'none' | 'add11' | 'include'
  taxValue: number
  total: number
  termin: '50/50' | '30/40/30' | '100' | '4x' | 'custom'
  terminDetails?: { date: string; percent: number; amount: number }[]
  paymentMethod: 'transfer' | 'qris' | 'cash' | 'termin'
  dueMode: '7' | '14' | '30' | 'custom'
  dueDate: string
  issueDate: string
  lateFee: 'none' | '1day' | '1week' | 'custom'
  extraCost: 'none' | 'revisi' | 'maintenance'
  notes: string
  terms: string
  templateId: 'minimal' | 'corporate' | 'creative'
  status: InvoiceStatus
  createdAt: string
}

export type Clause = {
  id: string
  title: string
  content: string // HTML
  order: number
  enabled: boolean
}

export type Contract = {
  id: string
  number: string
  clientId: string
  projectId?: string
  title: string
  party1Name: string
  party1Role: string
  party2Name: string
  party2Role: string
  duration: '7' | '14' | '21' | '30' | '60' | 'custom'
  revisi: '1' | '2' | '3' | '5' | 'unlimited'
  warranty: '7' | '30' | '90' | 'none'
  materai: boolean
  signCount: 1 | 2 | 3
  witnessName?: string
  ipRights: 'client' | 'dev' | 'shared'
  clauses: Clause[]
  templateId: 'minimal' | 'corporate' | 'creative'
  status: ContractStatus
  createdAt: string
}

export type Settings = {
  businessName: string
  logoUrl?: string
  address: string
  phone: string
  email: string
  bankName: string
  bankAccount: string
  bankHolder: string
  npwp?: string
  signatureUrl?: string
  defaultTerms: string
  defaultNotes: string
}

export type TemplateConfig = {
  id: 'minimal' | 'corporate' | 'creative'
  name: string
  primaryColor: string
  secondaryColor: string
  font: 'Inter' | 'Manrope' | 'Playfair'
  showLogo: boolean
  headerStyle: 'minimal' | 'band'
}
