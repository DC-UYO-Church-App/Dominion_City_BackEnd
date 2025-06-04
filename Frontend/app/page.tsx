"use client"

import { useEffect, useState } from "react"
import { LoginScreen } from "@/components/auth/login-screen"
import { WelcomeScreen } from "@/components/welcome/welcome-screen"

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true)

  useEffect(() => {
    // Check if user has seen welcome screen before
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome")
    if (hasSeenWelcome) {
      setShowWelcome(false)
    }
  }, [])

  const handleWelcomeComplete = () => {
    localStorage.setItem("hasSeenWelcome", "true")
    setShowWelcome(false)
  }

  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />
  }

  return <LoginScreen />
}
