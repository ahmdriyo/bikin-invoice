import { seederClausesMock } from "@/db/defaultSeeder"

export async function generateContractMock(opts: {
  duration: string
  revisi: string
  warranty: string
  materai: boolean
  signCount: number
  party1Name: string
  party2Name: string
  projectTitle: string
  price: number
  ipRights: string
  termin: string
}) {
  await new Promise(r => setTimeout(r, 1500))
  const priceStr = `Rp ${opts.price.toLocaleString('id-ID')}`
  const revisiStr = opts.revisi === 'unlimited' ? 'tanpa batas selama scope' : `${opts.revisi}x`
  const warrantyStr = opts.warranty === 'none' ? 'tanpa garansi' : `${opts.warranty} hari`
  const ipStr = opts.ipRights === 'client' ? 'milik Client setelah pelunasan' : opts.ipRights === 'dev' ? 'milik Developer hingga pelunasan' : 'bagi pakai'
  const terminStr = opts.termin === '50/50' ? 'DP 50% — Pelunasan 50%' : opts.termin === '25/75' ? 'DP 25% — Pelunasan 75%' : opts.termin === '30/40/30' ? '30% — 40% — 30%' : opts.termin === '100' ? '100% di Awal' : opts.termin === '4x' ? '4x Termin 25%' : opts.termin

  return seederClausesMock.map((c, idx) => ({
    id: `cl-${Date.now()}-${idx}`,
    title: c.title,
    content: c.content
      .replaceAll('{{project_title}}', opts.projectTitle || 'Proyek Website')
      .replaceAll('{{price}}', priceStr)
      .replaceAll('{{duration}}', opts.duration)
      .replaceAll('{{revisi}}', revisiStr)
      .replaceAll('{{warranty}}', warrantyStr)
      .replaceAll('{{ipRights}}', ipStr)
      .replaceAll('{{termin}}', terminStr)
      .replaceAll('{{client_name}}', opts.party2Name)
      .replaceAll('{{signCount}}', String(opts.signCount)),
    order: idx + 1,
    enabled: true,
  }))
}
