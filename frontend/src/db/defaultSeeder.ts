// Seeder Data — Single Source of Truth untuk SQLite lokal
// Semua data awal (clients, projects, invoices, contracts, settings, templateConfigs, clauses)
// disimpan sebagai seeder dan di-load ke SQLite WASM (IndexedDB) via seeder.ts / seed.mjs
// JANGAN pakai dummy.ts sebagai sumber runtime — file itu hanya deprecated re-export.
import type { Client, Project, Invoice, Contract, Settings, TemplateConfig } from '@/types'

export const defaultClients: Client[] = [
  { id: 'c1', name: 'Budi Santoso', company: 'CV Barokah Jaya', email: 'budi@barokahjaya.id', phone: '+6281234567890', address: 'Jl. Merdeka No. 12, Jakarta', npwp: '01.234.567.8-012.000', createdAt: '2026-01-15' },
  { id: 'c2', name: 'Siti Aminah', company: 'PT Maju Makmur', email: 'siti@majumakmur.co.id', phone: '+6281234567891', address: 'Jl. Sudirman No. 45, Surabaya', createdAt: '2026-02-02' },
  { id: 'c3', name: 'Andi Wijaya', company: 'Toko Berkah Abadi', email: 'andi@berkahabadi.com', phone: '+6281234567892', address: 'Jl. Pahlawan No. 8, Bandung', createdAt: '2026-02-20' },
  { id: 'c4', name: 'Rina Marlina', company: 'Yayasan Harapan Bangsa', email: 'rina@harapanbangsa.or.id', phone: '+6281234567893', address: 'Jl. Gatot Subroto No. 33, Yogyakarta', createdAt: '2026-03-01' },
  { id: 'c5', name: 'Joko Prasetyo', company: 'PT Sukses Selalu', email: 'joko@suksesselalu.co.id', phone: '+6281234567894', address: 'Jl. Thamrin No. 5, Medan', createdAt: '2026-03-10' },
  { id: 'c6', name: 'Dewi Lestari', company: 'CV Cipta Karya', email: 'dewi@ciptakarya.id', phone: '+6281234567895', address: 'Jl. Diponegoro No. 18, Semarang', createdAt: '2026-03-18' },
  { id: 'c7', name: 'Hendra Gunawan', company: 'PT Digital Nusantara', email: 'hendra@digitalnusantara.co.id', phone: '+6281234567896', address: 'Jl. HR Rasuna Said No. 22, Jakarta', createdAt: '2026-04-05' },
  { id: 'c8', name: 'Maya Sari', company: 'Butik Maya Collection', email: 'maya@mayacollection.com', phone: '+6281234567897', address: 'Jl. Malioboro No. 7, Yogyakarta', createdAt: '2026-04-12' },
  { id: 'c9', name: 'Farhan Alamsyah', company: 'PT Kreasi Digital', email: 'farhan@kreasidigital.id', phone: '+6281234567898', address: 'Jl. Teknologi No. 9, Jakarta', createdAt: '2026-05-01' },
  { id: 'c10', name: 'Lina Hartati', company: 'Klinik Sehat Bersama', email: 'lina@sehatbersama.id', phone: '+6281234567899', address: 'Jl. Kesehatan No. 14, Bali', createdAt: '2026-05-20' },
]

