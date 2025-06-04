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
    <div className="sticky bottom-0 z-40 w-full border-t bg-white">
      <nav className="flex h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center",
                isActive ? "text-[#00369a]" : "text-gray-500",
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
