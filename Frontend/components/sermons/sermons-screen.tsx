"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Play, Download, Calendar, Clock, User } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SermonsScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpeaker, setSelectedSpeaker] = useState("all")

  // Mock sermon data
  const sermons = [
    {
      id: 1,
      title: "The Power of Faith",
      speaker: "Pastor David Ogbueli",
      date: "May 26, 2025",
      duration: "45 min",
      type: "video",
      thumbnail: "/placeholder.svg?height=120&width=200",
      description: "Understanding how faith moves mountains and transforms lives.",
      series: "Faith Series",
    },
    {
      id: 2,
      title: "Walking in Divine Favor",
      speaker: "Pastor Nonso Agu",
      date: "May 19, 2025",
      duration: "38 min",
      type: "audio",
      thumbnail: "/placeholder.svg?height=120&width=200",
      description: "Discovering God's favor in every season of life.",
      series: "Favor Series",
    },
    {
      id: 3,
      title: "The Heart of Worship",
      speaker: "Pastor David Ogbueli",
      date: "May 12, 2025",
      duration: "42 min",
      type: "video",
      thumbnail: "/placeholder.svg?height=120&width=200",
      description: "True worship comes from the heart, not just the lips.",
      series: "Worship Series",
    },
    {
      id: 4,
      title: "Building Strong Relationships",
      speaker: "Pastor Nonso Agu",
      date: "May 5, 2025",
      duration: "35 min",
      type: "audio",
      thumbnail: "/placeholder.svg?height=120&width=200",
      description: "Biblical principles for healthy relationships.",
      series: "Relationship Series",
    },
  ]

  const speakers = ["all", "Pastor David Ogbueli", "Pastor Nonso Agu"]

  const filteredSermons = sermons.filter((sermon) => {
    const matchesSearch =
      sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sermon.speaker.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSpeaker = selectedSpeaker === "all" || sermon.speaker === selectedSpeaker
    return matchesSearch && matchesSpeaker
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sermons & Media</h1>
        <p className="text-muted-foreground">Listen to and watch church sermons</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sermons..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={selectedSpeaker} onValueChange={setSelectedSpeaker}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by speaker" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Speakers</SelectItem>
            {speakers.slice(1).map((speaker) => (
              <SelectItem key={speaker} value={speaker}>
                {speaker}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="recent">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="series">Series</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="mt-6">
          <div className="grid gap-4">
            {filteredSermons.map((sermon) => (
              <Card key={sermon.id} className="overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-48 h-32 sm:h-auto">
                    <img
                      src={sermon.thumbnail || "/placeholder.svg"}
                      alt={sermon.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Button size="sm" className="bg-white/90 text-black hover:bg-white">
                        <Play className="h-4 w-4 mr-1" />
                        Play
                      </Button>
                    </div>
                    <Badge variant="secondary" className="absolute top-2 right-2 bg-black/70 text-white">
                      {sermon.type === "video" ? "Video" : "Audio"}
                    </Badge>
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{sermon.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{sermon.description}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {sermon.speaker}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {sermon.date}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {sermon.duration}
                      </div>
                    </div>

                    <Badge variant="outline">{sermon.series}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="series" className="mt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {["Faith Series", "Favor Series", "Worship Series", "Relationship Series"].map((series) => (
              <Card key={series}>
                <CardHeader>
                  <CardTitle className="text-lg">{series}</CardTitle>
                  <CardDescription>{sermons.filter((s) => s.series === series).length} sermons</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <Play className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Latest sermon</p>
                      <p className="font-medium">{sermons.find((s) => s.series === series)?.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">No favorite sermons yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tap the heart icon on any sermon to add it to your favorites
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
