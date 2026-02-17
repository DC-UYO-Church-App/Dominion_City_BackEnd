"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CheckCircle, QrCode, UserPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function AttendanceScreen() {
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false)
  const [isFirstTimeVisitor, setIsFirstTimeVisitor] = useState(false)
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false)

  const handleCheckIn = () => {
    setIsCheckInDialogOpen(false)
    setIsConfirmationOpen(true)

    // In a real app, we would submit the check-in data
    setTimeout(() => {
      setIsConfirmationOpen(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Attendance</h1>
        <p className="text-muted-foreground">Check-in and view your attendance history</p>
      </div>

      <Card>
        <CardHeader className="bg-church-gold/10 border-b">
          <CardTitle className="text-lg">Today&apos;s Service</CardTitle>
          <CardDescription>Sunday, May 29, 2025</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-church-gold/20 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-church-gold" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Sunday Service</h3>
              <p className="text-sm text-muted-foreground">9:00 AM - 11:30 AM</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <Button
            onClick={() => setIsCheckInDialogOpen(true)}
            className="bg-church-gold hover:bg-amber-400 text-church-navy"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Check-in Now
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-bold">Attendance History</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">No attendance history yet.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Check-in Dialog */}
      <Dialog open={isCheckInDialogOpen} onOpenChange={setIsCheckInDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check-in for Service</DialogTitle>
            <DialogDescription>Choose your preferred check-in method</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <Button variant="outline" className="h-24 flex flex-col">
              <QrCode className="h-8 w-8 mb-2" />
              <span>Scan QR Code</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col">
              <UserPlus className="h-8 w-8 mb-2" />
              <span>Manual Entry</span>
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="first-time" checked={isFirstTimeVisitor} onCheckedChange={setIsFirstTimeVisitor} />
            <Label htmlFor="first-time">I am a first-time visitor</Label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckInDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCheckIn} className="bg-church-gold hover:bg-amber-400 text-church-navy">
              Check-in
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Check-in Successful!</h2>
            <p className="text-muted-foreground">You have successfully checked in for today&apos;s service.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
