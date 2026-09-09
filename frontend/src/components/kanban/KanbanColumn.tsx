import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn, formatRupiahShort } from "@/lib/utils"
import type { Invoice, Contract, Client } from "@/types"

export function KanbanColumn({ title, count, variant, children }: { title: string; count: number; variant: 'planned'|'inProgress'|'done'; children: React.ReactNode }) {
  const dot: Record<string,string> = { planned: 'bg-[#3B82F6]', inProgress: 'bg-[#F59E0B]', done: 'bg-[#10B981]' }
  return (
    <div className="w-[320px] shrink-0 flex flex-col">
      <div className="flex items-center gap-2 mb-4 px-1">
        <span className={cn("w-2 h-2 rounded-full", dot[variant])} />
        <h3 className="text-[13px] font-medium text-[#111827]">{title}</h3>
        <span className="text-[12px] text-[#9CA3AF]">{count}</span>
      </div>
      <div className="flex-1 space-y-3 min-h-[200px]">
        {children}
      </div>
    </div>
  )
}

export function InvoiceCard({ inv, client }: { inv: Invoice; client?: Client }) {
  const normalize = (s: string) => s==='planned' || s==='in_progress' ? 'proses' : s==='done' ? 'selesai' : s
  const st = normalize(inv.status)
  const statusMap: Record<string, 'planned'|'inProgress'|'done'> = { proses: 'inProgress', selesai: 'done', draft: 'planned', planned: 'planned', in_progress: 'inProgress', done: 'done' }
  const labelMap: Record<string,string> = { proses:'Proses', selesai:'Selesai', draft:'Draft' }
  const dp = (inv as Invoice).terminDP ?? (inv.termin?.split('/')[0] ?? '50')
  const pel = (inv as Invoice).terminPelunasan ?? (inv.termin?.split('/')[1] ?? '50')
  const isDpCustom = dp === 'custom'
  const isPelCustom = pel === 'custom'
  const dpLabel = isDpCustom ? `${(inv as Invoice).terminDPCustom ?? 0}%` : `${dp}%`
  const pelLabel = isPelCustom ? `${(inv as Invoice).terminPelunasanCustom ?? 0}%` : `${pel}%`
  const terminLabel = dp === pel && !isDpCustom && !isPelCustom && inv.termin && !inv.termin.includes('/') ? inv.termin : `DP ${dpLabel} • Pelunasan ${pelLabel}`
  // Fallback simple for old 30/40/30 etc keep original termin
  const displayTermin = inv.termin === '30/40/30' || inv.termin === '100' || inv.termin === '4x' ? inv.termin : terminLabel
  return (
    <Card className="p-4 hover:border-[#D1D5DB] transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-2 mb-2">
        <Badge variant={statusMap[st] || 'planned'} className="capitalize">{labelMap[st] || st} • {(inv as Invoice).kind==='pelunasan' ? 'Pelunasan' : (inv as Invoice).kind==='dp' ? 'DP' : ''}</Badge>
        <span className="text-[11px] text-[#9CA3AF]">{inv.number}</span>
      </div>
      <div className="text-[14px] font-medium text-[#111827] leading-tight line-clamp-2">{client?.company || '—'} • {formatRupiahShort(inv.total)}</div>
      <div className="text-[12px] text-[#6B7280] mt-1 line-clamp-1">{inv.items.map(i=>i.name).join(', ')}</div>
      <div className="flex items-center gap-2 mt-3">
        <span className="inline-flex px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[11px] text-[#374151]">{displayTermin}</span>
        <span className="text-[11px] text-[#9CA3AF] ml-auto">{inv.dueDate}</span>
      </div>
    </Card>
  )
}

export function ContractCard({ c, client }: { c: Contract; client?: Client }) {
  const statusMap: Record<string, 'planned'|'inProgress'|'done'> = { planned: 'planned', in_progress: 'inProgress', done: 'done' }
  return (
    <Card className="p-4 hover:border-[#D1D5DB] transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-2 mb-2">
        <Badge variant={statusMap[c.status]} className="capitalize">{c.status.replace('_',' ')}</Badge>
        <span className="text-[11px] text-[#9CA3AF]">{c.number}</span>
      </div>
      <div className="text-[14px] font-medium text-[#111827] leading-tight line-clamp-2">{c.title}</div>
      <div className="text-[12px] text-[#6B7280] mt-1">{client?.company || c.party2Name} • {c.duration} hari • {c.revisi} revisi</div>
      <div className="flex items-center gap-2 mt-3">
        <span className="inline-flex px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[11px] text-[#374151]">{c.signCount} pihak {c.materai ? '• materai' : ''}</span>
        <span className="text-[11px] text-[#9CA3AF] ml-auto">{c.createdAt}</span>
      </div>
    </Card>
  )
}
