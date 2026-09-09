"use client"

import { Search, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatRupiahShort } from '@/lib/utils'
import type { Invoice } from '@/types'

function normalizeStatus(s: string) { if (s==='planned' || s==='in_progress') return 'proses'; if (s==='done') return 'selesai'; return s }
function statusLabelId(s: string) { const m: Record<string,string> = { proses:'Proses', selesai:'Selesai', draft:'Draft' }; return m[s] || s }
export default function Invoices() {
  const { invoices, clients, deleteInvoice } = useAppStore()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'all'|'proses'|'selesai'|'draft'>('all')
  const filtered = useMemo(()=> invoices.filter(i=>{
    const matchQ = !q || i.number.toLowerCase().includes(q.toLowerCase()) || clients.find(c=>c.id===i.clientId)?.company.toLowerCase().includes(q.toLowerCase())
    const st = normalizeStatus(i.status)
    const matchF = filter==='all' || st===filter
    return matchQ && matchF
  }), [invoices, clients, q, filter])

  const handleDelete = async (e: React.MouseEvent, inv: Invoice) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Hapus invoice ${inv.number}?\nTindakan ini tidak bisa dibatalkan.`)) return
    await deleteInvoice(inv.id)
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div><h1 className="text-[24px] font-semibold text-[#111827]">Invoices</h1><p className="text-[12px] text-[#6B7280]">{filtered.length} dari {invoices.length} invoice • manual dropdown Opsi A</p></div>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" /><Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari nomor / client" className="pl-9 w-[240px] rounded-full bg-white" /></div>
          <Link href="/invoices/new"><Button><Plus className="w-4 h-4" /> Invoice Baru</Button></Link>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {(['all','proses','selesai','draft'] as const).map(f=> (
          <button key={f} onClick={()=>setFilter(f)} className={`px-4 py-1.5 rounded-full text-[12px] border ${filter===f?'bg-[#111827] text-white border-[#111827]':'bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F9FAFB]'}`}>{f==='all'?'Semua':f==='proses'?'Proses':f==='selesai'?'Selesai':'Draft'}</button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.map(inv=>{
          const cl = clients.find(c=>c.id===inv.clientId)
          return (
            <div key={inv.id} className="relative group">
              <Link href={`/invoices/${inv.id}`}>
                <Card className="p-4 hover:border-[#D1D5DB] transition-colors group-hover:border-[#9CA3AF]/50">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full ${normalizeStatus(inv.status)==='selesai'?'bg-[#ECFDF5] text-[#059669]':normalizeStatus(inv.status)==='proses'?'bg-[#FFFBEB] text-[#D97706]':'bg-[#EFF6FF] text-[#2563EB]'}`}>{statusLabelId(normalizeStatus(inv.status))}</span>
                    <span className="text-[11px] text-[#9CA3AF]">{inv.number} • {(inv as Invoice).kind==='pelunasan' ? 'Pelunasan' : (inv as Invoice).kind==='dp' ? 'DP' : ''}</span>
                  </div>
                  <div className="text-[14px] font-medium text-[#111827] mt-3 pr-6">{cl?.company}</div>
                  <div className="text-[12px] text-[#6B7280]">{cl?.name} • {inv.issueDate}</div>
                  <div className="text-[12px] text-[#6B7280] mt-2 line-clamp-1">{inv.items.map(i=>i.name).join(', ')}</div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[14px] font-semibold text-[#111827]">{formatRupiahShort(inv.total)}</span>
                    {(() => {
                      const dp = (inv as Invoice).terminDP ?? inv.termin?.split('/')[0] ?? '50'
                      const pel = (inv as Invoice).terminPelunasan ?? inv.termin?.split('/')[1] ?? '50'
                      const dpL = dp==='custom' ? `${(inv as Invoice).terminDPCustom ?? 0}%` : `${dp}%`
                      const pelL = pel==='custom' ? `${(inv as Invoice).terminPelunasanCustom ?? 0}%` : `${pel}%`
                      const isLegacy = inv.termin==='30/40/30' || inv.termin==='100' || inv.termin==='4x'
                      return <span className="ml-auto text-[11px] px-2 py-1 rounded-full bg-[#F3F4F6]">{isLegacy ? `${inv.termin} • ${inv.taxMode}` : `DP ${dpL} • Pelunasan ${pelL} • ${inv.taxMode}`}</span>
                    })()}
                  </div>
                  <div className="text-[11px] text-[#9CA3AF] mt-2">Jatuh tempo: {inv.dueDate} • {inv.paymentMethod}</div>
                </Card>
              </Link>
              <button
                onClick={(e)=>handleDelete(e, inv)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white border border-[#E5E7EB] opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:border-red-200 text-[#9CA3AF] hover:text-red-600 transition-all shadow-sm"
                title="Hapus invoice"
                aria-label="Hapus invoice"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
