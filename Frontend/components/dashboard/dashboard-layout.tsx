"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { BottomNavigation } from "@/components/navigation/bottom-navigation"
import { SideDrawer } from "@/components/navigation/side-drawer"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) {
      router.replace("/login")
      return
    }

    apiClient
      .getProfile()
      .then(() => setIsCheckingAuth(false))
      .catch(() => {
        apiClient.clearToken()
        router.replace("/login")
      })
  }, [router])

  if (isCheckingAuth) {
    return <div className="min-h-screen bg-slate-950" />
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b border-white/10 bg-slate-950">
        <Button variant="ghost" size="icon" onClick={() => setIsDrawerOpen(true)} className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
        <div className="flex items-center">
          <img src="/logo.png" alt="Dominion City" className="h-8 w-auto mr-2" />
          <h1 className="text-lg font-bold text-white">Golden Heart</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/10"></div>
      </header>

      {/* Side Drawer (Mobile) */}
      <SideDrawer isOpen={isDrawerOpen} setIsOpen={setIsDrawerOpen} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-4 max-w-4xl">{children}</div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}
