import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { AttendanceScreen } from "@/components/attendance/attendance-screen"

export default function AttendancePage() {
  return (
    <DashboardLayout>
      <AttendanceScreen />
    </DashboardLayout>
  )
}