export const defaultProjects: Project[] = [
  { id: 'p1', clientId: 'c1', title: 'Website Company Profile 5 Halaman', category: 'Company Profile', description: 'Desain & development website company profile responsif 5 halaman + CMS', priceEstimate: 4500000, deadline: '2026-09-30', status: 'in_progress', createdAt: '2026-08-10' },
  { id: 'p2', clientId: 'c2', title: 'E-commerce Fashion', category: 'E-commerce', description: 'Toko online fashion dengan payment gateway & admin panel', priceEstimate: 12000000, deadline: '2026-10-15', status: 'planned', createdAt: '2026-08-12' },
  { id: 'p3', clientId: 'c3', title: 'Landing Page Promo', category: 'Landing Page', description: 'Landing page promo 17 Agustus + integrasi WA', priceEstimate: 2500000, deadline: '2026-08-25', status: 'done', createdAt: '2026-07-20' },
  { id: 'p4', clientId: 'c4', title: 'Website Yayasan + Donasi', category: 'Custom', description: 'Website yayasan dengan fitur donasi online & laporan', priceEstimate: 8000000, status: 'planned', createdAt: '2026-08-18' },
  { id: 'p5', clientId: 'c5', title: 'Company Profile PT Sukses', category: 'Company Profile', description: 'Redesign website company profile + SEO', priceEstimate: 6000000, deadline: '2026-09-10', status: 'in_progress', createdAt: '2026-08-01' },
  { id: 'p6', clientId: 'c6', title: 'Portfolio Arsitek', category: 'Custom', description: 'Website portfolio arsitek dengan galeri & filter', priceEstimate: 5500000, status: 'done', createdAt: '2026-07-15' },
  { id: 'p7', clientId: 'c7', title: 'Dashboard SaaS', category: 'Custom', description: 'Dashboard admin SaaS + auth & chart', priceEstimate: 15000000, deadline: '2026-11-01', status: 'planned', createdAt: '2026-08-20' },
  { id: 'p8', clientId: 'c8', title: 'E-commerce Butik', category: 'E-commerce', description: 'Toko online butik dengan katalog & checkout', priceEstimate: 9000000, status: 'in_progress', createdAt: '2026-08-05' },
]

