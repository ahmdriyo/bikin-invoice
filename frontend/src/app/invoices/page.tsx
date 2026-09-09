"use client"

import { Search, Plus } from 'lucide-react'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatRupiahShort } from '@/lib/utils'

export default function Invoices() {
  const { invoices, clients } = useAppStore()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'all'|'planned'|'in_progress'|'done'>('all')
  const filtered = useMemo(()=> invoices.filter(i=>{
    const matchQ = !q || i.number.toLowerCase().includes(q.toLowerCase()) || clients.find(c=>c.id===i.clientId)?.company.toLowerCase().includes(q.toLowerCase())
    const matchF = filter==='all' || i.status===filter
    return matchQ && matchF
  }), [invoices, clients, q, filter])

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
        {(['all','planned','in_progress','done'] as const).map(f=> (
          <button key={f} onClick={()=>setFilter(f)} className={`px-4 py-1.5 rounded-full text-[12px] border ${filter===f?'bg-[#111827] text-white border-[#111827]':'bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F9FAFB]'}`}>{f==='all'?'Semua':f==='planned'?'Planned':f==='in_progress'?'In Progress':'Done'}</button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.map(inv=>{
          const cl = clients.find(c=>c.id===inv.clientId)
          return (
            <Link key={inv.id} href={`/invoices/${inv.id}`}>
              <Card className="p-4 hover:border-[#D1D5DB] transition-colors">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] px-2.5 py-1 rounded-full ${inv.status==='done'?'bg-[#ECFDF5] text-[#059669]':inv.status==='in_progress'?'bg-[#FFFBEB] text-[#D97706]':'bg-[#EFF6FF] text-[#2563EB]'}`}>{inv.status}</span>
                  <span className="text-[11px] text-[#9CA3AF]">{inv.number}</span>
                </div>
                <div className="text-[14px] font-medium text-[#111827] mt-3">{cl?.company}</div>
                <div className="text-[12px] text-[#6B7280]">{cl?.name} • {inv.issueDate}</div>
                <div className="text-[12px] text-[#6B7280] mt-2 line-clamp-1">{inv.items.map(i=>i.name).join(', ')}</div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[14px] font-semibold text-[#111827]">{formatRupiahShort(inv.total)}</span>
                  <span className="ml-auto text-[11px] px-2 py-1 rounded-full bg-[#F3F4F6]">{inv.termin} • {inv.taxMode}</span>
                </div>
                <div className="text-[11px] text-[#9CA3AF] mt-2">Jatuh tempo: {inv.dueDate} • {inv.paymentMethod}</div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
