export type InvoiceStatus = 'proses' | 'selesai' | 'draft' | 'planned' | 'in_progress' | 'done'
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
  termin: '50/50' | '25/75' | '30/40/30' | '100' | '4x' | 'custom' // deprecated, pakai terminDP/terminPelunasan untuk baru
  terminDP?: '50' | '25' | '30' | '2' | '75' | '70' | '98' | '100' | 'custom'
  terminPelunasan?: '50' | '25' | '75' | '70' | '30' | '100' | '98' | '2' | 'custom'
  terminDPCustom?: number
  terminPelunasanCustom?: number
  terminDetails?: { date: string; percent: number; amount: number }[]
  // Skema terpisah DP vs Pelunasan — very recommended
  kind?: 'dp' | 'pelunasan' // dp = tagih DP di awal (syarat kickoff), pelunasan = rekap total - DP, tagih sisa
  paymentMethod: 'transfer' | 'qris' | 'cash' | 'termin'
  dueMode: '1' | '3' | '7' | '14' | '30' | 'custom'
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
