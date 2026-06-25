'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const base =
  'w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground shadow-sm transition-all duration-150 outline-none placeholder:text-muted-foreground/70 focus:border-brand-indigo focus:ring-4 focus:ring-brand-indigo/15 disabled:opacity-50'

const errorCls = 'border-brand-danger focus:border-brand-danger focus:ring-brand-danger/15'

export function Label({
  children,
  htmlFor,
  required,
}: {
  children: React.ReactNode
  htmlFor?: string
  required?: boolean
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
    >
      {children}
      {required && <span className="ml-0.5 text-brand-danger">*</span>}
    </label>
  )
}

interface FieldProps {
  label: string
  htmlFor?: string
  required?: boolean
  error?: boolean
  className?: string
  children: React.ReactNode
}

export function Field({
  label,
  htmlFor,
  required,
  className,
  children,
}: FieldProps) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
    </div>
  )
}

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function Input({ className, invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(base, invalid && errorCls, className)}
      aria-invalid={invalid}
      {...props}
    />
  )
})

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(function Textarea({ className, invalid, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(base, 'min-h-20 resize-y leading-relaxed', invalid && errorCls, className)}
      aria-invalid={invalid}
      {...props}
    />
  )
})

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }
>(function Select({ className, invalid, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(base, 'cursor-pointer pr-8', invalid && errorCls, className)}
      aria-invalid={invalid}
      {...props}
    >
      {children}
    </select>
  )
})
