"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, FolderKanban, FileText, FileSignature, Palette, Settings, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/contracts', label: 'Kontrak', icon: FileSignature },
  { href: '/templates', label: 'Templates', icon: Palette },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const reset = useAppStore(s => s.resetDummy)
  return (
    <aside className="w-[240px] shrink-0 bg-[#F9FAFB] border-r border-[#E5E7EB] flex flex-col h-screen sticky top-0 no-print">
      <div className="px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[8px] bg-[#111827] flex items-center justify-center text-white text-[12px] font-bold">BI</div>
          <div>
            <div className="text-[14px] font-semibold text-[#111827] leading-none">Bikin Invoice</div>
            <div className="text-[11px] text-[#6B7280]">Arka Studio</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {nav.map(item => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-full text-[14px] transition-colors",
                isActive ? "bg-[#F3F4F6] text-[#111827] font-medium" : "text-[#6B7280] hover:bg-white hover:text-[#111827]"
              )}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-[#E5E7EB]">
        <button onClick={() => reset()} className="w-full flex items-center gap-2 px-3 py-2 rounded-full text-[12px] text-[#6B7280] hover:bg-white hover:text-[#111827] border border-transparent hover:border-[#E5E7EB]">
          <RotateCcw className="w-4 h-4" /> Reset Dummy
        </button>
        <div className="mt-3 px-3 text-[11px] text-[#9CA3AF] leading-relaxed">
          Next.js 15 • SQLite WASM<br/>AI Kontrak: Mock
        </div>
      </div>
    </aside>
  )
}
