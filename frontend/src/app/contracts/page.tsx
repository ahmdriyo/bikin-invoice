"use client"

import { Search, Plus } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Contracts() {
  const { contracts, clients } = useAppStore()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'all'|'planned'|'in_progress'|'done'>('all')
  const filtered = useMemo(()=> contracts.filter(k=>{
    const matchQ = !q || k.number.toLowerCase().includes(q.toLowerCase()) || k.title.toLowerCase().includes(q.toLowerCase())
    const matchF = filter==='all' || k.status===filter
    return matchQ && matchF
  }), [contracts, q, filter])

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div><h1 className="text-[24px] font-semibold text-[#111827]">Kontrak</h1><p className="text-[12px] text-[#6B7280]">{filtered.length} dari {contracts.length} kontrak • dropdown Opsi B + AI Mock</p></div>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" /><Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari nomor / judul" className="pl-9 w-[240px] rounded-full bg-white" /></div>
          <Link href="/contracts/new"><Button><Plus className="w-4 h-4" /> Kontrak Baru</Button></Link>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {(['all','planned','in_progress','done'] as const).map(f=> (
          <button key={f} onClick={()=>setFilter(f)} className={`px-4 py-1.5 rounded-full text-[12px] border ${filter===f?'bg-[#111827] text-white border-[#111827]':'bg-white text-[#6B7280] border-[#E5E7EB]'}`}>{f==='all'?'Semua':f==='planned'?'Planned':f==='in_progress'?'In Progress':'Done'}</button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.map(k=>{
          const cl = clients.find(c=>c.id===k.clientId)
          return (
            <Link key={k.id} href={`/contracts/${k.id}`}>
              <Card className="p-4 hover:border-[#D1D5DB] transition-colors">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] px-2.5 py-1 rounded-full ${k.status==='done'?'bg-[#ECFDF5] text-[#059669]':k.status==='in_progress'?'bg-[#FFFBEB] text-[#D97706]':'bg-[#EFF6FF] text-[#2563EB]'}`}>{k.status}</span>
                  <span className="text-[11px] text-[#9CA3AF]">{k.number}</span>
                </div>
                <div className="text-[14px] font-medium text-[#111827] mt-3 leading-tight line-clamp-2">{k.title}</div>
                <div className="text-[12px] text-[#6B7280] mt-1">{cl?.company || k.party2Name}</div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="text-[11px] px-2 py-1 rounded-full bg-[#F3F4F6]">{k.duration} hari</span>
                  <span className="text-[11px] px-2 py-1 rounded-full bg-[#F3F4F6]">{k.revisi} revisi</span>
                  <span className="text-[11px] px-2 py-1 rounded-full bg-[#F3F4F6]">{k.materai?'materai':'tanpa materai'}</span>
                  <span className="text-[11px] px-2 py-1 rounded-full bg-[#F3F4F6]">{k.signCount} pihak</span>
                </div>
                <div className="text-[11px] text-[#9CA3AF] mt-2">{k.clauses.filter(c=>c.enabled).length} pasal aktif • {k.createdAt}</div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
