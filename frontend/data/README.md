# Data — SQLite Default Seeder

- `bikin-invoice.db` (68 KB) — **default seeder** yang otomatis ter-load saat clone fresh. Isi: 10 clients, 8 projects, 12 invoices, 6 kontrak + settings Arka Studio. File ini di-commit agar opensource langsung ada data demo.
- `seed.sql` — schema dump (untuk referensi)
- Export user: via **Settings → Export .db** → simpan di sini sebagai `bikin-invoice-YYYY-MM-DD.db` jika mau backup/share.

Seeder di-generate via:

```bash
cd frontend
npm run seed        # generate data/bikin-invoice.db + frontend/public/bikin-invoice.db
```

Browser akan fetch `/bikin-invoice.db` saat IndexedDB kosong (lihat `src/db/sqlite.ts`).
