'use client'

import { useRef, useState } from 'react'
import { ImageUp, X } from 'lucide-react'

export function LogoUpload({
  logo,
  onChange,
}: {
  logo?: string
  onChange: (base64: string | undefined) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => onChange(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div>
      {logo ? (
        <div className="flex items-center gap-4 rounded-xl border border-border bg-background p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo || '/placeholder.svg'}
            alt="Logo del negocio"
            className="h-16 w-16 rounded-lg object-contain"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-card-foreground">Logo cargado</p>
            <p className="text-xs text-muted-foreground">
              Se almacena localmente en este navegador.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-brand-danger/10 hover:text-brand-danger"
          >
            <X className="size-3.5" />
            Quitar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            handleFile(e.dataTransfer.files?.[0])
          }}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 transition-colors ${
            dragging
              ? 'border-brand-indigo bg-brand-indigo/5'
              : 'border-border bg-background hover:border-brand-indigo/50 hover:bg-muted/50'
          }`}
        >
          <div className="flex size-11 items-center justify-center rounded-xl bg-brand-indigo/10">
            <ImageUp className="size-5 text-brand-indigo" />
          </div>
          <p className="text-sm font-semibold text-card-foreground">
            Arrastra una imagen o haz clic para subir
          </p>
          <p className="text-xs text-muted-foreground">PNG, JPG · máx. recomendado 200&nbsp;KB</p>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
