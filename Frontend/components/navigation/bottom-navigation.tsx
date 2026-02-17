"use client"

import { Home, Users, MessageSquare, CheckSquare, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function BottomNavigation() {
  const pathname = usePathname()

  const navItems = [
    {
      name: "Home",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Attendance",
      href: "/dashboard/attendance",
      icon: CheckSquare,
    },
    {
      name: "Sermons",
      href: "/dashboard/messages",
      icon: MessageSquare,
    },
    {
      name: "Cell Groups",
      href: "/dashboard/cell-groups",
      icon: Users,
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: User,
    },
  ]

  return (
    <div className="fixed bottom-4 left-1/2 z-40 w-[92%] max-w-3xl -translate-x-1/2">
      <nav className="flex h-16 rounded-2xl border border-white/20 bg-white/25 shadow-xl backdrop-blur-2xl">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center",
                isActive ? "text-white" : "text-white/70",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