export const defaultInvoices: Invoice[] = [
  { id: 'inv1', number: 'INV-2026-0001', clientId: 'c1', projectId: 'p1', items: [{id:'i1', name:'Desain UI/UX 5 Halaman', desc:'Figma responsif', qty:1, unit:'paket', price:1500000, discount:0},{id:'i2', name:'Development Website', desc:'Next.js + CMS', qty:1, unit:'paket', price:2500000, discount:0},{id:'i3', name:'Domain & Hosting 1 Tahun', desc:'', qty:1, unit:'tahun', price:500000, discount:0}], subtotal:4500000, discountType:'fixed', discountValue:0, taxMode:'none', taxValue:0, total:4500000, termin:'50/50', paymentMethod:'transfer', dueMode:'14', dueDate:'2026-09-22', issueDate:'2026-09-08', lateFee:'1day', extraCost:'none', notes:'Pembayaran via transfer', terms:'DP 50% sebelum mulai, pelunasan sebelum serah terima', templateId:'minimal', status:'in_progress', createdAt:'2026-09-08' },
  { id: 'inv2', number: 'INV-2026-0002', clientId: 'c2', projectId: 'p2', items: [{id:'i1', name:'E-commerce Development', desc:'Full fitur', qty:1, unit:'paket', price:12000000, discount:0}], subtotal:12000000, discountType:'percent', discountValue:10, taxMode:'add11', taxValue:1188000, total:11988000, termin:'30/40/30', paymentMethod:'transfer', dueMode:'14', dueDate:'2026-09-25', issueDate:'2026-09-01', lateFee:'none', extraCost:'maintenance', notes:'', terms:'Termin 30/40/30', templateId:'corporate', status:'planned', createdAt:'2026-09-01' },
  { id: 'inv3', number: 'INV-2026-0003', clientId: 'c3', projectId: 'p3', items: [{id:'i1', name:'Landing Page', desc:'', qty:1, unit:'paket', price:2500000, discount:0}], subtotal:2500000, discountType:'fixed', discountValue:0, taxMode:'none', taxValue:0, total:2500000, termin:'100', paymentMethod:'qris', dueMode:'7', dueDate:'2026-08-27', issueDate:'2026-08-20', lateFee:'none', extraCost:'none', notes:'Lunas', terms:'100% di awal', templateId:'creative', status:'done', createdAt:'2026-08-20' },
  { id: 'inv4', number: 'INV-2026-0004', clientId: 'c5', projectId: 'p5', items: [{id:'i1', name:'Redesign Website', desc:'', qty:1, unit:'paket', price:6000000, discount:0}], subtotal:6000000, discountType:'fixed', discountValue:500000, taxMode:'none', taxValue:0, total:5500000, termin:'50/50', paymentMethod:'transfer', dueMode:'14', dueDate:'2026-09-15', issueDate:'2026-09-02', lateFee:'1week', extraCost:'revisi', notes:'', terms:'', templateId:'minimal', status:'in_progress', createdAt:'2026-09-02' },
  { id: 'inv5', number: 'INV-2026-0005', clientId: 'c4', projectId: 'p4', items: [{id:'i1', name:'Website Yayasan', desc:'', qty:1, unit:'paket', price:8000000, discount:0}], subtotal:8000000, discountType:'fixed', discountValue:0, taxMode:'include', taxValue:0, total:8000000, termin:'4x', paymentMethod:'termin', dueMode:'30', dueDate:'2026-10-01', issueDate:'2026-09-05', lateFee:'none', extraCost:'none', notes:'', terms:'4x termin', templateId:'minimal', status:'planned', createdAt:'2026-09-05' },
  { id: 'inv6', number: 'INV-2026-0006', clientId: 'c7', projectId: 'p7', items: [{id:'i1', name:'SaaS Dashboard', desc:'', qty:1, unit:'paket', price:15000000, discount:0},{id:'i2', name:'Maintenance 3 Bulan', desc:'', qty:3, unit:'bulan', price:500000, discount:0}], subtotal:16500000, discountType:'fixed', discountValue:0, taxMode:'add11', taxValue:1815000, total:18315000, termin:'30/40/30', paymentMethod:'transfer', dueMode:'30', dueDate:'2026-10-10', issueDate:'2026-09-07', lateFee:'1day', extraCost:'maintenance', notes:'', terms:'', templateId:'corporate', status:'planned', createdAt:'2026-09-07' },
  { id: 'inv7', number: 'INV-2026-0007', clientId: 'c8', projectId: 'p8', items: [{id:'i1', name:'E-commerce Butik', desc:'', qty:1, unit:'paket', price:9000000, discount:0}], subtotal:9000000, discountType:'fixed', discountValue:0, taxMode:'none', taxValue:0, total:9000000, termin:'50/50', paymentMethod:'transfer', dueMode:'14', dueDate:'2026-09-18', issueDate:'2026-09-03', lateFee:'none', extraCost:'none', notes:'', terms:'', templateId:'creative', status:'done', createdAt:'2026-09-03' },
  { id: 'inv8', number: 'INV-2026-0008', clientId: 'c1', projectId: 'p1', items: [{id:'i1', name:'Tambahan Fitur Blog', desc:'', qty:1, unit:'paket', price:1000000, discount:0}], subtotal:1000000, discountType:'fixed', discountValue:0, taxMode:'none', taxValue:0, total:1000000, termin:'25/75', paymentMethod:'cash', dueMode:'3', dueDate:'2026-09-09', issueDate:'2026-09-06', lateFee:'none', extraCost:'none', notes:'DP 25% pelunasan 75%', terms:'Termin DP 25% - Pelunasan 75%', templateId:'minimal', status:'planned', createdAt:'2026-09-06' },
  { id: 'inv9', number: 'INV-2026-0009', clientId: 'c6', projectId: 'p6', items: [{id:'i1', name:'Portfolio Arsitek', desc:'', qty:1, unit:'paket', price:5500000, discount:0}], subtotal:5500000, discountType:'fixed', discountValue:0, taxMode:'none', taxValue:0, total:5500000, termin:'50/50', paymentMethod:'transfer', dueMode:'14', dueDate:'2026-08-30', issueDate:'2026-08-15', lateFee:'none', extraCost:'none', notes:'', terms:'', templateId:'minimal', status:'done', createdAt:'2026-08-15' },
  { id: 'inv10', number: 'INV-2026-0010', clientId: 'c2', projectId: 'p2', items: [{id:'i1', name:'DP E-commerce', desc:'', qty:1, unit:'paket', price:3600000, discount:0}], subtotal:3600000, discountType:'fixed', discountValue:0, taxMode:'none', taxValue:0, total:3600000, termin:'50/50', paymentMethod:'transfer', dueMode:'14', dueDate:'2026-09-12', issueDate:'2026-08-29', lateFee:'none', extraCost:'none', notes:'DP 30%', terms:'', templateId:'corporate', status:'in_progress', createdAt:'2026-08-29' },
  { id: 'inv11', number: 'INV-2026-0011', clientId: 'c10', projectId: undefined, items: [{id:'i1', name:'Konsultasi Website', desc:'', qty:2, unit:'hari', price:750000, discount:0}], subtotal:1500000, discountType:'fixed', discountValue:0, taxMode:'none', taxValue:0, total:1500000, termin:'25/75', paymentMethod:'transfer', dueMode:'1', dueDate:'2026-09-05', issueDate:'2026-09-04', lateFee:'none', extraCost:'none', notes:'DP 25% pelunasan 75%', terms:'Termin DP 25% - Pelunasan 75%', templateId:'minimal', status:'done', createdAt:'2026-09-04' },
  { id: 'inv12', number: 'INV-2026-0012', clientId: 'c9', projectId: undefined, items: [{id:'i1', name:'Layanan Maintenance Bulanan', desc:'', qty:1, unit:'bulan', price:2000000, discount:0}], subtotal:2000000, discountType:'fixed', discountValue:0, taxMode:'none', taxValue:0, total:2000000, termin:'100', paymentMethod:'transfer', dueMode:'30', dueDate:'2026-09-30', issueDate:'2026-09-08', lateFee:'none', extraCost:'none', notes:'', terms:'', templateId:'minimal', status:'planned', createdAt:'2026-09-08' },
]

