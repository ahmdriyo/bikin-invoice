"use client"

import { useMemo, useState } from 'react'
import { Search, Plus } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { KanbanColumn, InvoiceCard, ContractCard } from '@/components/kanban/KanbanColumn'
import { useAppStore } from '@/store/useAppStore'
import { formatRupiahShort } from '@/lib/utils'

export default function Dashboard() {
  const { invoices, contracts, clients } = useAppStore()
  const [q, setQ] = useState('')
  const [dragId, setDragId] = useState<string | null>(null)
  const { updateInvoice, updateContract } = useAppStore()

  const filteredInvoices = useMemo(() => {
    if (!q) return invoices
    const s = q.toLowerCase()
    return invoices.filter(i => i.number.toLowerCase().includes(s) || clients.find(c=>c.id===i.clientId)?.company.toLowerCase().includes(s))
  }, [invoices, clients, q])
  const filteredContracts = useMemo(() => {
    if (!q) return contracts
    const s = q.toLowerCase()
    return contracts.filter(k => k.number.toLowerCase().includes(s) || k.title.toLowerCase().includes(s))
  }, [contracts, q])

  const invBy = (status: string) => filteredInvoices.filter(i=>i.status===status)
  const kBy = (status: string) => filteredContracts.filter(k=>k.status===status)
  const totalPlanned = filteredInvoices.filter(i=>i.status==='planned').reduce((a,b)=>a+b.total,0)
  const totalDone = filteredInvoices.filter(i=>i.status==='done').reduce((a,b)=>a+b.total,0)

  const onDrop = (e: React.DragEvent, target: 'planned'|'in_progress'|'done', type: 'inv'|'k') => {
    e.preventDefault()
    if (!dragId) return
    if (type==='inv') updateInvoice(dragId, { status: target })
    else updateContract(dragId, { status: target })
    setDragId(null)
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-[#E5E7EB] px-6 py-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-[24px] font-semibold text-[#111827] leading-none">Dashboard</h1>
            <p className="text-[12px] text-[#6B7280] mt-1">Kelola invoice & kontrak — drag kartu antar kolom untuk ubah status</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <Input placeholder="Cari invoice, kontrak, client..." value={q} onChange={e=>setQ(e.target.value)} className="pl-9 w-[300px] rounded-full bg-white" />
            </div>
            <Link href="/invoices/new"><Button className="rounded-full"><Plus className="w-4 h-4" /> Invoice Baru</Button></Link>
            <Link href="/contracts/new"><Button variant="secondary" className="rounded-full"><Plus className="w-4 h-4" /> Kontrak Baru</Button></Link>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4">
          <Card className="p-4">
            <div className="text-[11px] text-[#6B7280] uppercase tracking-wide">Total Planned</div>
            <div className="text-[18px] font-semibold text-[#111827] mt-1">{formatRupiahShort(totalPlanned)}</div>
            <div className="text-[11px] text-[#9CA3AF]">{invBy('planned').length} invoice</div>
          </Card>
          <Card className="p-4">
            <div className="text-[11px] text-[#6B7280] uppercase tracking-wide">In Progress</div>
            <div className="text-[18px] font-semibold text-[#F59E0B] mt-1">{invBy('in_progress').length} invoice</div>
            <div className="text-[11px] text-[#9CA3AF]">{kBy('in_progress').length} kontrak</div>
          </Card>
          <Card className="p-4">
            <div className="text-[11px] text-[#6B7280] uppercase tracking-wide">Done</div>
            <div className="text-[18px] font-semibold text-[#10B981] mt-1">{formatRupiahShort(totalDone)}</div>
            <div className="text-[11px] text-[#9CA3AF]">{invBy('done').length} invoice lunas</div>
          </Card>
          <Card className="p-4">
            <div className="text-[11px] text-[#6B7280] uppercase tracking-wide">Kontrak Aktif</div>
            <div className="text-[18px] font-semibold text-[#111827] mt-1">{contracts.length} total</div>
            <div className="text-[11px] text-[#9CA3AF]">{kBy('planned').length} planned</div>
          </Card>
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-[14px] font-medium text-[#111827] mb-4">Invoices — Kanban</h2>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {(['planned','in_progress','done'] as const).map(col => (
            <div key={col} onDragOver={e=>e.preventDefault()} onDrop={e=>onDrop(e,col,'inv')} className="w-[320px] shrink-0">
              <KanbanColumn title={col==='planned'?'Planned':col==='in_progress'?'In Progress':'Done'} count={invBy(col).length} variant={col==='planned'?'planned':col==='in_progress'?'inProgress':'done'}>
                {invBy(col).map(inv => {
                  const cl = clients.find(c=>c.id===inv.clientId)
                  return (
                    <div key={inv.id} draggable onDragStart={()=>setDragId(inv.id)} className={dragId===inv.id?'opacity-50':''}>
                      <Link href={`/invoices/${inv.id}`}><InvoiceCard inv={inv} client={cl} /></Link>
                    </div>
                  )
                })}
                {invBy(col).length===0 && <div className="h-[100px] rounded-[12px] border border-dashed border-[#E5E7EB] bg-white/50 flex items-center justify-center text-[12px] text-[#9CA3AF]">Drop di sini</div>}
              </KanbanColumn>
            </div>
          ))}
        </div>

        <h2 className="text-[14px] font-medium text-[#111827] mt-8 mb-4">Kontrak — Kanban</h2>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {(['planned','in_progress','done'] as const).map(col => (
            <div key={col} onDragOver={e=>e.preventDefault()} onDrop={e=>onDrop(e,col,'k')} className="w-[320px] shrink-0">
              <KanbanColumn title={col==='planned'?'Planned':col==='in_progress'?'In Progress':'Done'} count={kBy(col).length} variant={col==='planned'?'planned':col==='in_progress'?'inProgress':'done'}>
                {kBy(col).map(k => {
                  const cl = clients.find(c=>c.id===k.clientId)
                  return (
                    <div key={k.id} draggable onDragStart={()=>setDragId(k.id)} className={dragId===k.id?'opacity-50':''}>
                      <Link href={`/contracts/${k.id}`}><ContractCard c={k} client={cl} /></Link>
                    </div>
                  )
                })}
                {kBy(col).length===0 && <div className="h-[100px] rounded-[12px] border border-dashed border-[#E5E7EB] bg-white/50 flex items-center justify-center text-[12px] text-[#9CA3AF]">Drop di sini</div>}
              </KanbanColumn>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
