"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  Phone,
  MapPin,
  Users,
  Settings,
  Bell,
  CreditCard,
  Calendar,
  Gift,
  HelpCircle,
  LogOut,
  Edit,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function ProfileScreen() {
  const router = useRouter()

  // Mock user data
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+234 800 123 4567",
    address: "15 Park Avenue, Lekki, Lagos",
    cellGroup: "Faith Builders Cell",
    role: "Member",
    memberSince: "2020",
    department: "Worship Team",
    avatar: "/placeholder.svg?height=80&width=80",
  }

  const handleLogout = () => {
    // In a real app, we would handle logout logic
    router.push("/")
  }

  const accountItems = [
    {
      icon: Settings,
      label: "Settings",
      href: "/dashboard/settings",
      description: "App preferences and privacy",
    },
    {
      icon: Bell,
      label: "Notifications",
      href: "/dashboard/notifications",
      description: "Manage your notifications",
      badge: "3",
    },
    {
      icon: CreditCard,
      label: "Tithing & Donations",
      href: "/dashboard/tithing",
      description: "View giving history",
    },
  ]

  const activityItems = [
    {
      icon: Calendar,
      label: "Events & Programs",
      href: "/dashboard/events",
      description: "Upcoming church events",
    },
    {
      icon: Gift,
      label: "Birthdays",
      href: "/dashboard/birthdays",
      description: "Church member birthdays",
      badge: "2 Today",
    },
    {
      icon: Users,
      label: "My Cell Group",
      href: "/dashboard/cell-groups",
      description: "Faith Builders Cell",
    },
  ]

  const supportItems = [
    {
      icon: HelpCircle,
      label: "Help & Support",
      href: "/dashboard/help",
      description: "Get help and contact support",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="text-lg">{user.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground">
                {user.role} since {user.memberSince}
              </p>
              <div className="flex items-center mt-2 space-x-2">
                <Badge variant="secondary">{user.department}</Badge>
                <Badge variant="outline">{user.cellGroup}</Badge>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
          <CardDescription>Your contact details and church information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-church-soft-blue flex items-center justify-center">
              <Mail className="h-5 w-5 text-church-blue" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-church-soft-blue flex items-center justify-center">
              <Phone className="h-5 w-5 text-church-blue" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{user.phone}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-church-soft-blue flex items-center justify-center">
              <MapPin className="h-5 w-5 text-church-blue" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{user.address}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-church-soft-blue flex items-center justify-center">
              <Users className="h-5 w-5 text-church-blue" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cell Group</p>
              <p className="font-medium">{user.cellGroup}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Section */}
      <div>
        <h2 className="text-lg font-bold mb-3">Account</h2>
        <Card>
          <CardContent className="p-0">
            {accountItems.map((item, index) => (
              <div key={item.label}>
                <Link href={item.href} className="flex items-center justify-between p-4 hover:bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
                {index < accountItems.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Activities Section */}
      <div>
        <h2 className="text-lg font-bold mb-3">Activities</h2>
        <Card>
          <CardContent className="p-0">
            {activityItems.map((item, index) => (
              <div key={item.label}>
                <Link href={item.href} className="flex items-center justify-between p-4 hover:bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
                {index < activityItems.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Support Section */}
      <div>
        <h2 className="text-lg font-bold mb-3">Support</h2>
        <Card>
          <CardContent className="p-0">
            {supportItems.map((item, index) => (
              <div key={item.label}>
                <Link href={item.href} className="flex items-center justify-between p-4 hover:bg-muted/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
                {index < supportItems.length - 1 && <Separator />}
              </div>
            ))}

            <Separator />

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-between p-4 hover:bg-red-50 w-full text-left"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <LogOut className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-red-600">Logout</p>
                  <p className="text-sm text-muted-foreground">Sign out of your account</p>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* App Info */}
      <div className="text-center text-sm text-muted-foreground py-4">
        <p>Dominion City Church - Golden Heart</p>
        <p>Version 1.0.0</p>
      </div>
    </div>
  )
}
