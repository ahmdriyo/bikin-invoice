"use client"

import { useEffect, useState } from 'react'
import { sqlite } from '@/db/sqlite'
import { seedIfEmpty } from '@/db/seed'
import { useAppStore } from '@/store/useAppStore'

export function Providers({ children }: { children: React.ReactNode }) {
  const loadAll = useAppStore(s => s.loadAll)
  const ready = useAppStore(s => s.ready)
  const [booted, setBooted] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function boot() {
      try {
        await sqlite.init()
        await seedIfEmpty()
        ;(window as any).sqlite = sqlite
      } catch (e) {
        console.error('[DB] init failed', e)
      }
      if (!cancelled) {
        setBooted(true)
        loadAll().catch(e => console.error('[App] loadAll failed', e))
      }
    }
    boot()
    return () => { cancelled = true }
  }, [loadAll])

  // Tampilkan loading sampai booted + ready, tapi jangan blank putih
  if (!booted || !ready) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#111827] border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-[13px] text-[#6B7280] mt-3">Memuat database SQLite lokal...</div>
          <div className="text-[11px] text-[#9CA3AF] mt-1">Next.js 15 • SQLite WASM • IndexedDB</div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
