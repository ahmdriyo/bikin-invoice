"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Download } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatRupiahShort } from "@/lib/utils";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import type { Invoice, InvoiceItem } from "@/types";

function calcTotal(
  items: InvoiceItem[],
  discountType: "percent" | "fixed",
  discountValue: number,
  taxMode: string,
) {
  const subtotal = items.reduce(
    (a, b) => a + (b.qty * b.price - b.discount),
    0,
  );
  const disc =
    discountType === "percent"
      ? Math.round((subtotal * discountValue) / 100)
      : discountValue;
  const afterDisc = subtotal - disc;
  const tax = taxMode === "add11" ? Math.round(afterDisc * 0.11) : 0;
  const total = afterDisc + tax;
  return { subtotal, disc, tax, total };
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
function calcDueDate(issueDate: string, dueMode: string) {
  const map: Record<string, number> = {
    "1": 1,
    "3": 3,
    "7": 7,
    "14": 14,
    "30": 30,
  };
  const days = map[dueMode];
  if (days === undefined) return null;
  return addDays(issueDate, days);
}
function dueLabel(m: string) {
  const map: Record<string, string> = {
    "1": "1 Hari",
    "3": "3 Hari",
    "7": "7 Hari",
    "14": "14 Hari",
    "30": "30 Hari",
    custom: "Tanggal Custom",
  };
  return map[m] || m;
}
function getPercent(mode?: string, custom?: number) {
  if (mode === "custom") return custom ?? 0;
  const n = parseInt(mode || "0", 10);
  return isNaN(n) ? 0 : n;
}
function statusLabel(s?: string) {
  const m: Record<string, string> = {
    proses: "Proses",
    selesai: "Selesai",
    draft: "Draft",
    planned: "Proses",
    in_progress: "Proses",
    done: "Selesai",
  };
  return m[s || ""] || s || "Proses";
}
function statusColor(s?: string) {
  if (s === "selesai" || s === "done") return "bg-[#ECFDF5] text-[#059669]";
  if (s === "proses" || s === "planned" || s === "in_progress")
    return "bg-[#FFFBEB] text-[#D97706]";
  return "bg-[#EFF6FF] text-[#2563EB]";
}

export default function InvoiceBuilder() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { invoices, clients, projects, settings, addInvoice, updateInvoice, deleteInvoice } =
    useAppStore();
  const isNew = id === "new";
  const existing = invoices.find((i) => i.id === id);

  const [form, setForm] = useState<Partial<Invoice>>(() => {
    if (existing) {
      // migrasi: jika invoice lama belum punya DP/Pelunasan terpisah, derive dari termin
      const hasDP = (existing as unknown as Invoice).terminDP;
      const hasPel = (existing as unknown as Invoice).terminPelunasan;
      const hasKind = (existing as unknown as Invoice).kind;
      // normalisasi status lama ke Indonesia
      let st: unknown = existing.status;
      if (st === "planned" || st === "in_progress") st = "proses";
      if (st === "done") st = "selesai";
      if (!hasDP || !hasPel) {
        const t = existing.termin;
        let dp: unknown = "50",
          pel: unknown = "50";
        if (t === "25/75") {
          dp = "25";
          pel = "75";
        } else if (t === "50/50") {
          dp = "50";
          pel = "50";
        } else if (t === "30/40/30") {
          dp = "30";
          pel = "30";
        } else if (t === "100") {
          dp = "100";
          pel = "100";
        } else if (t === "4x") {
          dp = "25";
          pel = "25";
        }
        return {
          ...existing,
          status: st,
          kind: hasKind || (st === "selesai" ? "pelunasan" : "dp"),
          terminDP: dp,
          terminPelunasan: pel,
        } as unknown as Partial<Invoice>;
      }
      return {
        ...existing,
        status: st,
        kind: hasKind || "dp",
      } as unknown as Partial<Invoice>;
    }
    const nextNum = `INV-2026-${String(invoices.length + 1).padStart(4, "0")}`;
    return {
      id: "inv" + Date.now(),
      number: nextNum,
      clientId: clients[0]?.id,
      projectId: projects[0]?.id,
      items: [
        {
          id: "it1",
          name: "Desain UI/UX",
          desc: "",
          qty: 1,
          unit: "paket",
          price: 1500000,
          discount: 0,
        },
      ],
      subtotal: 0,
      discountType: "fixed",
      discountValue: 0,
      taxMode: "none",
      taxValue: 0,
      total: 1500000,
      termin: "50/50",
      terminDP: "50",
      terminPelunasan: "50",
      kind: "dp",
      paymentMethod: "transfer",
      dueMode: "14",
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      issueDate: new Date().toISOString().slice(0, 10),
      lateFee: "none",
      extraCost: "none",
      notes: settings.defaultNotes,
      terms: settings.defaultTerms,
      templateId: "minimal",
      status: "proses",
      createdAt: new Date().toISOString().slice(0, 10),
    } as unknown as Partial<Invoice>;
  });

  const { subtotal, disc, tax, total } = useMemo(
    () =>
      calcTotal(
        form.items || [],
        form.discountType || "fixed",
        form.discountValue || 0,
        form.taxMode || "none",
      ),
    [form.items, form.discountType, form.discountValue, form.taxMode],
  );
  const dpPercent = getPercent(
    form.terminDP as unknown as string,
    form.terminDPCustom,
  );
  const pelPercent = getPercent(
    form.terminPelunasan as unknown as string,
    form.terminPelunasanCustom,
  );
  const dp = Math.round((total * dpPercent) / 100);
  const pelunasan = Math.round((total * pelPercent) / 100);
  const sisa = total - dp;
  const sumPercent = dpPercent + pelPercent;

  const addItem = () =>
    setForm({
      ...form,
      items: [
        ...(form.items || []),
        {
          id: "it" + Date.now(),
          name: "Item Baru",
          desc: "",
          qty: 1,
          unit: "paket",
          price: 0,
          discount: 0,
        },
      ],
    });
  const updateItem = (idx: number, patch: Partial<InvoiceItem>) =>
    setForm({
      ...form,
      items: form.items!.map((x, i) => (i === idx ? { ...x, ...patch } : x)),
    });
  const removeItem = (idx: number) =>
    setForm({ ...form, items: form.items!.filter((_, i) => i !== idx) });

  const save = () => {
    const termin = `${form.terminDP || "50"}/${form.terminPelunasan || "50"}`;
    const payload: Invoice = {
      ...(form as Invoice),
      termin: termin as unknown as Invoice["termin"],
      subtotal,
      total,
      taxValue: tax,
    };
    if (isNew) addInvoice(payload);
    else updateInvoice(payload.id, payload);
    router.push("/invoices");
  };

  const handleDelete = async () => {
    if (isNew || !form.id) return;
    if (!confirm(`Hapus invoice ${form.number}?\nTindakan ini tidak bisa dibatalkan dan data akan hilang permanen dari SQLite lokal.`)) return;
    await deleteInvoice(form.id as string);
    router.push("/invoices");
  };

  const download = async () => {
    const el = document.getElementById("invoice-pdf-content");
    if (!el) return window.print();
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let imgWidth = pageWidth;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;

      // PAKSA 1 HALAMAN SAJA: jika tinggi melebihi A4, scale down agar muat 1 halaman (odd page only = 1)
      if (imgHeight > pageHeight) {
        const scale = pageHeight / imgHeight;
        imgHeight = pageHeight;
        imgWidth = imgWidth * scale;
      }
      const x = (pageWidth - imgWidth) / 2;
      pdf.addImage(imgData, "PNG", x, 0, imgWidth, imgHeight);
      // Nomor halaman kanan bawah (selalu 1 / 1 karena 1 halaman)
      pdf.setFontSize(8);
      pdf.setTextColor("#9CA3AF");
      pdf.text(`1 / 1`, pageWidth - 10, pageHeight - 6, { align: "right" });
      pdf.save(`${form.number || "Invoice"}.pdf`);
    } catch {
      window.print();
    }
  };

  const handlePrint = () => {
    const el = document.getElementById(
      "invoice-pdf-content",
    ) as HTMLElement | null;
    if (!el) return window.print();
    // Scale down via CSS transform agar muat 1 halaman saat print (odd only)
    const a4HeightPx = 1122; // 297mm @ 96dpi
    const rect = el.getBoundingClientRect();
    const prevTransform = el.style.transform;
    const prevWidth = el.style.width;
    if (rect.height > a4HeightPx) {
      const scale = a4HeightPx / rect.height;
      el.style.transform = `scale(${scale})`;
      el.style.transformOrigin = "top left";
      el.style.width = `${100 / scale}%`;
    }
    const cleanup = () => {
      el.style.transform = prevTransform;
      el.style.width = prevWidth;
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
    // Fallback cleanup jika afterprint tidak fire
    setTimeout(cleanup, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="sticky top-0 z-10 bg-[#F9FAFB] border-b border-[#E5E7EB] px-6 py-4 flex items-center gap-4 no-print">
        <Link
          href="/invoices"
          className="p-2 rounded-full hover:bg-white border border-transparent hover:border-[#E5E7EB]"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-[18px] font-semibold text-[#111827]">
            {isNew ? "Invoice Baru" : "Edit Invoice"} — {form.number}
          </h1>
          <p className="text-[12px] text-[#6B7280]">
            Manual dropdown Opsi A • tanpa AI • preview realtime
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          {!isNew && (
            <Button variant="secondary" onClick={handleDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
              <Trash2 className="w-4 h-4" /> Hapus
            </Button>
          )}
          <Button variant="secondary" onClick={download}>
            <Download className="w-4 h-4" /> Download PDF
          </Button>
          <Button
            variant="secondary"
            onClick={handlePrint}
            className="hidden sm:inline-flex"
          >
            Print
          </Button>
          <Button onClick={save}>Simpan</Button>
        </div>
      </div>

      <div className="grid grid-cols-[1.1fr_0.9fr] gap-6 p-6 print:grid-cols-1">
        {/* FORM KIRI */}
        <div className="space-y-4 no-print">
          <Card className="p-5">
            <h3 className="text-[14px] font-medium text-[#111827] mb-4">
              Client & Project
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Client *</Label>
                <Select
                  value={form.clientId}
                  onChange={(e) =>
                    setForm({ ...form, clientId: e.target.value })
                  }
                  className="mt-1"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company} — {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Project</Label>
                <Select
                  value={form.projectId}
                  onChange={(e) =>
                    setForm({ ...form, projectId: e.target.value })
                  }
                  className="mt-1"
                >
                  <option value="">— Tanpa Project —</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>No. Invoice</Label>
                <Input
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as unknown as Invoice["status"],
                    })
                  }
                  className="mt-1"
                >
                  <option value="proses">Proses</option>
                  <option value="selesai">Selesai</option>
                  <option value="draft">Draft</option>
                </Select>
              </div>
              <div>
                <Label>Tgl Terbit</Label>
                <Input
                  type="date"
                  value={form.issueDate}
                  onChange={(e) => {
                    const issue = e.target.value;
                    const auto = calcDueDate(issue, form.dueMode || "14");
                    setForm((prev) => ({
                      ...prev,
                      issueDate: issue,
                      ...(auto ? { dueDate: auto } : {}),
                    }));
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Template</Label>
                <Select
                  value={form.templateId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      templateId: e.target
                        .value as unknown as Invoice["templateId"],
                    })
                  }
                  className="mt-1"
                >
                  <option value="minimal">Minimal</option>
                  <option value="corporate">Corporate</option>
                  <option value="creative">Creative</option>
                </Select>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-medium">Tabel Item</h3>
              <Button size="sm" onClick={addItem}>
                <Plus className="w-4 h-4" /> Tambah Item
              </Button>
            </div>
            <div className="space-y-3">
              {(form.items || []).map((it, idx) => (
                <div
                  key={it.id}
                  className="grid grid-cols-[1.4fr_0.6fr_0.6fr_0.8fr_40px] gap-2 items-end bg-[#F9FAFB] p-3 rounded-[12px] border border-[#E5E7EB]"
                >
                  <div>
                    <Label className="text-[11px]">Nama</Label>
                    <Input
                      value={it.name}
                      onChange={(e) =>
                        updateItem(idx, { name: e.target.value })
                      }
                      className="mt-1 h-8 text-[13px] rounded-full"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px]">Qty</Label>
                    <Input
                      type="number"
                      value={it.qty}
                      onChange={(e) =>
                        updateItem(idx, { qty: Number(e.target.value) })
                      }
                      className="mt-1 h-8 rounded-full"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px]">Satuan</Label>
                    <Select
                      value={it.unit}
                      onChange={(e) =>
                        updateItem(idx, { unit: e.target.value })
                      }
                      className="mt-1 h-8 text-[12px]"
                    >
                      <option>paket</option>
                      <option>pcs</option>
                      <option>hari</option>
                      <option>bulan</option>
                      <option>tahun</option>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[11px]">Harga</Label>
                    <Input
                      type="number"
                      value={it.price}
                      onChange={(e) =>
                        updateItem(idx, { price: Number(e.target.value) })
                      }
                      className="mt-1 h-8 rounded-full"
                    />
                  </div>
                  <button
                    onClick={() => removeItem(idx)}
                    className="h-8 w-8 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center hover:bg-red-50 text-[#9CA3AF] hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="col-span-5">
                    <Input
                      value={it.desc}
                      onChange={(e) =>
                        updateItem(idx, { desc: e.target.value })
                      }
                      placeholder="Deskripsi (opsional)"
                      className="h-8 text-[12px] rounded-full bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-[14px] font-medium mb-2">
              Ketentuan — Skema Terpisah (Disarankan)
            </h3>
            <p className="text-[11px] text-[#6B7280] mb-4">
              Pilih jenis invoice yang akan dibuat.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Jenis Invoice *</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        kind: "dp" as unknown as Invoice["kind"],
                      })
                    }
                    className={`p-3 rounded-[12px] border text-left ${form.kind === "dp" ? "bg-[#111827] text-white border-[#111827]" : "bg-white border-[#E5E7EB] hover:bg-[#F9FAFB]"}`}
                  >
                    <div className="text-[13px] font-medium">Invoice DP</div>
                    <div
                      className={`text-[11px] ${form.kind === "dp" ? "text-white/80" : "text-[#6B7280]"}`}
                    >
                      Terbit di awal • Tagih DP ({dpPercent}%)
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        kind: "pelunasan" as unknown as Invoice["kind"],
                      })
                    }
                    className={`p-3 rounded-[12px] border text-left ${form.kind === "pelunasan" ? "bg-[#111827] text-white border-[#111827]" : "bg-white border-[#E5E7EB] hover:bg-[#F9FAFB]"}`}
                  >
                    <div className="text-[13px] font-medium">
                      Invoice Pelunasan
                    </div>
                    <div
                      className={`text-[11px] ${form.kind === "pelunasan" ? "text-white/80" : "text-[#6B7280]"}`}
                    >
                      Terbit setelah selesai • Tagih sisa ({pelPercent}%)
                    </div>
                  </button>
                </div>
              </div>
              <div>
                <Label>DP Awal *</Label>
                <Select
                  value={form.terminDP}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      terminDP: e.target
                        .value as unknown as Invoice["terminDP"],
                    })
                  }
                  className="mt-1"
                >
                  <option value="50">DP 50%</option>
                  <option value="25">DP 25%</option>
                  <option value="30">DP 30%</option>
                  <option value="2">DP 2%</option>
                  <option value="100">DP 100%</option>
                  <option value="custom">Custom</option>
                </Select>
                {form.terminDP === "custom" && (
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={form.terminDPCustom ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        terminDPCustom: Number(e.target.value),
                      })
                    }
                    placeholder="DP %"
                    className="mt-2 rounded-full"
                  />
                )}
              </div>
              <div>
                <Label>Pelunasan *</Label>
                <Select
                  value={form.terminPelunasan}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      terminPelunasan: e.target
                        .value as unknown as Invoice["terminPelunasan"],
                    })
                  }
                  className="mt-1"
                >
                  <option value="50">Pelunasan 50%</option>
                  <option value="75">Pelunasan 75%</option>
                  <option value="70">Pelunasan 70%</option>
                  <option value="30">Pelunasan 30%</option>
                  <option value="98">Pelunasan 98%</option>
                  <option value="100">Pelunasan 100%</option>
                  <option value="custom">Custom</option>
                </Select>
                {form.terminPelunasan === "custom" && (
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={form.terminPelunasanCustom ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        terminPelunasanCustom: Number(e.target.value),
                      })
                    }
                    placeholder="Pelunasan %"
                    className="mt-2 rounded-full"
                  />
                )}
              </div>
              {sumPercent !== 100 && (
                <div className="col-span-2 text-[11px] px-3 py-2 rounded-[8px] bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E]">
                  Total DP ({dpPercent}%) + Pelunasan ({pelPercent}%) ={" "}
                  {sumPercent}% — idealnya 100%.{" "}
                  {sumPercent > 100 ? "Melebihi total!" : "Masih ada sisa."}
                </div>
              )}
              <div>
                <Label>Metode Pembayaran</Label>
                <Select
                  value={form.paymentMethod}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      paymentMethod: e.target
                        .value as unknown as Invoice["paymentMethod"],
                    })
                  }
                  className="mt-1"
                >
                  <option value="transfer">Transfer Bank</option>
                  <option value="qris">QRIS</option>
                  <option value="cash">Cash</option>
                  <option value="termin">Termin Bertahap</option>
                </Select>
              </div>
              <div>
                <Label>PPN</Label>
                <Select
                  value={form.taxMode}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      taxMode: e.target.value as unknown as Invoice["taxMode"],
                    })
                  }
                  className="mt-1"
                >
                  <option value="none">Tanpa PPN</option>
                  <option value="11%">PPN 11% Ditambahkan</option>
                  <option value="include">PPN Sudah Termasuk</option>
                </Select>
              </div>
              <div>
                <Label>Jatuh Tempo</Label>
                <Select
                  value={form.dueMode}
                  onChange={(e) => {
                    const mode = e.target.value;
                    const auto = calcDueDate(
                      form.issueDate || new Date().toISOString().slice(0, 10),
                      mode,
                    );
                    setForm((prev) => ({
                      ...prev,
                      dueMode: mode as unknown as Invoice["dueMode"],
                      ...(auto ? { dueDate: auto } : {}),
                    }));
                  }}
                  className="mt-1"
                >
                  <option value="1">1 Hari</option>
                  <option value="3">3 Hari</option>
                  <option value="7">7 Hari</option>
                  <option value="14">14 Hari</option>
                  <option value="30">30 Hari</option>
                  <option value="custom">Tanggal Custom</option>
                </Select>
              </div>
              <div>
                <Label>Denda Keterlambatan</Label>
                <Select
                  value={form.lateFee}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lateFee: e.target.value as unknown as Invoice["lateFee"],
                    })
                  }
                  className="mt-1"
                >
                  <option value="none">Tanpa Denda</option>
                  <option value="1day">1% per Hari</option>
                  <option value="1week">1% per Minggu</option>
                  <option value="custom">Custom</option>
                </Select>
              </div>
              <div>
                <Label>Biaya Tambahan</Label>
                <Select
                  value={form.extraCost}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      extraCost: e.target
                        .value as unknown as Invoice["extraCost"],
                    })
                  }
                  className="mt-1"
                >
                  <option value="none">Tanpa Biaya Tambahan</option>
                  <option value="revisi">Revisi di luar scope Rp/hari</option>
                  <option value="maintenance">Maintenance opsional</option>
                </Select>
              </div>
              <div>
                <Label>Jatuh Tempo Tanggal</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                  className="mt-1 rounded-full"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label>Diskon Tipe</Label>
                  <Select
                    value={form.discountType}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discountType: e.target
                          .value as unknown as Invoice["discountType"],
                      })
                    }
                    className="mt-1"
                  >
                    <option value="fixed">Rp</option>
                    <option value="percent">%</option>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label>Nilai Diskon</Label>
                  <Input
                    type="number"
                    value={form.discountValue}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        discountValue: Number(e.target.value),
                      })
                    }
                    className="mt-1 rounded-full"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <Label>Catatan</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Terima kasih..."
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label>Syarat & Ketentuan</Label>
                <Textarea
                  value={form.terms}
                  onChange={(e) => setForm({ ...form, terms: e.target.value })}
                  placeholder="DP 50%..."
                  className="mt-1"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* PREVIEW KANAN */}
        <div id="invoice-preview" className="sticky top-[76px] h-fit">
          <Card
            id="invoice-preview-document"
            className="p-0 overflow-hidden print:border-none print:shadow-none"
          >
            <div className="preview-bar px-5 py-3 border-b border-[#E5E7EB] flex items-center justify-between bg-[#F9FAFB] no-print">
              <span className="text-[12px] font-medium text-[#111827]">
                Preview A4 — {form.templateId}
              </span>
              <span className="text-[11px] text-[#6B7280]">Live &lt;300ms</span>
            </div>
            <div id="invoice-pdf-content" className="p-6 bg-white">
              {/* Header */}
              <div
                className={`flex justify-between items-start pb-4 border-b ${form.templateId === "corporate" ? "bg-[#EFF6FF] -mx-6 -mt-6 px-6 pt-6 border-[#1E3A8A]" : ""}`}
              >
                <div className="flex gap-3 items-start">
                  {settings.logoUrl && (
                    <img
                      src={settings.logoUrl}
                      alt="Logo"
                      className="w-10 h-10 object-contain rounded-[8px] border border-[#E5E7EB] bg-white p-1 shrink-0"
                    />
                  )}
                  <div>
                    <div
                      className="text-[18px] font-bold text-[#111827]"
                      style={{
                        fontFamily:
                          form.templateId === "creative" ? "serif" : undefined,
                      }}
                    >
                      {settings.businessName}
                    </div>
                    <div className="text-[11px] text-[#6B7280] mt-1">
                      {settings.address} • {settings.phone}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[16px] font-semibold text-[#111827]">
                    {form.kind === "pelunasan"
                      ? "INVOICE PELUNASAN"
                      : form.kind === "dp"
                        ? "INVOICE DP"
                        : "INVOICE"}
                  </div>
                  <div className="text-[11px] text-[#6B7280]">
                    {form.number} •{" "}
                    {form.kind === "pelunasan"
                      ? "Final"
                      : form.kind === "dp"
                        ? `DP ${dpPercent}%`
                        : ""}
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[11px] ${form.kind === "pelunasan" ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]" : form.kind === "dp" ? "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]" : "bg-[#F3F4F6] text-[#6B7280]"}`}
                    >
                      {form.kind === "pelunasan"
                        ? "Pelunasan"
                        : form.kind === "dp"
                          ? "DP"
                          : "Tagihan"}
                    </span>
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[11px] ${statusColor(form.status)}`}
                    >
                      {statusLabel(form.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-4 text-[12px]">
                <div>
                  <div className="text-[#9CA3AF] text-[11px] uppercase tracking-wide">
                    Tagihan Kepada
                  </div>
                  <div className="font-medium text-[#111827] mt-1">
                    {clients.find((c) => c.id === form.clientId)?.company}
                  </div>
                  <div className="text-[#6B7280]">
                    {clients.find((c) => c.id === form.clientId)?.name} •{" "}
                    {clients.find((c) => c.id === form.clientId)?.phone}
                  </div>
                  <div className="text-[#6B7280]">
                    {clients.find((c) => c.id === form.clientId)?.address}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[#6B7280]">
                    Tgl Terbit: {form.issueDate}
                  </div>
                  <div className="text-[#6B7280]">
                    Jatuh Tempo: {form.dueDate} (
                    {dueLabel(form.dueMode || "14")})
                  </div>
                  <div className="text-[#6B7280]">
                    Termin: DP {dpPercent}% - Pelunasan {pelPercent}% •{" "}
                    {form.paymentMethod}
                  </div>
                  <div className="text-[#6B7280]">PPN: {form.taxMode}</div>
                </div>
              </div>

              <div className="mt-6 border border-[#E5E7EB] rounded-[8px] overflow-hidden">
                <div className="grid grid-cols-[1.5fr_0.4fr_0.7fr_0.7fr] gap-2 px-3 py-2 bg-[#F9FAFB] text-[11px] font-medium text-[#6B7280] uppercase tracking-wide">
                  <span>Item</span>
                  <span>Qty</span>
                  <span>Harga</span>
                  <span className="text-right">Total</span>
                </div>
                {(form.items || []).map((it) => (
                  <div
                    key={it.id}
                    className="grid grid-cols-[1.5fr_0.4fr_0.7fr_0.7fr] gap-2 px-3 py-2.5 border-t border-[#E5E7EB] text-[12px]"
                  >
                    <div>
                      <div className="font-medium text-[#111827]">
                        {it.name}
                      </div>
                      <div className="text-[#9CA3AF] text-[11px]">
                        {it.desc}
                      </div>
                    </div>
                    <div className="text-[#6B7280]">
                      {it.qty} {it.unit}
                    </div>
                    <div className="text-[#6B7280]">
                      {formatRupiahShort(it.price)}
                    </div>
                    <div className="text-right font-medium text-[#111827]">
                      {formatRupiahShort(it.qty * it.price - it.discount)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <div className="w-[300px] space-y-1.5 text-[12px]">
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Subtotal</span>
                    <span>{formatRupiah(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Diskon</span>
                    <span>-{formatRupiah(disc)}</span>
                  </div>
                  {form.taxMode === "add11" && (
                    <div className="flex justify-between text-[#6B7280]">
                      <span>PPN 11%</span>
                      <span>{formatRupiah(tax)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold text-[#111827] border-t border-[#E5E7EB] pt-2 text-[14px]">
                    <span>
                      {form.kind === "pelunasan"
                        ? "Total Proyek"
                        : form.kind === "dp"
                          ? "Total Proyek"
                          : "Total"}
                    </span>
                    <span>{formatRupiah(total)}</span>
                  </div>
                  {/* Skema terpisah */}
                  {form.kind === "dp" ? (
                    <>
                      <div className="flex justify-between text-[#2563EB] font-bold bg-[#EFF6FF] px-2 py-1 rounded-full">
                        <span>Tagihan DP {dpPercent}%</span>
                        <span>{formatRupiah(dp)}</span>
                      </div>
                      <div className="flex justify-between text-[#6B7280]">
                        <span>Sisa Pelunasan ({pelPercent}%)</span>
                        <span>{formatRupiah(pelunasan)}</span>
                      </div>
                    </>
                  ) : form.kind === "pelunasan" ? (
                    <>
                      <div className="flex justify-between text-[#6B7280]">
                        <span>DP Sudah Dibayar {dpPercent}%</span>
                        <span>-{formatRupiah(dp)}</span>
                      </div>
                      <div className="flex justify-between text-[#059669] font-bold bg-[#ECFDF5] px-2 py-1 rounded-full border border-[#A7F3D0]">
                        <span>Tagihan Pelunasan {pelPercent}%</span>
                        <span>{formatRupiah(pelunasan)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-[#2563EB] font-medium">
                        <span>DP {dpPercent}%</span>
                        <span>{formatRupiah(dp)}</span>
                      </div>
                      <div className="flex justify-between text-[#059669] font-medium">
                        <span>Pelunasan {pelPercent}%</span>
                        <span>{formatRupiah(pelunasan)}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Sisa (Total - DP)</span>
                        <span>{formatRupiah(sisa)}</span>
                      </div>
                    </>
                  )}
                  {sumPercent !== 100 && (
                    <div className="text-[11px] text-[#92400E] bg-[#FFFBEB] border border-[#FDE68A] rounded-full px-2 py-1 text-center">
                      DP + Pelunasan = {sumPercent}%
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-6 text-[11px] leading-relaxed">
                <div>
                  <div className="font-medium text-[#111827]">Catatan</div>
                  <div className="text-[#6B7280] mt-1 whitespace-pre-wrap">
                    {form.notes}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-[#111827]">Syarat</div>
                  <div className="text-[#6B7280] mt-1 whitespace-pre-wrap">
                    {form.terms}
                  </div>
                  <div className="text-[#9CA3AF] mt-2">
                    Denda: {form.lateFee} • Biaya tambahan: {form.extraCost}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#E5E7EB] grid grid-cols-2 gap-6 text-[11px]">
                <div>
                  <div className="text-[#6B7280]">Transfer ke:</div>
                  <div className="font-medium text-[#111827]">
                    {settings.bankName} — {settings.bankAccount} a.n{" "}
                    {settings.bankHolder}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-[#6B7280]">Hormat kami,</div>
                  <div className="h-[60px] flex items-center justify-center border border-dashed border-[#E5E7EB] rounded-[8px] mt-2 bg-white overflow-hidden p-1">
                    {settings.signatureUrl ? (
                      <img
                        src={settings.signatureUrl}
                        alt="TTD"
                        className="max-h-[50px] max-w-[120px] object-contain"
                      />
                    ) : (
                      <span className="text-[#9CA3AF] text-[11px]">TTD</span>
                    )}
                  </div>
                  <div className="font-medium text-[#111827] mt-2">
                    {settings.businessName}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
