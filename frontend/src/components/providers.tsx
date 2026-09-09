"use client"

import { useEffect, useState } from 'react'
import { sqlite } from '@/db/sqlite'
import { seedIfEmpty } from '@/db/seed'
import { useAppStore } from '@/store/useAppStore'

function AppSkeleton() {
  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* Sidebar skeleton */}
      <aside className="w-[240px] shrink-0 bg-[#F9FAFB] border-r border-[#E5E7EB] flex flex-col h-screen sticky top-0">
        <div className="px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-[#E5E7EB] animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-24 bg-[#E5E7EB] rounded-full animate-pulse" />
              <div className="h-2 w-16 bg-[#E5E7EB] rounded-full animate-pulse" />
            </div>
          </div>
        </div>
        <div className="flex-1 px-3 space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-[38px] bg-white border border-[#E5E7EB] rounded-full animate-pulse"
              style={{ opacity: 0.5 + i * 0.06 }}
            />
          ))}
        </div>
        <div className="p-3 border-t border-[#E5E7EB] space-y-3">
          <div className="h-8 bg-white border border-[#E5E7EB] rounded-full animate-pulse" />
          <div className="h-3 w-24 bg-[#E5E7EB] rounded-full animate-pulse" />
        </div>
      </aside>

      {/* Main skeleton */}
      <main className="flex-1 min-w-0">
        <div className="px-6 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <div className="h-6 w-28 bg-[#E5E7EB] rounded-full animate-pulse" />
              <div className="h-3 w-72 bg-[#E5E7EB] rounded-full animate-pulse" />
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="h-9 w-[300px] bg-white border border-[#E5E7EB] rounded-full animate-pulse hidden lg:block" />
              <div className="h-9 w-28 bg-[#E5E7EB] rounded-full animate-pulse" />
              <div className="h-9 w-28 bg-white border border-[#E5E7EB] rounded-full animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[88px] bg-white border border-[#E5E7EB] rounded-[12px] p-4 space-y-3 animate-pulse">
                <div className="h-3 w-20 bg-[#F3F4F6] rounded-full" />
                <div className="h-5 w-16 bg-[#E5E7EB] rounded-full" />
                <div className="h-3 w-14 bg-[#F3F4F6] rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <div className="h-4 w-36 bg-[#E5E7EB] rounded-full animate-pulse" />
            <div className="flex gap-6 overflow-hidden">
              {Array.from({ length: 3 }).map((_, col) => (
                <div key={col} className="w-[320px] shrink-0 space-y-3">
                  <div className="h-8 bg-white border border-[#E5E7EB] rounded-full animate-pulse" />
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((__, k) => (
                      <div key={k} className="h-[110px] bg-white border border-[#E5E7EB] rounded-[12px] p-4 space-y-3 animate-pulse">
                        <div className="flex items-center justify-between">
                          <div className="h-5 w-16 bg-[#EFF6FF] rounded-full" />
                          <div className="h-3 w-20 bg-[#F3F4F6] rounded-full" />
                        </div>
                        <div className="h-4 w-32 bg-[#E5E7EB] rounded-full" />
                        <div className="h-3 w-24 bg-[#F3F4F6] rounded-full" />
                        <div className="h-3 w-full bg-[#F3F4F6] rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="h-4 w-36 bg-[#E5E7EB] rounded-full animate-pulse" />
            <div className="flex gap-6 overflow-hidden">
              {Array.from({ length: 3 }).map((_, col) => (
                <div key={col} className="w-[320px] shrink-0 space-y-3">
                  <div className="h-8 bg-white border border-[#E5E7EB] rounded-full animate-pulse" />
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((__, k) => (
                      <div key={k} className="h-[110px] bg-white border border-[#E5E7EB] rounded-[12px] p-4 space-y-3 animate-pulse">
                        <div className="flex items-center justify-between">
                          <div className="h-5 w-16 bg-[#EFF6FF] rounded-full" />
                          <div className="h-3 w-20 bg-[#F3F4F6] rounded-full" />
                        </div>
                        <div className="h-4 w-40 bg-[#E5E7EB] rounded-full" />
                        <div className="h-3 w-28 bg-[#F3F4F6] rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

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

  if (!booted || !ready) {
    return <AppSkeleton />
  }

  return <>{children}</>
}
