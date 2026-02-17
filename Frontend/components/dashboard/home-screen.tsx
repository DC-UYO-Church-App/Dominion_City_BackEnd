"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, Calendar, CheckCircle, ChevronRight, Clock, Headphones } from "lucide-react"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api"

export function HomeScreen() {
  const [firstName, setFirstName] = useState("Member")
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"
  const uploadsBaseUrl = apiBaseUrl.replace(/\/api$/, "")

  useEffect(() => {
    apiClient
      .getProfile()
      .then((response) => {
        if (response?.user?.firstName) {
          setFirstName(response.user.firstName)
        }
      })
      .catch(() => {
        // Keep default name on error
      })
  }, [])

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const getNextWeekday = (weekday: number) => {
    const today = new Date()
    const currentDay = today.getDay()
    const daysAhead = (weekday + 7 - currentDay) % 7 || 7
    const nextDate = new Date(today)
    nextDate.setDate(today.getDate() + daysAhead)
    nextDate.setHours(0, 0, 0, 0)
    return nextDate
  }

  useEffect(() => {
    apiClient
      .getEvents()
      .then((response) => {
        const now = new Date()
        const sunday = getNextWeekday(0)
        const wednesday = getNextWeekday(3)
        const events = (response?.events || [])
          .map((event: any) => {
            const eventDate = event.eventDate ? new Date(event.eventDate) : null
            const cover = (() => {
              const value = event.imageUrl
              if (!value) return null
              if (value.startsWith("http")) return value
              if (value.startsWith("/uploads/")) return `${uploadsBaseUrl}${value}`
              if (value.startsWith("uploads/")) return `${uploadsBaseUrl}/${value}`
              if (!value.includes("/")) return `${uploadsBaseUrl}/uploads/${value}`
              return value
            })()
            return { ...event, eventDate, cover }
          })
          .filter((event: any) => event.eventDate && event.status !== "cancelled" && event.eventDate >= now)
          .sort((a: any, b: any) => a.eventDate.getTime() - b.eventDate.getTime())

        const fixedEvents = [
          {
            id: "weekly-sunday",
            title: "Sunday Service",
            eventDate: sunday,
            cover: null,
            status: "scheduled",
          },
          {
            id: "weekly-wednesday",
            title: "Midweek Service",
            eventDate: wednesday,
            cover: null,
            status: "scheduled",
          },
        ]

        const combined = [...fixedEvents, ...events]
          .filter((event) => event.eventDate && event.eventDate >= now)
          .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime())

        setUpcomingEvents(combined.slice(0, 3))
      })
      .catch(() => {
        setUpcomingEvents([])
      })
      .finally(() => setEventsLoading(false))
  }, [uploadsBaseUrl])

  const announcements = [
    {
      id: 1,
      title: "Special Thanksgiving Service",
      description: "Join us this Sunday for a special thanksgiving service.",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 2,
      title: "Youth Conference 2025",
      description: "Annual youth conference coming up next month.",
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 3,
      title: "New Building Project",
      description: "Updates on our new church building project.",
      image: "/placeholder.svg?height=200&width=400",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#00369a]">Welcome, {firstName}!</h1>
          <p className="text-gray-600">{todayLabel}</p>
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          <span className="sr-only">Notifications</span>
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <Link
          href="/dashboard/attendance"
          className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm border"
        >
          <div className="w-10 h-10 rounded-full bg-[#00369a]/10 flex items-center justify-center mb-2">
            <CheckCircle className="h-5 w-5 text-[#00369a]" />
          </div>
          <span className="text-xs text-center text-slate-900">Check-in</span>
        </Link>
        <Link href="/dashboard/sermons" className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm border">
          <div className="w-10 h-10 rounded-full bg-[#00369a]/10 flex items-center justify-center mb-2">
            <Headphones className="h-5 w-5 text-[#00369a]" />
          </div>
          <span className="text-xs text-center text-slate-900">Sermons</span>
        </Link>
        <Link href="/dashboard/tithing" className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm border">
          <div className="w-10 h-10 rounded-full bg-[#00369a]/10 flex items-center justify-center mb-2">
            <span className="font-bold text-[#00369a]">₦</span>
          </div>
          <span className="text-xs text-center text-slate-900">Give</span>
        </Link>
      </div>

      {/* Announcements Carousel */}
      <div>
        <h2 className="text-lg font-bold mb-3 text-[#00369a]">Announcements</h2>
        <Carousel className="w-full">
          <CarouselContent>
            {announcements.map((announcement) => (
              <CarouselItem key={announcement.id}>
                <Card>
                  <div className="h-40 bg-muted rounded-t-lg overflow-hidden">
                    <img
                      src={announcement.image || "/placeholder.svg"}
                      alt={announcement.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader className="p-3">
                    <CardTitle className="text-base">{announcement.title}</CardTitle>
                    <CardDescription className="text-xs">{announcement.description}</CardDescription>
                  </CardHeader>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>

      {/* Upcoming Events */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-[#00369a]">Upcoming Events</h2>
          <Link href="/dashboard/events">
            <Button variant="ghost" size="sm" className="text-xs flex items-center text-[#00369a]">
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="space-y-3">
          {eventsLoading ? (
            <Card className="overflow-hidden">
              <CardContent className="p-4 text-sm text-gray-500">Loading events...</CardContent>
            </Card>
          ) : upcomingEvents.length === 0 ? (
            <Card className="overflow-hidden">
              <CardContent className="p-4 text-sm text-gray-500">No upcoming events.</CardContent>
            </Card>
          ) : (
            upcomingEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center p-3 gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-[#00369a]/10 flex items-center justify-center">
                      {event.cover ? (
                        <img src={event.cover} alt={event.title} className="h-full w-full object-cover" />
                      ) : (
                        <Calendar className="h-5 w-5 text-[#00369a]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{event.title}</h3>
                      <div className="flex items-center text-xs text-gray-600">
                        <span>
                          {event.eventDate.toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="mx-2">•</span>
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          {event.eventDate.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      Upcoming
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