export const defaultContracts: Contract[] = [
  { id: 'k1', number: 'SPK-2026-0001', clientId: 'c1', projectId: 'p1', title: 'SPK Website Company Profile CV Barokah', party1Name: 'Usaha Saya', party1Role: 'PT', party2Name: 'CV Barokah Jaya', party2Role: 'CV', duration: '21', revisi: '3', warranty: '30', materai: true, signCount: 2, ipRights: 'client', templateId: 'minimal', status: 'in_progress', createdAt: '2026-09-08', clauses: [
    {id:'cl1', title:'Pasal 1 — Ruang Lingkup Pekerjaan', content:'<p>Pihak Pertama akan mengerjakan Website Company Profile 5 Halaman untuk Pihak Kedua meliputi desain UI/UX, development responsif, dan integrasi CMS.</p>', order:1, enabled:true},
    {id:'cl2', title:'Pasal 2 — Biaya dan Termin', content:'<p>Total biaya Rp 4.500.000 dengan termin 50% DP dan 50% pelunasan. Pembayaran via Transfer Bank.</p>', order:2, enabled:true},
    {id:'cl3', title:'Pasal 3 — Jadwal dan Keterlambatan', content:'<p>Pekerjaan diselesaikan dalam 21 hari kalender sejak DP diterima. Keterlambatan dikenakan denda 1% per hari.</p>', order:3, enabled:true},
    {id:'cl4', title:'Pasal 4 — Revisi', content:'<p>Revisi maksimal 3 kali selama masih dalam ruang lingkup. Revisi di luar scope dikenakan biaya tambahan.</p>', order:4, enabled:true},
    {id:'cl5', title:'Pasal 5 — Hak Cipta', content:'<p>Hak cipta beralih kepada Pihak Kedua setelah pelunasan penuh.</p>', order:5, enabled:true},
    {id:'cl6', title:'Pasal 6 — Garansi', content:'<p>Garansi 30 hari untuk bug dan error teknis, tidak termasuk perubahan fitur.</p>', order:6, enabled:true},
    {id:'cl7', title:'Pasal 7 — Pembatalan dan Force Majeure', content:'<p>Pembatalan sepihak dikenakan potongan DP. Force majeure diselesaikan musyawarah.</p>', order:7, enabled:true},
    {id:'cl8', title:'Pasal 8 — Penutup dan Tanda Tangan', content:'<p>Perjanjian ini dibuat bermaterai Rp10.000 dan ditandatangani kedua belah pihak.</p>', order:8, enabled:true},
  ]},
  { id: 'k2', number: 'SPK-2026-0002', clientId: 'c2', projectId: 'p2', title: 'SPK E-commerce PT Maju Makmur', party1Name: 'Usaha Saya', party1Role: 'PT', party2Name: 'PT Maju Makmur', party2Role: 'PT', duration: '60', revisi: '5', warranty: '90', materai: true, signCount: 3, witnessName: 'Budi Saksi', ipRights: 'client', templateId: 'corporate', status: 'planned', createdAt: '2026-09-02', clauses: [
    {id:'cl1', title:'Pasal 1 — Ruang Lingkup', content:'<p>Pembuatan E-commerce Fashion lengkap dengan payment gateway.</p>', order:1, enabled:true},
    {id:'cl2', title:'Pasal 2 — Biaya', content:'<p>Total Rp 12.000.000 termin 30/40/30.</p>', order:2, enabled:true},
    {id:'cl3', title:'Pasal 3 — Jadwal', content:'<p>60 hari kerja.</p>', order:3, enabled:true},
    {id:'cl4', title:'Pasal 4 — Revisi', content:'<p>5 kali revisi.</p>', order:4, enabled:true},
    {id:'cl5', title:'Pasal 5 — Hak Cipta', content:'<p>Milik client setelah lunas.</p>', order:5, enabled:true},
    {id:'cl6', title:'Pasal 6 — Garansi', content:'<p>90 hari.</p>', order:6, enabled:true},
    {id:'cl7', title:'Pasal 7 — Pembatalan', content:'<p>...</p>', order:7, enabled:true},
    {id:'cl8', title:'Pasal 8 — Penutup', content:'<p>Bermaterai, 3 pihak.</p>', order:8, enabled:true},
  ]},
  { id: 'k3', number: 'SPK-2026-0003', clientId: 'c3', projectId: 'p3', title: 'SPK Landing Page Toko Berkah', party1Name: 'Usaha Saya', party1Role: 'PT', party2Name: 'Toko Berkah Abadi', party2Role: 'CV', duration: '7', revisi: '2', warranty: '7', materai: false, signCount: 2, ipRights: 'client', templateId: 'creative', status: 'done', createdAt: '2026-08-20', clauses: [
    {id:'cl1', title:'Pasal 1 — Ruang Lingkup', content:'<p>Landing page promo.</p>', order:1, enabled:true},
    {id:'cl2', title:'Pasal 2 — Biaya', content:'<p>Rp 2.500.000 lunas di awal.</p>', order:2, enabled:true},
    {id:'cl8', title:'Pasal 8 — Penutup', content:'<p>Tanpa materai.</p>', order:8, enabled:true},
  ]},
  { id: 'k4', number: 'SPK-2026-0004', clientId: 'c5', projectId: 'p5', title: 'SPK Redesign PT Sukses Selalu', party1Name: 'Usaha Saya', party1Role: 'PT', party2Name: 'PT Sukses Selalu', party2Role: 'PT', duration: '21', revisi: '3', warranty: '30', materai: true, signCount: 2, ipRights: 'shared', templateId: 'minimal', status: 'in_progress', createdAt: '2026-09-01', clauses: [
    {id:'cl1', title:'Pasal 1 — Ruang Lingkup', content:'<p>Redesign website.</p>', order:1, enabled:true},
    {id:'cl2', title:'Pasal 2 — Biaya', content:'<p>Rp 5.500.000</p>', order:2, enabled:true},
    {id:'cl3', title:'Pasal 3 — Jadwal', content:'<p>21 hari.</p>', order:3, enabled:true},
    {id:'cl4', title:'Pasal 4 — Revisi', content:'<p>3x</p>', order:4, enabled:true},
    {id:'cl5', title:'Pasal 5 — Hak Cipta', content:'<p>Bagi pakai.</p>', order:5, enabled:true},
    {id:'cl6', title:'Pasal 6 — Garansi', content:'<p>30 hari.</p>', order:6, enabled:true},
    {id:'cl7', title:'Pasal 7 — Pembatalan', content:'<p>...</p>', order:7, enabled:true},
    {id:'cl8', title:'Pasal 8 — Penutup', content:'<p>Bermaterai.</p>', order:8, enabled:true},
  ]},
  { id: 'k5', number: 'SPK-2026-0005', clientId: 'c7', projectId: 'p7', title: 'SPK SaaS Digital Nusantara', party1Name: 'Usaha Saya', party1Role: 'PT', party2Name: 'PT Digital Nusantara', party2Role: 'PT', duration: '60', revisi: 'unlimited', warranty: '90', materai: true, signCount: 2, ipRights: 'dev', templateId: 'corporate', status: 'planned', createdAt: '2026-09-07', clauses: [
    {id:'cl1', title:'Pasal 1 — Ruang Lingkup', content:'<p>Dashboard SaaS.</p>', order:1, enabled:true},
    {id:'cl2', title:'Pasal 2 — Biaya', content:'<p>Rp 18.315.000</p>', order:2, enabled:true},
    {id:'cl8', title:'Pasal 8 — Penutup', content:'<p>Bermaterai.</p>', order:8, enabled:true},
  ]},
  { id: 'k6', number: 'SPK-2026-0006', clientId: 'c8', projectId: 'p8', title: 'SPK E-commerce Butik Maya', party1Name: 'Usaha Saya', party1Role: 'PT', party2Name: 'Butik Maya Collection', party2Role: 'Personal', duration: '30', revisi: '3', warranty: '30', materai: false, signCount: 2, ipRights: 'client', templateId: 'minimal', status: 'done', createdAt: '2026-09-03', clauses: [
    {id:'cl1', title:'Pasal 1 — Ruang Lingkup', content:'<p>E-commerce butik.</p>', order:1, enabled:true},
    {id:'cl8', title:'Pasal 8 — Penutup', content:'<p>Tanpa materai, 2 pihak.</p>', order:8, enabled:true},
  ]},
]

