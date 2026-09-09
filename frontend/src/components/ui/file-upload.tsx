/* eslint-disable @next/next/no-img-element */
import * as React from "react"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  label: string
  value?: string
  onChange: (value: string | undefined) => void
  accept?: string
  maxSizeMB?: number
  hint?: string
}

export function FileUpload({ label, value, onChange, accept = "image/png,image/jpeg,image/jpg,image/webp,image/svg+xml", maxSizeMB = 2, hint }: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleFile = (file: File) => {
    setError(null)
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File terlalu besar (maks ${maxSizeMB}MB)`)
      return
    }
    if (!file.type.startsWith("image/")) {
      setError("Hanya file gambar yang diperbolehkan")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      onChange(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <div className="text-[12px] font-medium text-[#374151] mb-1">{label}</div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative border border-dashed rounded-[12px] bg-[#F9FAFB] flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden",
          dragOver ? "border-[#111827] bg-[#F3F4F6]" : "border-[#E5E7EB] hover:border-[#D1D5DB] hover:bg-white",
          value ? "h-auto p-0" : "h-[140px] p-4"
        )}
      >
        {value ? (
          <div className="relative w-full">
            <img src={value} alt={label} className="w-full h-[140px] object-contain bg-white p-2" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(undefined); if (inputRef.current) inputRef.current.value = "" }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center hover:bg-red-50 text-[#6B7280] hover:text-red-600 shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[11px] py-1.5 text-center">
              Klik atau drop untuk ganti
            </div>
          </div>
        ) : (
          <>
            <div className="w-9 h-9 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center mb-2">
              <Upload className="w-4 h-4 text-[#6B7280]" />
            </div>
            <div className="text-[12px] font-medium text-[#111827]">Klik atau drag & drop</div>
            <div className="text-[11px] text-[#9CA3AF] text-center mt-1">
              {hint || `PNG, JPG, WEBP, SVG (maks ${maxSizeMB}MB)`}
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
      </div>
      {error && <div className="text-[11px] text-red-600 mt-1">{error}</div>}
      {!value && (
        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#9CA3AF]">
          <ImageIcon className="w-3 h-3" /> Atau paste URL di bawah jika mau
        </div>
      )}
    </div>
  )
}
