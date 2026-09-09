"use client"

import { useAppStore } from '@/store/useAppStore'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/ui/file-upload'
import { useEffect, useState } from 'react'
import { sqlite } from '@/db/sqlite'

export default function Settings() {
  const { settings, updateSettings, exportDB, importDB, clearRealData, resetDummy } = useAppStore()
  const [form, setForm] = useState(settings)
  const [stats, setStats] = useState<{clients:number;projects:number;invoices:number;contracts:number} | null>(null)

  useEffect(() => { setForm(settings) }, [settings])
  useEffect(() => {
    sqlite.getStats().then((s)=> setStats(s as any)).catch(()=>{})
  }, [settings])

  const save = async () => { await updateSettings(form); alert('Settings disimpan di SQLite lokal (IndexedDB)') }

  return (
    <div className="p-6 max-w-[800px]">
      <h1 className="text-[24px] font-semibold text-[#111827]">Settings</h1>
      <p className="text-[12px] text-[#6B7280]">Profil usaha — dipakai di header invoice & kontrak. Penyimpanan: <span className="font-medium text-[#111827]">SQLite lokal (sql.js + IndexedDB)</span> — file <code className="px-1 py-0.5 bg-[#F3F4F6] rounded text-[11px]">bikin-invoice.db</code> di browser, opensource, tanpa backend/deploy.</p>
      {stats && (
        <div className="mt-3 flex gap-2 text-[11px]">
          <span className="px-2.5 py-1 rounded-full bg-white border border-[#E5E7EB]">{stats.clients} clients</span>
          <span className="px-2.5 py-1 rounded-full bg-white border border-[#E5E7EB]">{stats.projects} projects</span>
          <span className="px-2.5 py-1 rounded-full bg-white border border-[#E5E7EB]">{stats.invoices} invoices</span>
          <span className="px-2.5 py-1 rounded-full bg-white border border-[#E5E7EB]">{stats.contracts} kontrak</span>
          <span className="ml-auto text-[#6B7280]">SQLite WASM • IndexedDB • lokal</span>
        </div>
      )}

      <Card className="p-6 mt-6">
        <h3 className="text-[14px] font-medium mb-4">Profil Usaha</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><Label>Nama Usaha</Label><Input value={form.businessName} onChange={e=>setForm({...form, businessName:e.target.value})} className="mt-1 rounded-full" /></div>
          <div className="col-span-2"><Label>Alamat</Label><Input value={form.address} onChange={e=>setForm({...form, address:e.target.value})} className="mt-1 rounded-full" /></div>
          <div><Label>Telepon</Label><Input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} className="mt-1 rounded-full" /></div>
          <div><Label>Email</Label><Input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="mt-1 rounded-full" /></div>
          <div><Label>NPWP</Label><Input value={form.npwp} onChange={e=>setForm({...form, npwp:e.target.value})} className="mt-1 rounded-full" /></div>
          <div><Label>Bank</Label><Input value={form.bankName} onChange={e=>setForm({...form, bankName:e.target.value})} className="mt-1 rounded-full" /></div>
          <div><Label>No. Rekening</Label><Input value={form.bankAccount} onChange={e=>setForm({...form, bankAccount:e.target.value})} className="mt-1 rounded-full" /></div>
          <div><Label>Atas Nama</Label><Input value={form.bankHolder} onChange={e=>setForm({...form, bankHolder:e.target.value})} className="mt-1 rounded-full" /></div>
          <div className="col-span-2"><Label>Default Terms</Label><Textarea value={form.defaultTerms} onChange={e=>setForm({...form, defaultTerms:e.target.value})} className="mt-1" /></div>
          <div className="col-span-2"><Label>Default Notes</Label><Textarea value={form.defaultNotes} onChange={e=>setForm({...form, defaultNotes:e.target.value})} className="mt-1" /></div>
        </div>
        <Button onClick={save} className="mt-6">Simpan</Button>
      </Card>

      <Card className="p-6 mt-4">
        <h3 className="text-[14px] font-medium">Logo & Tanda Tangan</h3>
        <p className="text-[12px] text-[#6B7280] mt-1">Upload file (drag & drop) atau pakai URL. Disimpan di SQLite lokal (base64), tampil otomatis di preview Invoice & Kontrak. Nanti bisa export .db.</p>
        <div className="grid grid-cols-2 gap-6 mt-4">
          <FileUpload label="Logo Perusahaan" value={form.logoUrl} onChange={(v) => setForm({ ...form, logoUrl: v })} hint="PNG/JPG/WEBP/SVG maks 2MB — tampil di header invoice" />
          <FileUpload label="Tanda Tangan" value={form.signatureUrl} onChange={(v) => setForm({ ...form, signatureUrl: v })} hint="PNG transparan ideal maks 2MB — tampil di footer invoice & TTD kontrak" />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div><Label>Logo URL (alternatif)</Label><Input value={form.logoUrl||''} onChange={e=>setForm({...form, logoUrl:e.target.value})} placeholder="https://... atau biarkan jika sudah upload file" className="mt-1 rounded-full" /></div>
          <div><Label>TTD URL (alternatif)</Label><Input value={form.signatureUrl||''} onChange={e=>setForm({...form, signatureUrl:e.target.value})} placeholder="https://... atau biarkan jika sudah upload file" className="mt-1 rounded-full" /></div>
        </div>
        {(form.logoUrl || form.signatureUrl) && (
          <div className="mt-4 p-3 rounded-[12px] bg-[#F9FAFB] border border-[#E5E7EB] flex items-center gap-4">
            <div className="flex-1">
              <div className="text-[11px] font-medium text-[#111827]">Preview di Dokumen</div>
              <div className="text-[11px] text-[#6B7280]">Logo muncul di header invoice (kiri atas), TTD di footer invoice & halaman TTD kontrak.</div>
            </div>
            <div className="flex gap-3">
              {form.logoUrl && <img src={form.logoUrl} alt="logo" className="w-10 h-10 object-contain bg-white border border-[#E5E7EB] rounded-[8px] p-1" />}
              {form.signatureUrl && <img src={form.signatureUrl} alt="ttd" className="w-16 h-10 object-contain bg-white border border-[#E5E7EB] rounded-[8px] p-1" />}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-6 mt-4">
        <h3 className="text-[14px] font-medium">Database Lokal (SQLite)</h3>
        <p className="text-[12px] text-[#6B7280] mt-1">Semua data (clients, projects, invoices, kontrak, settings) disimpan di <span className="font-medium">SQLite WASM</span> di browser (IndexedDB). File fisik <code className="px-1 py-0.5 bg-[#F3F4F6] rounded">bikin-invoice.db</code> bisa di-export/import untuk backup atau dishare sebagai opensource. Tidak perlu backend/deploy.</p>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button variant="secondary" onClick={exportDB}>⬇ Export .db</Button>
          <label className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[14px] font-medium transition-colors border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] h-9 px-5 cursor-pointer">
            ⬆ Import .db
            <input type="file" accept=".db,.sqlite,.sqlite3" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0]
              if (file) { await importDB(file); alert('Import berhasil'); location.reload() }
            }} />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Button variant="secondary" onClick={async () => { if (confirm('Hapus semua data real & mulai kosong? (settings tetap)')) { await clearRealData(); location.reload() } }}>🗑 Mulai Data Real (Kosong)</Button>
          <Button variant="secondary" onClick={async () => { if (confirm('Reset ke dummy awal? Data real akan hilang')) { await resetDummy(); location.reload() } }}>↺ Reset Dummy</Button>
        </div>
        <div className="text-[11px] text-[#9CA3AF] mt-3">
          <div>• <b>Data Real:</b> Klik “Mulai Data Real (Kosong)” untuk hapus dummy & mulai isi client/project/invoice/kontrak beneran. Data tersimpan lokal, bisa export .db kapan saja.</div>
          <div>• <b>Opensource:</b> Cukup <code>npm install && npm run dev</code> — tanpa env, tanpa Cloudflare, tanpa R2/D1.</div>
          <div>• <b>Lokasi file:</b> Browser IndexedDB → key `bikin-invoice-sqlite`. Export untuk dapat file `bikin-invoice-YYYY-MM-DD.db` di folder project jika mau commit.</div>
        </div>
      </Card>

      <Card className="p-4 mt-4 bg-[#F9FAFB] border-dashed">
        <div className="text-[12px] font-medium text-[#111827]">Cara Pakai Data Real (Lokal)</div>
        <ol className="text-[11px] text-[#6B7280] mt-2 list-decimal list-inside space-y-1">
          <li>Klik “Mulai Data Real (Kosong)” di atas</li>
          <li>Buat Client & Project baru di menu Clients/Projects</li>
          <li>Buat Invoice (dropdown Opsi A) & Kontrak (dropdown Opsi B + Generate AI Mock)</li>
          <li>Export .db secara berkala untuk backup — file bisa di-commit ke repo sebagai `data/bikin-invoice.db` jika mau</li>
        </ol>
      </Card>
    </div>
  )
}