export const defaultSettings: Settings = {
  businessName: 'Usaha Saya',
  address: 'Jl. Teknologi No. 9, Jakarta Selatan 12190',
  phone: '+6281234567899',
  email: 'hello@usahasaya.id',
  bankName: 'BCA',
  bankAccount: '1234567890',
  bankHolder: 'Usaha Saya',
  npwp: '01.234.567.8-012.000',
  defaultTerms: 'Pembayaran via Transfer BCA. DP 50% sebelum pengerjaan, pelunasan sebelum serah terima. Keterlambatan dikenakan denda 1% per hari.',
  defaultNotes: 'Terima kasih atas kepercayaan Anda.',
}

export const templateConfigs: TemplateConfig[] = [
  { id: 'minimal', name: 'Minimal', primaryColor: '#111827', secondaryColor: '#FFFFFF', font: 'Inter', showLogo: true, headerStyle: 'minimal' },
  { id: 'corporate', name: 'Corporate', primaryColor: '#1E3A8A', secondaryColor: '#EFF6FF', font: 'Manrope', showLogo: true, headerStyle: 'band' },
  { id: 'creative', name: 'Creative', primaryColor: '#111827', secondaryColor: '#FEF3C7', font: 'Playfair', showLogo: true, headerStyle: 'minimal' },
]

