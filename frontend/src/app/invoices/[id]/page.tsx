"use client"

import { useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Download } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { formatRupiah, formatRupiahShort } from '@/lib/utils'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import type { Invoice, InvoiceItem } from '@/types'

function calcTotal(items: InvoiceItem[], discountType: 'percent'|'fixed', discountValue: number, taxMode: string) {
  const subtotal = items.reduce((a,b)=> a + (b.qty*b.price - b.discount), 0)
  const disc = discountType==='percent' ? Math.round(subtotal*discountValue/100) : discountValue
  const afterDisc = subtotal - disc
  const tax = taxMode==='add11' ? Math.round(afterDisc*0.11) : 0
  const total = afterDisc + tax
  return { subtotal, disc, tax, total }
}

export default function InvoiceBuilder() {
  const params = useParams(); const id = params.id as string
  const router = useRouter()
  const { invoices, clients, projects, settings, addInvoice, updateInvoice } = useAppStore()
  const isNew = id==='new'
  const existing = invoices.find(i=>i.id===id)

  const [form, setForm] = useState<Partial<Invoice>>(()=> {
    if (existing) return existing
    const nextNum = `INV-2026-${String(invoices.length+1).padStart(4,'0')}`
    return {
      id: 'inv'+Date.now(),
      number: nextNum,
      clientId: clients[0]?.id,
      projectId: projects[0]?.id,
      items: [{id:'it1', name:'Desain UI/UX', desc:'', qty:1, unit:'paket', price:1500000, discount:0}],
      subtotal:0, discountType:'fixed', discountValue:0, taxMode:'none', taxValue:0, total:1500000,
      termin:'50/50', paymentMethod:'transfer', dueMode:'14', dueDate: new Date(Date.now()+14*86400000).toISOString().slice(0,10), issueDate: new Date().toISOString().slice(0,10),
      lateFee:'none', extraCost:'none', notes: settings.defaultNotes, terms: settings.defaultTerms, templateId:'minimal', status:'planned', createdAt: new Date().toISOString().slice(0,10)
    }
  })

  const { subtotal, disc, tax, total } = useMemo(()=> calcTotal(form.items||[], form.discountType||'fixed', form.discountValue||0, form.taxMode||'none'), [form.items, form.discountType, form.discountValue, form.taxMode])
  const dp = form.termin==='50/50' ? Math.round(total*0.5) : form.termin==='30/40/30' ? Math.round(total*0.3) : form.termin==='100' ? total : form.termin==='4x' ? Math.round(total*0.25) : 0

  const addItem = () => setForm({...form, items: [...(form.items||[]), {id:'it'+Date.now(), name:'Item Baru', desc:'', qty:1, unit:'paket', price:0, discount:0}]})
  const updateItem = (idx:number, patch: Partial<InvoiceItem>) => setForm({...form, items: form.items!.map((x,i)=> i===idx?{...x,...patch}:x)})
  const removeItem = (idx:number) => setForm({...form, items: form.items!.filter((_,i)=>i!==idx)})

  const save = () => {
    const payload: Invoice = { ...(form as Invoice), subtotal, total, taxValue: tax }
    if (isNew) addInvoice(payload); else updateInvoice(payload.id, payload)
    router.push('/invoices')
  }

  const download = async () => {
    const el = document.getElementById('invoice-pdf-content')
    if (!el) return window.print()
    try {
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      let imgWidth = pageWidth
      let imgHeight = (canvas.height * imgWidth) / canvas.width

      // PAKSA 1 HALAMAN SAJA: jika tinggi melebihi A4, scale down agar muat 1 halaman (odd page only = 1)
      if (imgHeight > pageHeight) {
        const scale = pageHeight / imgHeight
        imgHeight = pageHeight
        imgWidth = imgWidth * scale
      }
      const x = (pageWidth - imgWidth) / 2
      pdf.addImage(imgData, 'PNG', x, 0, imgWidth, imgHeight)
      // Nomor halaman kanan bawah (selalu 1 / 1 karena 1 halaman)
      pdf.setFontSize(8)
      pdf.setTextColor('#9CA3AF')
      pdf.text(`1 / 1`, pageWidth - 10, pageHeight - 6, { align: 'right' })
      pdf.save(`${form.number || 'Invoice'}.pdf`)
    } catch {
      window.print()
    }
  }

  const handlePrint = () => {
    const el = document.getElementById('invoice-pdf-content') as HTMLElement | null
    if (!el) return window.print()
    // Scale down via CSS transform agar muat 1 halaman saat print (odd only)
    const a4HeightPx = 1122 // 297mm @ 96dpi
    const rect = el.getBoundingClientRect()
    const prevTransform = el.style.transform
    const prevWidth = el.style.width
    if (rect.height > a4HeightPx) {
      const scale = a4HeightPx / rect.height
      el.style.transform = `scale(${scale})`
      el.style.transformOrigin = 'top left'
      el.style.width = `${100 / scale}%`
    }
    const cleanup = () => {
      el.style.transform = prevTransform
      el.style.width = prevWidth
      window.removeEventListener('afterprint', cleanup)
    }
    window.addEventListener('afterprint', cleanup)
    window.print()
    // Fallback cleanup jika afterprint tidak fire
    setTimeout(cleanup, 2000)
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-[#E5E7EB] px-6 py-4 flex items-center gap-4 no-print">
        <Link href="/invoices" className="p-2 rounded-full hover:bg-white border border-transparent hover:border-[#E5E7EB]"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-[18px] font-semibold text-[#111827]">{isNew?'Invoice Baru':'Edit Invoice'} — {form.number}</h1>
          <p className="text-[12px] text-[#6B7280]">Manual dropdown Opsi A • tanpa AI • preview realtime</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" onClick={download}><Download className="w-4 h-4" /> Download PDF</Button>
          <Button variant="secondary" onClick={handlePrint} className="hidden sm:inline-flex">Print</Button>
          <Button onClick={save}>Simpan</Button>
        </div>
      </div>

      <div className="grid grid-cols-[1.1fr_0.9fr] gap-6 p-6 print:grid-cols-1">
        {/* FORM KIRI */}
        <div className="space-y-4 no-print">
          <Card className="p-5">
            <h3 className="text-[14px] font-medium text-[#111827] mb-4">Client & Project</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Client *</Label><Select value={form.clientId} onChange={e=>setForm({...form, clientId:e.target.value})} className="mt-1">{clients.map(c=><option key={c.id} value={c.id}>{c.company} — {c.name}</option>)}</Select></div>
              <div><Label>Project</Label><Select value={form.projectId} onChange={e=>setForm({...form, projectId:e.target.value})} className="mt-1"><option value="">— Tanpa Project —</option>{projects.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</Select></div>
              <div><Label>No. Invoice</Label><Input value={form.number} onChange={e=>setForm({...form, number:e.target.value})} className="mt-1" /></div>
              <div><Label>Status</Label><Select value={form.status} onChange={e=>setForm({...form, status:e.target.value as any})} className="mt-1"><option value="planned">Planned</option><option value="in_progress">In Progress</option><option value="done">Done</option></Select></div>
              <div><Label>Tgl Terbit</Label><Input type="date" value={form.issueDate} onChange={e=>setForm({...form, issueDate:e.target.value})} className="mt-1" /></div>
              <div><Label>Template</Label><Select value={form.templateId} onChange={e=>setForm({...form, templateId:e.target.value as any})} className="mt-1"><option value="minimal">Minimal</option><option value="corporate">Corporate</option><option value="creative">Creative</option></Select></div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4"><h3 className="text-[14px] font-medium">Tabel Item</h3><Button size="sm" onClick={addItem}><Plus className="w-4 h-4" /> Tambah Item</Button></div>
            <div className="space-y-3">
              {(form.items||[]).map((it, idx)=> (
                <div key={it.id} className="grid grid-cols-[1.4fr_0.6fr_0.6fr_0.8fr_40px] gap-2 items-end bg-[#F9FAFB] p-3 rounded-[12px] border border-[#E5E7EB]">
                  <div><Label className="text-[11px]">Nama</Label><Input value={it.name} onChange={e=>updateItem(idx,{name:e.target.value})} className="mt-1 h-8 text-[13px] rounded-full" /></div>
                  <div><Label className="text-[11px]">Qty</Label><Input type="number" value={it.qty} onChange={e=>updateItem(idx,{qty:Number(e.target.value)})} className="mt-1 h-8 rounded-full" /></div>
                  <div><Label className="text-[11px]">Satuan</Label><Select value={it.unit} onChange={e=>updateItem(idx,{unit:e.target.value})} className="mt-1 h-8 text-[12px]"><option>paket</option><option>pcs</option><option>hari</option><option>bulan</option><option>tahun</option></Select></div>
                  <div><Label className="text-[11px]">Harga</Label><Input type="number" value={it.price} onChange={e=>updateItem(idx,{price:Number(e.target.value)})} className="mt-1 h-8 rounded-full" /></div>
                  <button onClick={()=>removeItem(idx)} className="h-8 w-8 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center hover:bg-red-50 text-[#9CA3AF] hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  <div className="col-span-5"><Input value={it.desc} onChange={e=>updateItem(idx,{desc:e.target.value})} placeholder="Deskripsi (opsional)" className="h-8 text-[12px] rounded-full bg-white" /></div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-[14px] font-medium mb-4">Ketentuan — Dropdown Opsi A</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Termin Pembayaran *</Label><Select value={form.termin} onChange={e=>setForm({...form, termin:e.target.value as any})} className="mt-1"><option value="50/50">50% DP - 50% Pelunasan</option><option value="30/40/30">30% - 40% - 30%</option><option value="100">100% di Awal</option><option value="4x">4x Termin (25%)</option><option value="custom">Custom</option></Select></div>
              <div><Label>Metode Pembayaran</Label><Select value={form.paymentMethod} onChange={e=>setForm({...form, paymentMethod:e.target.value as any})} className="mt-1"><option value="transfer">Transfer Bank</option><option value="qris">QRIS</option><option value="cash">Cash</option><option value="termin">Termin Bertahap</option></Select></div>
              <div><Label>PPN</Label><Select value={form.taxMode} onChange={e=>setForm({...form, taxMode:e.target.value as any})} className="mt-1"><option value="none">Tanpa PPN</option><option value="add11">PPN 11% Ditambahkan</option><option value="include">PPN Sudah Termasuk</option></Select></div>
              <div><Label>Jatuh Tempo</Label><Select value={form.dueMode} onChange={e=>setForm({...form, dueMode:e.target.value as any})} className="mt-1"><option value="7">7 Hari</option><option value="14">14 Hari</option><option value="30">30 Hari</option><option value="custom">Tanggal Custom</option></Select></div>
              <div><Label>Denda Keterlambatan</Label><Select value={form.lateFee} onChange={e=>setForm({...form, lateFee:e.target.value as any})} className="mt-1"><option value="none">Tanpa Denda</option><option value="1day">1% per Hari</option><option value="1week">1% per Minggu</option><option value="custom">Custom</option></Select></div>
              <div><Label>Biaya Tambahan</Label><Select value={form.extraCost} onChange={e=>setForm({...form, extraCost:e.target.value as any})} className="mt-1"><option value="none">Tanpa Biaya Tambahan</option><option value="revisi">Revisi di luar scope Rp/hari</option><option value="maintenance">Maintenance opsional</option></Select></div>
              <div><Label>Jatuh Tempo Tanggal</Label><Input type="date" value={form.dueDate} onChange={e=>setForm({...form, dueDate:e.target.value})} className="mt-1 rounded-full" /></div>
              <div className="flex gap-2">
                <div className="flex-1"><Label>Diskon Tipe</Label><Select value={form.discountType} onChange={e=>setForm({...form, discountType:e.target.value as any})} className="mt-1"><option value="fixed">Rp</option><option value="percent">%</option></Select></div>
                <div className="flex-1"><Label>Nilai Diskon</Label><Input type="number" value={form.discountValue} onChange={e=>setForm({...form, discountValue:Number(e.target.value)})} className="mt-1 rounded-full" /></div>
              </div>
              <div className="col-span-2"><Label>Catatan</Label><Textarea value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} placeholder="Terima kasih..." className="mt-1" /></div>
              <div className="col-span-2"><Label>Syarat & Ketentuan</Label><Textarea value={form.terms} onChange={e=>setForm({...form, terms:e.target.value})} placeholder="DP 50%..." className="mt-1" /></div>
            </div>
          </Card>
        </div>

        {/* PREVIEW KANAN */}
        <div id="invoice-preview" className="sticky top-[76px] h-fit">
          <Card id="invoice-preview-document" className="p-0 overflow-hidden print:border-none print:shadow-none">
            <div className="preview-bar px-5 py-3 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB] no-print">
              <span className="text-[12px] font-medium text-[#111827]">Preview A4 — {form.templateId}</span>
              <span className="text-[11px] text-[#6B7280]">Live &lt;300ms</span>
            </div>
            <div id="invoice-pdf-content" className="p-6 bg-white">
              {/* Header */}
              <div className={`flex justify-between items-start pb-4 border-b ${form.templateId==='corporate'?'bg-[#EFF6FF] -mx-6 -mt-6 px-6 pt-6 border-[#1E3A8A]':''}`}>
                <div className="flex gap-3 items-start">
                  {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-[8px] border border-[#E5E7EB] bg-white p-1 shrink-0" />}
                  <div>
                    <div className="text-[18px] font-bold text-[#111827]" style={{fontFamily: form.templateId==='creative'?'serif':undefined}}>{settings.businessName}</div>
                    <div className="text-[11px] text-[#6B7280] mt-1">{settings.address} • {settings.phone}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[16px] font-semibold text-[#111827]">INVOICE</div>
                  <div className="text-[11px] text-[#6B7280]">{form.number}</div>
                  <div className={`mt-2 inline-flex px-2.5 py-1 rounded-full text-[11px] ${form.status==='done'?'bg-[#ECFDF5] text-[#059669]':form.status==='in_progress'?'bg-[#FFFBEB] text-[#D97706]':'bg-[#EFF6FF] text-[#2563EB]'}`}>{form.status}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-4 text-[12px]">
                <div>
                  <div className="text-[#9CA3AF] text-[11px] uppercase tracking-wide">Tagihan Kepada</div>
                  <div className="font-medium text-[#111827] mt-1">{clients.find(c=>c.id===form.clientId)?.company}</div>
                  <div className="text-[#6B7280]">{clients.find(c=>c.id===form.clientId)?.name} • {clients.find(c=>c.id===form.clientId)?.phone}</div>
                  <div className="text-[#6B7280]">{clients.find(c=>c.id===form.clientId)?.address}</div>
                </div>
                <div className="text-right">
                  <div className="text-[#6B7280]">Tgl Terbit: {form.issueDate}</div>
                  <div className="text-[#6B7280]">Jatuh Tempo: {form.dueDate} ({form.dueMode})</div>
                  <div className="text-[#6B7280]">Termin: {form.termin} • {form.paymentMethod}</div>
                  <div className="text-[#6B7280]">PPN: {form.taxMode}</div>
                </div>
              </div>

              <div className="mt-6 border border-[#E5E7EB] rounded-[8px] overflow-hidden">
                <div className="grid grid-cols-[1.5fr_0.4fr_0.7fr_0.7fr] gap-2 px-3 py-2 bg-[#F9FAFB] text-[11px] font-medium text-[#6B7280] uppercase tracking-wide">
                  <span>Item</span><span>Qty</span><span>Harga</span><span className="text-right">Total</span>
                </div>
                {(form.items||[]).map(it=> (
                  <div key={it.id} className="grid grid-cols-[1.5fr_0.4fr_0.7fr_0.7fr] gap-2 px-3 py-2.5 border-t border-[#E5E7EB] text-[12px]">
                    <div><div className="font-medium text-[#111827]">{it.name}</div><div className="text-[#9CA3AF] text-[11px]">{it.desc}</div></div>
                    <div className="text-[#6B7280]">{it.qty} {it.unit}</div>
                    <div className="text-[#6B7280]">{formatRupiahShort(it.price)}</div>
                    <div className="text-right font-medium text-[#111827]">{formatRupiahShort(it.qty*it.price - it.discount)}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <div className="w-[260px] space-y-1.5 text-[12px]">
                  <div className="flex justify-between text-[#6B7280]"><span>Subtotal</span><span>{formatRupiah(subtotal)}</span></div>
                  <div className="flex justify-between text-[#6B7280]"><span>Diskon</span><span>-{formatRupiah(disc)}</span></div>
                  {form.taxMode==='add11' && <div className="flex justify-between text-[#6B7280]"><span>PPN 11%</span><span>{formatRupiah(tax)}</span></div>}
                  <div className="flex justify-between font-semibold text-[#111827] border-t border-[#E5E7EB] pt-2 text-[14px]"><span>Total</span><span>{formatRupiah(total)}</span></div>
                  <div className="flex justify-between text-[#2563EB] font-medium"><span>DP ({form.termin})</span><span>{formatRupiah(dp)}</span></div>
                  <div className="flex justify-between font-semibold"><span>Sisa</span><span>{formatRupiah(total-dp)}</span></div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-6 text-[11px] leading-relaxed">
                <div><div className="font-medium text-[#111827]">Catatan</div><div className="text-[#6B7280] mt-1 whitespace-pre-wrap">{form.notes}</div></div>
                <div><div className="font-medium text-[#111827]">Syarat</div><div className="text-[#6B7280] mt-1 whitespace-pre-wrap">{form.terms}</div>
                  <div className="text-[#9CA3AF] mt-2">Denda: {form.lateFee} • Biaya tambahan: {form.extraCost}</div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#E5E7EB] grid grid-cols-2 gap-6 text-[11px]">
                <div>
                  <div className="text-[#6B7280]">Transfer ke:</div>
                  <div className="font-medium text-[#111827]">{settings.bankName} — {settings.bankAccount} a.n {settings.bankHolder}</div>
                </div>
                <div className="text-center">
                  <div className="text-[#6B7280]">Hormat kami,</div>
                  <div className="h-[60px] flex items-center justify-center border border-dashed border-[#E5E7EB] rounded-[8px] mt-2 bg-white overflow-hidden p-1">
                    {settings.signatureUrl ? <img src={settings.signatureUrl} alt="TTD" className="max-h-[50px] max-w-[120px] object-contain" /> : <span className="text-[#9CA3AF] text-[11px]">TTD</span>}
                  </div>
                  <div className="font-medium text-[#111827] mt-2">{settings.businessName}</div>
                </div>
              </div>
            </div>
          </Card>
          <div className="text-[11px] text-[#9CA3AF] mt-3 text-center no-print">Preview client-side • Fase BE akan simpan PDF ke R2</div>
        </div>
      </div>
    </div>
  )
}
