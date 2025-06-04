"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Users, Calendar, MessageSquare, Clock, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function CellGroupsScreen() {
  // Mock cell group data
  const myCellGroup = {
    name: "Faith Builders Cell",
    leader: "Sarah Johnson",
    members: 12,
    location: "15 Park Avenue, Lekki",
    meetingDay: "Wednesday",
    meetingTime: "6:30 PM",
    nextMeeting: "June 1, 2025",
  }

  const nearbyCellGroups = [
    {
      id: 1,
      name: "Hope Anchors Cell",
      leader: "Michael Obi",
      distance: "1.2 km",
      meetingDay: "Tuesday",
      meetingTime: "7:00 PM",
    },
    {
      id: 2,
      name: "Grace Overflow Cell",
      leader: "Esther Adeyemi",
      distance: "2.5 km",
      meetingDay: "Thursday",
      meetingTime: "6:00 PM",
    },
    {
      id: 3,
      name: "Love Abounds Cell",
      leader: "Daniel Nwachukwu",
      distance: "3.8 km",
      meetingDay: "Monday",
      meetingTime: "7:30 PM",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cell Groups</h1>
        <p className="text-muted-foreground">Connect with your cell group and find nearby cells</p>
      </div>

      <Tabs defaultValue="my-cell">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-cell">My Cell</TabsTrigger>
          <TabsTrigger value="find-cell">Find a Cell</TabsTrigger>
        </TabsList>

        <TabsContent value="my-cell" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="bg-church-navy/10 border-b">
              <CardTitle className="text-lg">{myCellGroup.name}</CardTitle>
              <CardDescription>Led by {myCellGroup.leader}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-church-soft-blue flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-church-blue" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Members</p>
                    <p className="font-medium">{myCellGroup.members} members</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-church-soft-blue flex items-center justify-center mr-3">
                    <MapPin className="h-5 w-5 text-church-blue" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{myCellGroup.location}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-church-soft-blue flex items-center justify-center mr-3">
                    <Calendar className="h-5 w-5 text-church-blue" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Meeting Schedule</p>
                    <p className="font-medium">
                      Every {myCellGroup.meetingDay} at {myCellGroup.meetingTime}
                    </p>
                  </div>
                </div>

                <div className="bg-church-gold/10 p-4 rounded-lg">
                  <h3 className="font-semibold mb-1">Next Meeting</h3>
                  <p className="text-sm">
                    {myCellGroup.nextMeeting} • {myCellGroup.meetingTime}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Group Chat
              </Button>
              <Button className="bg-church-gold hover:bg-amber-400 text-church-navy">View Details</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="find-cell" className="space-y-4 mt-4">
          <div className="bg-muted rounded-lg h-40 flex items-center justify-center mb-4">
            <p className="text-muted-foreground">Map view coming soon</p>
          </div>

          <h2 className="text-lg font-bold mb-2">Nearby Cell Groups</h2>

          <div className="space-y-3">
            {nearbyCellGroups.map((cell) => (
              <Card key={cell.id}>
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{cell.name}</h3>
                      <Badge variant="outline">{cell.distance}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Led by {cell.leader}</p>

                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-1 text-church-blue" />
                      <span className="mr-3">{cell.meetingDay}</span>
                      <Clock className="h-4 w-4 mr-1 text-church-blue" />
                      <span>{cell.meetingTime}</span>

                      <Button variant="ghost" size="sm" className="ml-auto p-0 h-8 w-8">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