// Clauses template untuk mock AI kontrak — dipakai services/mockAi.ts
// Seeder-based, bukan dummy. Semua {{variable}} akan di-replace runtime.
export const seederClausesMock = [
  { title: 'Pasal 1 — Ruang Lingkup Pekerjaan', content: '<p>Pihak Pertama akan mengerjakan <strong>{{project_title}}</strong> untuk Pihak Kedua sesuai deskripsi terlampir. Pekerjaan meliputi desain UI/UX, development responsif, testing, dan deploy awal.</p><ul><li>Desain Figma responsif</li><li>Development frontend & backend</li><li>Integrasi domain & hosting</li></ul>' },
  { title: 'Pasal 2 — Biaya, Pembayaran & Termin', content: '<p>Total biaya sebesar <strong>{{price}}</strong> dengan termin pembayaran sesuai kesepakatan. Pembayaran dilakukan via Transfer Bank ke rekening Pihak Pertama.</p><p>Termin: {{termin}}.</p>' },
  { title: 'Pasal 3 — Jadwal, Deadline & Keterlambatan', content: '<p>Pekerjaan diselesaikan dalam <strong>{{duration}} hari kalender</strong> sejak DP diterima. Keterlambatan dari Pihak Pertama dikenakan denda 1% per hari maksimal 10%.</p>' },
  { title: 'Pasal 4 — Revisi & Biaya Tambahan', content: '<p>Revisi maksimal <strong>{{revisi}} kali</strong> selama masih dalam ruang lingkup awal. Revisi di luar scope atau penambahan fitur dikenakan biaya tambahan sesuai kesepakatan.</p>' },
  { title: 'Pasal 5 — Hak Cipta, Kepemilikan & Serah Terima', content: '<p>Hak cipta dan kepemilikan website beralih kepada Pihak Kedua setelah pelunasan penuh ({{ipRights}}).</p>' },
  { title: 'Pasal 6 — Garansi, Maintenance & Batasan Tanggung Jawab', content: '<p>Garansi <strong>{{warranty}} hari</strong> untuk perbaikan bug/error teknis, tidak termasuk perubahan desain atau fitur baru.</p>' },
  { title: 'Pasal 7 — Pembatalan, Force Majeure & Penyelesaian Sengketa', content: '<p>Pembatalan sepihak oleh Pihak Kedua menyebabkan DP hangus. Force majeure (bencana, regulasi) diselesaikan secara musyawarah. Sengketa diselesaikan di domisili Pihak Pertama.</p>' },
  { title: 'Pasal 8 — Penutup & Tanda Tangan', content: '<p>Perjanjian ini dibuat rangkap dua, bermaterai Rp10.000 jika dipilih, dan ditandatangani {{signCount}} pihak.</p>' },
]

// Alias kompatibilitas — kode lama pakai dummyClausesMock
export const dummyClausesMock = seederClausesMock

// Metadata seeder untuk UI / logging
export const seederMeta = {
  version: 2,
  name: 'Bikin Invoice Seeder (SQLite Lokal)',
  description: '10 clients, 8 projects, 12 invoices, 6 kontrak + settings default + 3 templates — sumber tunggal seeder → SQLite',
  createdAt: '2026-09-09',
  isDefault: true,
}

// Helper untuk generate nomor berurutan (dipakai seeder tambahan jika mau)
export function nextInvoiceNumber(seq: number, year = 2026) {
  return `INV-${year}-${String(seq).padStart(4, '0')}`
}
export function nextContractNumber(seq: number, year = 2026) {
  return `SPK-${year}-${String(seq).padStart(4, '0')}`
}
