import type { ReactNode } from 'react'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'
import { Toaster } from '@/components/ui/sonner'

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toaster position="top-center" richColors closeButton />
    </div>
  )
}
