"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { templateConfigs } from '@/db/defaultSeeder'
import { cn } from '@/lib/utils'

export default function Templates() {
  const [active, setActive] = useState<'minimal'|'corporate'|'creative'>('minimal')
  return (
    <div className="p-6">
      <h1 className="text-[24px] font-semibold text-[#111827]">Templates — Level 1</h1>
      <p className="text-[12px] text-[#6B7280]">Pilih template untuk invoice & kontrak. Level 1: warna, font, header.</p>

      <div className="grid grid-cols-3 gap-6 mt-6">
        {templateConfigs.map(t=> (
          <Card key={t.id} onClick={()=>setActive(t.id)} className={cn("p-0 overflow-hidden cursor-pointer transition-all", active===t.id?'ring-2 ring-[#111827] border-[#111827]':'hover:border-[#D1D5DB]')}>
            <div className="h-[140px] p-4 flex flex-col justify-between" style={{background: t.id==='corporate'?'#EFF6FF':t.id==='creative'?'#FEF3C7':'#FFFFFF', fontFamily: t.font==='Playfair'?'serif':undefined}}>
              <div className="flex justify-between items-start">
                <div className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[10px] font-bold text-white" style={{background: t.primaryColor}}>LOGO</div>
                <span className="text-[11px] px-2 py-1 rounded-full bg-white border border-[#E5E7EB]">INVOICE</span>
              </div>
              <div>
                <div className="text-[12px] font-semibold" style={{color: t.primaryColor}}>{t.name}</div>
                <div className="text-[11px] text-[#6B7280]">{t.font} • {t.headerStyle}</div>
              </div>
            </div>
            <div className="p-4">
              <div className="text-[14px] font-medium text-[#111827]">{t.name}</div>
              <div className="text-[12px] text-[#6B7280]">Primary {t.primaryColor} • {t.font}</div>
              <div className={`mt-3 text-[12px] px-3 py-1.5 rounded-full text-center border ${active===t.id?'bg-[#111827] text-white border-[#111827]':'bg-white text-[#6B7280] border-[#E5E7EB]'}`}>{active===t.id?'Aktif':'Pilih'}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 mt-6">
        <h3 className="text-[14px] font-medium">Config JSON (Level 1)</h3>
        <pre className="mt-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-[12px] p-4 text-[12px] overflow-auto">{JSON.stringify(templateConfigs.find(t=>t.id===active), null, 2)}</pre>
        <p className="text-[11px] text-[#9CA3AF] mt-2">Config Level 1 — disimpan di SQLite lokal (seeder) & dipakai untuk preview/PDF. Sumber: <code>src/db/defaultSeeder.ts</code></p>
      </Card>
    </div>
  )
}
