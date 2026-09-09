"use client"

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Sparkles, Trash2, GripVertical, Eye, EyeOff, Plus } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { generateContractMock } from '@/services/mockAi'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import type { Clause, Contract } from '@/types'

export default function ContractBuilder() {
  const params = useParams(); const id = params.id as string
  const router = useRouter()
  const { contracts, clients, projects, settings, addContract, updateContract } = useAppStore()
  const isNew = id==='new'
  const existing = contracts.find(c=>c.id===id)

  const [form, setForm] = useState<Partial<Contract>>(()=> {
    if (existing) return existing
    const nextNum = `SPK-2026-${String(contracts.length+1).padStart(4,'0')}`
    return {
      id:'k'+Date.now(), number: nextNum, clientId: clients[0]?.id, projectId: projects[0]?.id, title: `SPK ${projects[0]?.title || 'Website Baru'}`,
      party1Name: settings.businessName, party1Role:'PT', party2Name: clients[0]?.company||'', party2Role:'CV',
      duration:'21', revisi:'3', warranty:'30', materai:true, signCount:2, witnessName:'', ipRights:'client',
      templateId:'minimal', status:'planned', createdAt: new Date().toISOString().slice(0,10),
      clauses: [
        {id:'cl1', title:'Pasal 1 — Ruang Lingkup Pekerjaan', content:'<p>Pihak Pertama akan mengerjakan Website untuk Pihak Kedua...</p>', order:1, enabled:true},
        {id:'cl2', title:'Pasal 2 — Biaya dan Termin', content:'<p>Total biaya sesuai termin yang disepakati.</p>', order:2, enabled:true},
        {id:'cl3', title:'Pasal 3 — Jadwal', content:'<p>Durasi 21 hari.</p>', order:3, enabled:true},
        {id:'cl4', title:'Pasal 4 — Revisi', content:'<p>Revisi 3x.</p>', order:4, enabled:true},
        {id:'cl5', title:'Pasal 5 — Hak Cipta', content:'<p>Milik client setelah lunas.</p>', order:5, enabled:true},
        {id:'cl6', title:'Pasal 6 — Garansi', content:'<p>Garansi 30 hari.</p>', order:6, enabled:true},
        {id:'cl7', title:'Pasal 7 — Pembatalan', content:'<p>Pembatalan sesuai kesepakatan.</p>', order:7, enabled:true},
        {id:'cl8', title:'Pasal 8 — Penutup', content:'<p>Bermaterai, 2 pihak.</p>', order:8, enabled:true},
      ]
    }
  })
  const [loading, setLoading] = useState(false)
  const [dragIdx, setDragIdx] = useState<number|null>(null)

  const generate = async () => {
    setLoading(true)
    const project = projects.find(p=>p.id===form.projectId)
    const price = project?.priceEstimate || 4500000
    const termin = '50/50'
    const clauses = await generateContractMock({
      duration: form.duration||'21', revisi: form.revisi||'3', warranty: form.warranty||'30',
      materai: !!form.materai, signCount: form.signCount||2,
      party1Name: form.party1Name||'', party2Name: form.party2Name||'', projectTitle: project?.title||form.title||'Proyek Website',
      price, ipRights: form.ipRights||'client', termin
    })
    setForm({...form, clauses: clauses as Clause[]})
    setLoading(false)
  }

  const toggleClause = (idx:number) => setForm({...form, clauses: form.clauses!.map((c,i)=> i===idx?{...c, enabled:!c.enabled}:c)})
  const updateClause = (idx:number, patch: Partial<Clause>) => setForm({...form, clauses: form.clauses!.map((c,i)=> i===idx?{...c,...patch}:c)})
  const removeClause = (idx:number) => setForm({...form, clauses: form.clauses!.filter((_,i)=>i!==idx)})
  const addClause = () => setForm({...form, clauses: [...(form.clauses||[]), {id:'cl'+Date.now(), title:'Pasal Baru', content:'<p>Isi pasal baru...</p>', order:(form.clauses?.length||0)+1, enabled:true}]})

  const onDragStart = (idx:number) => setDragIdx(idx)
  const onDrop = (idx:number) => {
    if (dragIdx===null || dragIdx===idx) return
    const arr = [...(form.clauses||[])]
    const [moved] = arr.splice(dragIdx,1)
    arr.splice(idx,0,moved)
    setForm({...form, clauses: arr.map((c,i)=>({...c, order:i+1}))})
    setDragIdx(null)
  }

  const save = () => {
    const payload = form as Contract
    if (isNew) addContract(payload); else updateContract(payload.id, payload)
    router.push('/contracts')
  }

  const download = async () => {
    const el = document.getElementById('contract-pdf-content')
    if (!el) return window.print()
    try {
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      let imgWidth = pageWidth
      let imgHeight = (canvas.height * imgWidth) / canvas.width

      // PAKSA 1 HALAMAN SAJA (odd page only): scale down jika melebihi A4
      if (imgHeight > pageHeight) {
        const scale = pageHeight / imgHeight
        imgHeight = pageHeight
        imgWidth = imgWidth * scale
      }
      const x = (pageWidth - imgWidth) / 2
      pdf.addImage(imgData, 'PNG', x, 0, imgWidth, imgHeight)
      pdf.setFontSize(8)
      pdf.setTextColor('#9CA3AF')
      pdf.text(`1 / 1`, pageWidth - 10, pageHeight - 6, { align: 'right' })
      pdf.save(`${form.number || 'Kontrak'}.pdf`)
    } catch {
      window.print()
    }
  }

  const handlePrint = () => {
    const el = document.getElementById('contract-pdf-content') as HTMLElement | null
    if (!el) return window.print()
    const a4HeightPx = 1122
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
    setTimeout(cleanup, 2000)
  }

  const client = clients.find(c=>c.id===form.clientId)

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-[#E5E7EB] px-6 py-4 flex items-center gap-4 no-print">
        <Link href="/contracts" className="p-2 rounded-full hover:bg-white border border-transparent hover:border-[#E5E7EB]"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-[18px] font-semibold text-[#111827]">{isNew?'Kontrak Baru':'Edit Kontrak'} — {form.number}</h1>
          <p className="text-[12px] text-[#6B7280]">Dropdown Opsi B + AI DeepSeek Mock (1.5s)</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" onClick={download}><Download className="w-4 h-4" /> Download PDF</Button>
          <Button variant="secondary" onClick={handlePrint} className="hidden sm:inline-flex">Print</Button>
          <Button onClick={save}>Simpan</Button>
        </div>
      </div>

      <div className="grid grid-cols-[1.1fr_0.9fr] gap-6 p-6 print:grid-cols-1">
        <div className="space-y-4 no-print">
          <Card className="p-5">
            <h3 className="text-[14px] font-medium mb-4">Para Pihak & Project</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Client *</Label><Select value={form.clientId} onChange={e=>setForm({...form, clientId:e.target.value, party2Name: clients.find(c=>c.id===e.target.value)?.company||''})} className="mt-1">{clients.map(c=><option key={c.id} value={c.id}>{c.company}</option>)}</Select></div>
              <div><Label>Project</Label><Select value={form.projectId} onChange={e=>setForm({...form, projectId:e.target.value})} className="mt-1"><option value="">— Tanpa —</option>{projects.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</Select></div>
              <div className="col-span-2"><Label>Judul Kontrak</Label><Input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} className="mt-1 rounded-full" /></div>
              <div><Label>Pihak 1 Nama</Label><Input value={form.party1Name} onChange={e=>setForm({...form, party1Name:e.target.value})} className="mt-1 rounded-full" /></div>
              <div><Label>Pihak 1 Peran</Label><Select value={form.party1Role} onChange={e=>setForm({...form, party1Role:e.target.value})} className="mt-1"><option>PT</option><option>CV</option><option>Personal</option><option>Yayasan</option></Select></div>
              <div><Label>Pihak 2 Nama</Label><Input value={form.party2Name} onChange={e=>setForm({...form, party2Name:e.target.value})} className="mt-1 rounded-full" /></div>
              <div><Label>Pihak 2 Peran</Label><Select value={form.party2Role} onChange={e=>setForm({...form, party2Role:e.target.value})} className="mt-1"><option>PT</option><option>CV</option><option>Personal</option><option>Yayasan</option></Select></div>
              <div><Label>Status</Label><Select value={form.status} onChange={e=>setForm({...form, status:e.target.value as any})} className="mt-1"><option value="planned">Planned</option><option value="in_progress">In Progress</option><option value="done">Done</option></Select></div>
              <div><Label>Template</Label><Select value={form.templateId} onChange={e=>setForm({...form, templateId:e.target.value as any})} className="mt-1"><option value="minimal">Minimal</option><option value="corporate">Corporate</option><option value="creative">Creative</option></Select></div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-[14px] font-medium mb-4">Opsi Kontrak — Dropdown Opsi B</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Durasi Pengerjaan</Label><Select value={form.duration} onChange={e=>setForm({...form, duration:e.target.value as any})} className="mt-1"><option value="7">7 Hari</option><option value="14">14 Hari</option><option value="21">21 Hari</option><option value="30">30 Hari</option><option value="60">60 Hari</option><option value="custom">Custom</option></Select></div>
              <div><Label>Jumlah Revisi</Label><Select value={form.revisi} onChange={e=>setForm({...form, revisi:e.target.value as any})} className="mt-1"><option value="1">1x</option><option value="2">2x</option><option value="3">3x</option><option value="5">5x</option><option value="unlimited">Unlimited (selama scope)</option></Select></div>
              <div><Label>Garansi/Maintenance</Label><Select value={form.warranty} onChange={e=>setForm({...form, warranty:e.target.value as any})} className="mt-1"><option value="7">7 Hari</option><option value="30">30 Hari</option><option value="90">90 Hari</option><option value="none">Tidak Ada Garansi</option></Select></div>
              <div><Label>Hak Cipta</Label><Select value={form.ipRights} onChange={e=>setForm({...form, ipRights:e.target.value as any})} className="mt-1"><option value="client">Milik Client setelah lunas</option><option value="dev">Milik Developer hingga lunas</option><option value="shared">Bagi Pakai</option></Select></div>
              <div><Label>Materai</Label><Select value={form.materai?'true':'false'} onChange={e=>setForm({...form, materai:e.target.value==='true'})} className="mt-1"><option value="true">Pakai Materai Rp10.000</option><option value="false">Tidak Pakai</option></Select></div>
              <div><Label>Tanda Tangan</Label><Select value={String(form.signCount)} onChange={e=>setForm({...form, signCount:Number(e.target.value) as any})} className="mt-1"><option value="1">1 Pihak</option><option value="2">2 Pihak</option><option value="3">3 Pihak (+ Saksi)</option></Select></div>
              {form.signCount===3 && <div className="col-span-2"><Label>Nama Saksi</Label><Input value={form.witnessName} onChange={e=>setForm({...form, witnessName:e.target.value})} placeholder="Nama saksi" className="mt-1 rounded-full" /></div>}
            </div>
            <Button onClick={generate} disabled={loading} className="w-full mt-4 bg-[#111827] hover:bg-black">
              <Sparkles className="w-4 h-4" /> {loading?'Generating... (Mock 1.5s)':'Generate dengan AI ✨ (Mock)'}
            </Button>
            <div className="text-[11px] text-[#9CA3AF] mt-2 text-center">Mock: return 8 pasal Bahasa Indonesia formal • Real DeepInfra di Fase BE</div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-medium">Pasal — Toggle & Edit</h3>
              <Button size="sm" variant="secondary" onClick={addClause}><Plus className="w-4 h-4" /> Pasal Baru</Button>
            </div>
            <div className="space-y-3">
              {(form.clauses||[]).map((cl, idx)=> (
                <div key={cl.id} draggable onDragStart={()=>onDragStart(idx)} onDragOver={e=>e.preventDefault()} onDrop={()=>onDrop(idx)} className={`border rounded-[12px] bg-white ${cl.enabled?'border-[#E5E7EB]':'border-dashed border-[#E5E7EB] bg-[#F9FAFB] opacity-70'}`}>
                  <div className="flex items-center gap-2 p-3 border-b border-[#E5E7EB]">
                    <GripVertical className="w-4 h-4 text-[#9CA3AF] cursor-grab" />
                    <Input value={cl.title} onChange={e=>updateClause(idx,{title:e.target.value})} className="flex-1 h-7 text-[13px] font-medium rounded-full" />
                    <button onClick={()=>toggleClause(idx)} className={`p-1.5 rounded-full border ${cl.enabled?'bg-white border-[#E5E7EB] text-[#111827]':'bg-[#F3F4F6] text-[#9CA3AF]'}`}>{cl.enabled?<Eye className="w-4 h-4" />:<EyeOff className="w-4 h-4" />}</button>
                    <button onClick={()=>removeClause(idx)} className="p-1.5 rounded-full hover:bg-red-50 text-[#9CA3AF] hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="p-3">
                    <Textarea value={cl.content.replace(/<[^>]*>/g,'')} onChange={e=>updateClause(idx,{content:`<p>${e.target.value}</p>`})} className="min-h-[60px] text-[12px] rounded-[12px]" placeholder="Isi pasal..." />
                    <div className="text-[11px] text-[#9CA3AF] mt-1">{cl.enabled?'Aktif':'Nonaktif — tidak tampil di preview'} • drag untuk reorder</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 inline-flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
              <Sparkles className="w-3 h-3" /> Generated by AI — harap periksa kembali
            </div>
          </Card>
        </div>

        {/* PREVIEW KANAN */}
        <div id="contract-preview" className="sticky top-[76px] h-fit">
          <Card id="contract-preview-document" className="p-0 overflow-hidden print:border-none print:shadow-none">
            <div className="preview-bar px-5 py-3 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB] no-print">
              <span className="text-[12px] font-medium">Preview A4 — {form.templateId}</span>
              <span className="text-[11px] text-[#6B7280]">{(form.clauses||[]).filter(c=>c.enabled).length} pasal aktif</span>
            </div>
            <div id="contract-pdf-content" className="p-6 bg-white">
              <div className="text-center border-b border-[#E5E7EB] pb-4">
                {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 object-contain mx-auto rounded-[8px] border border-[#E5E7EB] bg-white p-1 mb-2" />}
                <div className="text-[16px] font-bold text-[#111827]">{form.title}</div>
                <div className="text-[11px] text-[#6B7280] mt-1">Nomor: {form.number} • {form.createdAt}</div>
                {form.materai && <div className="inline-flex mt-2 px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-[11px] border border-[#FDE68A]">Bermaterai Rp10.000</div>}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-[12px]">
                <div>
                  <div className="text-[11px] text-[#9CA3AF] uppercase tracking-wide">Pihak Pertama</div>
                  <div className="font-medium text-[#111827] mt-1">{form.party1Name} ({form.party1Role})</div>
                  <div className="text-[#6B7280]">{settings.address}</div>
                </div>
                <div>
                  <div className="text-[11px] text-[#9CA3AF] uppercase tracking-wide">Pihak Kedua</div>
                  <div className="font-medium text-[#111827] mt-1">{form.party2Name} ({form.party2Role})</div>
                  <div className="text-[#6B7280]">{client?.address}</div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {(form.clauses||[]).filter(c=>c.enabled).map(cl=> (
                  <div key={cl.id}>
                    <div className="text-[13px] font-semibold text-[#111827]">{cl.title}</div>
                    <div className="text-[12px] text-[#374151] leading-relaxed mt-1 whitespace-pre-wrap" dangerouslySetInnerHTML={{__html: cl.content}} />
                  </div>
                ))}
              </div>

              <div className={`mt-8 pt-6 border-t border-[#E5E7EB] grid gap-6 ${form.signCount===1?'grid-cols-1':form.signCount===2?'grid-cols-2':'grid-cols-3'}`}>
                {Array.from({length: form.signCount||2}).map((_,i)=> {
                  const names = [form.party1Name, form.party2Name, form.witnessName||'Saksi']
                  const roles = [form.party1Role, form.party2Role, 'Saksi']
                  const isParty1 = i===0
                  return (
                    <div key={i} className="text-center">
                      <div className="text-[11px] text-[#6B7280]">{i===2?'Saksi':`Pihak ${i+1}`} — {roles[i]}</div>
                      <div className="h-[70px] border border-dashed border-[#E5E7EB] rounded-[8px] mt-2 flex items-center justify-center bg-white overflow-hidden p-1">
                        {isParty1 && settings.signatureUrl ? <img src={settings.signatureUrl} alt="TTD" className="max-h-[60px] max-w-[110px] object-contain" /> : <span className="text-[#9CA3AF] text-[11px]">TTD</span>}
                      </div>
                      <div className="text-[12px] font-medium text-[#111827] mt-2">{names[i]||'—'}</div>
                    </div>
                  )
                })}
              </div>
              <div className="text-[11px] text-[#9CA3AF] mt-4 text-center">Template: {form.templateId} • {form.duration} hari • {form.revisi} revisi • {form.warranty} garansi • {form.ipRights}</div>
            </div>
          </Card>
          <div className="text-[11px] text-[#9CA3AF] mt-3 text-center no-print">Preview client-side • Fase BE simpan PDF ke R2</div>
        </div>
      </div>
    </div>
  )
}


