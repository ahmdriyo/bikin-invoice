"use client"

import { useState } from 'react'
import { Plus, Search, Trash2, Pencil } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { formatRupiahShort } from '@/lib/utils'
import type { Project } from '@/types'

export default function Projects() {
  const { projects, clients, addProject, updateProject, deleteProject } = useAppStore()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Project>>({ title:'', category:'Company Profile', description:'', priceEstimate:0, status:'planned', clientId: clients[0]?.id })

  const filtered = projects.filter(p => !q || p.title.toLowerCase().includes(q.toLowerCase()))

  const openAdd = () => {
    setEditingId(null)
    setForm({ title:'', category:'Company Profile', description:'', priceEstimate:0, status:'planned', clientId: clients[0]?.id })
    setOpen(true)
  }
  const openEdit = (p: Project) => {
    setEditingId(p.id)
    setForm({ ...p })
    setOpen(true)
  }
  const close = () => {
    setOpen(false)
    setEditingId(null)
    setForm({ title:'', category:'Company Profile', description:'', priceEstimate:0, status:'planned', clientId: clients[0]?.id })
  }

  const submit = () => {
    if (!form.title || !form.clientId) return alert('Judul & Client wajib')
    if (editingId) {
      updateProject(editingId, { title: form.title!, category: form.category as unknown as Project['category'], description: form.description||'', priceEstimate: Number(form.priceEstimate)||0, deadline: form.deadline, status: form.status as unknown as Project['status'], clientId: form.clientId! })
    } else {
      addProject({ id:'p'+Date.now(), title: form.title!, category: form.category as unknown as Project['category'], description: form.description||'', priceEstimate: Number(form.priceEstimate)||0, deadline: form.deadline, status: form.status as unknown as Project['status'], clientId: form.clientId!, createdAt: new Date().toISOString().slice(0,10) })
    }
    close()
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div><h1 className="text-[24px] font-semibold text-[#111827]">Projects</h1><p className="text-[12px] text-[#6B7280]">{projects.length} projects</p></div>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" /><Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari project" className="pl-9 w-[260px] rounded-full bg-white" /></div>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Project Baru</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.map(p => {
          const cl = clients.find(c=>c.id===p.clientId)
          return (
            <Card key={p.id} className="p-4 hover:border-[#D1D5DB] transition-colors group">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEdit(p)}>
                  <div className="text-[14px] font-medium text-[#111827] leading-tight line-clamp-2">{p.title}</div>
                  <div className="text-[11px] text-[#6B7280] mt-1 truncate">{cl?.company} • {p.category}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-full hover:bg-[#EFF6FF] text-[#9CA3AF] hover:text-[#2563EB] transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                  <button onClick={()=>deleteProject(p.id)} className="p-1.5 rounded-full hover:bg-red-50 text-[#9CA3AF] hover:text-red-600 transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="text-[12px] text-[#6B7280] mt-3 line-clamp-2 cursor-pointer" onClick={() => openEdit(p)}>{p.description || <span className="text-[#9CA3AF] italic">Tidak ada deskripsi</span>}</div>
              <div className="flex items-center gap-2 mt-3">
                <span className="px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[11px]">{formatRupiahShort(p.priceEstimate)}</span>
                <span className={`ml-auto text-[11px] px-2 py-1 rounded-full ${p.status==='done'?'bg-[#ECFDF5] text-[#059669]':p.status==='in_progress'?'bg-[#FFFBEB] text-[#D97706]':'bg-[#EFF6FF] text-[#2563EB]'}`}>{p.status}</span>
              </div>
              {p.deadline && <div className="text-[11px] text-[#9CA3AF] mt-2">Deadline: {p.deadline}</div>}
            </Card>
          )
        })}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" onClick={close}>
          <div className="bg-white rounded-[16px] p-6 w-full max-w-[560px] border border-[#E5E7EB]" onClick={e=>e.stopPropagation()}>
            <h3 className="text-[16px] font-semibold">{editingId ? 'Edit Project' : 'Project Baru'}</h3>
            <p className="text-[12px] text-[#6B7280] mt-1">{editingId ? 'Perbarui data project' : 'Tambah project baru untuk client'}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="col-span-2"><Label>Client *</Label><Select value={form.clientId} onChange={e=>setForm({...form, clientId:e.target.value})} className="mt-1">{clients.map(c=><option key={c.id} value={c.id}>{c.company} — {c.name}</option>)}</Select></div>
              <div className="col-span-2"><Label>Judul *</Label><Input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} placeholder="Website Company Profile 5 Halaman" className="mt-1 rounded-full" /></div>
              <div><Label>Kategori</Label><Select value={form.category} onChange={e=>setForm({...form, category:e.target.value as unknown as Project['category']})} className="mt-1"><option>Company Profile</option><option>E-commerce</option><option>Custom</option><option>Landing Page</option></Select></div>
              <div><Label>Status</Label><Select value={form.status} onChange={e=>setForm({...form, status:e.target.value as unknown as Project['status']})} className="mt-1"><option value="planned">Planned</option><option value="in_progress">In Progress</option><option value="done">Done</option></Select></div>
              <div><Label>Estimasi Harga</Label><Input type="number" value={form.priceEstimate} onChange={e=>setForm({...form, priceEstimate:Number(e.target.value)})} className="mt-1 rounded-full" /></div>
              <div><Label>Deadline</Label><Input type="date" value={form.deadline||''} onChange={e=>setForm({...form, deadline:e.target.value})} className="mt-1 rounded-full" /></div>
              <div className="col-span-2"><Label>Deskripsi</Label><Input value={form.description} onChange={e=>setForm({...form, description:e.target.value})} placeholder="Desain & development..." className="mt-1 rounded-full" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-6"><Button variant="secondary" onClick={close}>Batal</Button><Button onClick={submit}>{editingId ? 'Simpan Perubahan' : 'Simpan'}</Button></div>
          </div>
        </div>
      )}
    </div>
  )
}
