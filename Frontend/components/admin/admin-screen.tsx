"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { apiClient } from "@/lib/api"
import { Users } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export function AdminScreen() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalAttended: 0,
    newMembers: 0,
  })
  const [chartData, setChartData] = useState<{ label: string; count: number }[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  useEffect(() => {
    apiClient
      .getAdminDashboardStats()
      .then((response) => {
        setStats({
          totalMembers: response.totalMembers || 0,
          totalAttended: response.totalAttended || 0,
          newMembers: response.newMembers || 0,
        })
        const mapped = (response.newMembersBySunday || []).map((entry: any) => {
          const date = new Date(entry.date)
          return {
            label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            count: entry.count || 0,
          }
        })
        setChartData(mapped)
      })
      .catch(() => {
        setChartData([])
      })
      .finally(() => setIsLoadingStats(false))
  }, [])

  const statCards = useMemo(
    () => [
      {
        label: "Total Members",
        value: stats.totalMembers.toLocaleString(),
        icon: Users,
        accent: "bg-indigo-100 text-indigo-500",
      },
      {
        label: "Total Attended",
        value: stats.totalAttended.toLocaleString(),
        icon: Users,
        accent: "bg-amber-100 text-amber-500",
      },
      {
        label: "New Members",
        value: stats.newMembers.toLocaleString(),
        icon: Users,
        accent: "bg-emerald-100 text-emerald-500",
      },
      {
        label: "Workers",
        value: "50",
        icon: Users,
        accent: "bg-rose-100 text-rose-500",
      },
    ],
    [stats]
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <Card key={card.label} className="rounded-2xl border-none bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{card.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.accent}`}>
                  <card.icon className="h-6 w-6" />
                </div>
              </div>
              <p className="mt-4 text-sm text-emerald-500">8.5% Up from yesterday</p>
            </Card>
          ))}
        </div>

        <Card className="rounded-2xl border-none bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Members Detail</h2>
            <button className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
              March <span className="ml-1 inline-block">▾</span>
            </button>
          </div>
          <div className="mt-6 h-64 w-full rounded-xl bg-gradient-to-b from-slate-50 to-white">
            {isLoadingStats ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Loading chart...
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="newMembers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5b8cff" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#5b8cff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      borderColor: "#e2e8f0",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#5b8cff"
                    strokeWidth={2}
                    fill="url(#newMembers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="rounded-2xl border-none bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Event Details</h2>
            <button className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
              March <span className="ml-1 inline-block">▾</span>
            </button>
          </div>
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
            <div className="grid grid-cols-[2fr_2fr_2fr_1fr] gap-4 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
              <span>Event Title</span>
              <span>Location</span>
              <span>Date - Time</span>
              <span>Status</span>
            </div>
            {[
              { status: "Ongoing", color: "bg-emerald-500", label: "Ongoing" },
              { status: "Upcoming", color: "bg-amber-400", label: "Upcoming" },
              { status: "Upcoming", color: "bg-amber-400", label: "Upcoming" },
              { status: "Ended", color: "bg-slate-400", label: "Ended" },
              { status: "Ended", color: "bg-slate-400", label: "Ended" },
            ].map((row, index) => (
              <div key={index} className="grid grid-cols-[2fr_2fr_2fr_1fr] gap-4 border-t border-slate-200 px-4 py-4 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-slate-200" />
                  Worship and Praise Jolly
                </div>
                <span>6096 Marjolaine Landing</span>
                <span>12.09.2019 - 12.53 PM</span>
                <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold text-white ${row.color}`}>
                  {row.label}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
