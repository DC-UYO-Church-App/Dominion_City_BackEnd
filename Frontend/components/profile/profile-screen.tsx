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
import { useEffect, useMemo, useRef, useState } from "react"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function ProfileScreen() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { toast } = useToast()
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
  const uploadsBaseUrl = apiBaseUrl.replace(/\/api$/, "")
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [addressDraft, setAddressDraft] = useState("")

  const [user, setUser] = useState<{
    firstName: string
    lastName: string
    email: string
    phone: string
    address?: string
    cellGroup?: string
    role: string
    memberSince: string
    teams: string[]
    avatar?: string
  }>({
    firstName: "Member",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    cellGroup: undefined,
    role: "Member",
    memberSince: "",
    teams: [],
    avatar: "/placeholder.svg?height=80&width=80",
  })

  useEffect(() => {
    apiClient
      .getProfile()
      .then((response) => {
        const profile = response?.user
        if (!profile) return
        setUser({
          firstName: profile.firstName || "Member",
          lastName: profile.lastName || "",
          email: profile.email || "",
          phone: profile.phoneNumber || "",
          address: profile.address || "",
          cellGroup: profile.cellGroupId || undefined,
          role: profile.role ? `${profile.role}` : "Member",
          memberSince: profile.joinDate ? new Date(profile.joinDate).getFullYear().toString() : "",
          teams: [],
          avatar: profile.profileImage
            ? profile.profileImage.startsWith("/uploads/")
              ? `${uploadsBaseUrl}${profile.profileImage}`
              : profile.profileImage
            : "/placeholder.svg?height=80&width=80",
        })
        setAddressDraft(profile.address || "")
      })
      .catch(() => {
        // keep defaults on error
      })
  }, [])

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await apiClient.uploadProfileImage(file)
      const rawImageUrl = response?.imageUrl || response?.user?.profileImage
      const imageUrl = rawImageUrl?.startsWith("/uploads/")
        ? `${uploadsBaseUrl}${rawImageUrl}`
        : rawImageUrl
      if (imageUrl) {
        setUser((prev) => ({ ...prev, avatar: imageUrl }))
      }
      toast({
        title: "Profile updated",
        description: "Your profile picture has been updated.",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed"
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleEditAddress = () => {
    setAddressDraft(user.address || "")
    setIsEditingAddress(true)
  }

  const handleSaveAddress = async () => {
    try {
      const response = await apiClient.updateProfile({ address: addressDraft })
      const updatedAddress = response?.user?.address ?? addressDraft
      setUser((prev) => ({ ...prev, address: updatedAddress }))
      setIsEditingAddress(false)
      toast({
        title: "Address updated",
        description: "Your address has been saved.",
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Update failed"
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      })
    }
  }

  const fullName = useMemo(
    () => `${user.firstName} ${user.lastName}`.trim(),
    [user.firstName, user.lastName]
  )

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
      description: user.cellGroup ? user.cellGroup : "None",
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
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={fullName} />
                <AvatarFallback className="text-lg">{fullName.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={handleAvatarClick}
                className="absolute -bottom-1 -right-1 rounded-full bg-[#00369a] p-2 text-white shadow-md"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">{fullName}</h2>
              <p className="text-muted-foreground">
                {user.role}
                {user.memberSince ? ` since ${user.memberSince}` : ""}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {user.teams.length > 0 ? (
                  user.teams.map((team) => (
                    <Badge key={team} variant="secondary">
                      {team}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary">No team yet</Badge>
                )}
                <Badge variant="outline">{user.cellGroup ? user.cellGroup : "No cell yet"}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription>Your contact details and church information</CardDescription>
            </div>
            {!isEditingAddress ? (
              <Button variant="outline" size="sm" onClick={handleEditAddress}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditingAddress(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveAddress} className="bg-[#00369a] text-white">
                  Save
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-church-soft-blue flex items-center justify-center">
              <Mail className="h-5 w-5 text-church-blue" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email || "Not set"}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-church-soft-blue flex items-center justify-center">
              <Phone className="h-5 w-5 text-church-blue" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{user.phone || "Not set"}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-church-soft-blue flex items-center justify-center">
              <MapPin className="h-5 w-5 text-church-blue" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              {isEditingAddress ? (
                <input
                  value={addressDraft}
                  onChange={(event) => setAddressDraft(event.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-black"
                  placeholder="Enter your address"
                />
              ) : (
                <p className="font-medium">{user.address || "Not set"}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-church-soft-blue flex items-center justify-center">
              <Users className="h-5 w-5 text-church-blue" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cell Group</p>
              <p className="font-medium">{user.cellGroup ? user.cellGroup : "None"}</p>
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
