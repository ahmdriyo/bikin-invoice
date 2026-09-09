"use client"

import { useState } from 'react'
import { Search, Plus, Trash2, Pencil } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { Client } from '@/types'

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useAppStore()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<Client>>({ name:'', company:'', email:'', phone:'+62', address:'' })
  const filtered = clients.filter(c => !q || c.company.toLowerCase().includes(q.toLowerCase()) || c.name.toLowerCase().includes(q.toLowerCase()))

  const openAdd = () => {
    setEditingId(null)
    setForm({ name:'', company:'', email:'', phone:'+62', address:'', npwp:'' })
    setOpen(true)
  }
  const openEdit = (c: Client) => {
    setEditingId(c.id)
    setForm({ ...c })
    setOpen(true)
  }
  const close = () => {
    setOpen(false)
    setEditingId(null)
    setForm({ name:'', company:'', email:'', phone:'+62', address:'' })
  }

  const submit = () => {
    if (!form.name || !form.company) return alert('Nama & Perusahaan wajib')
    if (editingId) {
      updateClient(editingId, { name: form.name!, company: form.company!, email: form.email||'', phone: form.phone||'', address: form.address||'', npwp: form.npwp })
    } else {
      addClient({ id: 'c'+Date.now(), name: form.name!, company: form.company!, email: form.email||'', phone: form.phone||'', address: form.address||'', npwp: form.npwp, createdAt: new Date().toISOString().slice(0,10) })
    }
    close()
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-[24px] font-semibold text-[#111827]">Clients</h1>
          <p className="text-[12px] text-[#6B7280]">{clients.length} clients • dummy + localStorage</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" /><Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari perusahaan / nama" className="pl-9 w-[260px] rounded-full bg-white" /></div>
          <Button onClick={openAdd}><Plus className="w-4 h-4" /> Client Baru</Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.map(c => (
          <Card key={c.id} className="p-4 hover:border-[#D1D5DB] transition-colors group">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEdit(c)}>
                <div className="text-[14px] font-medium text-[#111827] truncate">{c.company}</div>
                <div className="text-[12px] text-[#6B7280] truncate">{c.name} • {c.phone}</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(c)} className="p-1.5 rounded-full hover:bg-[#EFF6FF] text-[#9CA3AF] hover:text-[#2563EB] transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                <button onClick={()=>deleteClient(c.id)} className="p-1.5 rounded-full hover:bg-red-50 text-[#9CA3AF] hover:text-red-600 transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="text-[12px] text-[#6B7280] mt-3 line-clamp-2 cursor-pointer" onClick={() => openEdit(c)}>{c.address || <span className="text-[#9CA3AF] italic">Tidak ada alamat</span>}</div>
            <div className="text-[11px] text-[#9CA3AF] mt-2 truncate">{c.email || '—'}</div>
            {c.npwp && <div className="text-[11px] text-[#6B7280] mt-1">NPWP: {c.npwp}</div>}
          </Card>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50" onClick={close}>
          <div className="bg-white rounded-[16px] p-6 w-full max-w-[560px] border border-[#E5E7EB]" onClick={e=>e.stopPropagation()}>
            <h3 className="text-[16px] font-semibold text-[#111827]">{editingId ? 'Edit Client' : 'Client Baru'}</h3>
            <p className="text-[12px] text-[#6B7280] mt-1">{editingId ? 'Perbarui data client' : 'Tambah client baru'}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div><Label>Nama *</Label><Input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Budi Santoso" className="mt-1 rounded-full" /></div>
              <div><Label>Perusahaan *</Label><Input value={form.company} onChange={e=>setForm({...form, company:e.target.value})} placeholder="CV Barokah Jaya" className="mt-1 rounded-full" /></div>
              <div><Label>Email</Label><Input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="budi@barokah.id" className="mt-1 rounded-full" /></div>
              <div><Label>WA (+62)</Label><Input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="+6281234567890" className="mt-1 rounded-full" /></div>
              <div className="col-span-2"><Label>Alamat</Label><Input value={form.address} onChange={e=>setForm({...form, address:e.target.value})} placeholder="Jl. Merdeka No.12" className="mt-1 rounded-full" /></div>
              <div className="col-span-2"><Label>NPWP (opsional)</Label><Input value={form.npwp} onChange={e=>setForm({...form, npwp:e.target.value})} placeholder="01.234.567.8-012.000" className="mt-1 rounded-full" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-6"><Button variant="secondary" onClick={close}>Batal</Button><Button onClick={submit}>{editingId ? 'Simpan Perubahan' : 'Simpan'}</Button></div>
          </div>
        </div>
      )}
    </div>
  )
}
