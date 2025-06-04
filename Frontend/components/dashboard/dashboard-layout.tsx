"use client"

import type React from "react"

import { useState } from "react"
import { BottomNavigation } from "@/components/navigation/bottom-navigation"
import { SideDrawer } from "@/components/navigation/side-drawer"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b bg-white">
        <Button variant="ghost" size="icon" onClick={() => setIsDrawerOpen(true)} className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-[#00369a] flex items-center justify-center mr-2">
            <span className="text-xs font-bold text-white">GH</span>
          </div>
          <h1 className="text-lg font-bold text-[#00369a]">Golden Heart</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-200"></div>
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
