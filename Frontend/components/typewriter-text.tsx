"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type TypewriterTextProps = {
  text: string
  className?: string
  speedMs?: number
  startDelayMs?: number
  showCursor?: boolean
}

export function TypewriterText({
  text,
  className,
  speedMs = 45,
  startDelayMs = 300,
  showCursor = true,
}: TypewriterTextProps) {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let index = 0

    const startTyping = () => {
      const tick = () => {
        index += 1
        setVisibleCount(index)
        if (index < text.length) {
          timeoutId = setTimeout(tick, speedMs)
        }
      }

      timeoutId = setTimeout(tick, speedMs)
    }

    timeoutId = setTimeout(startTyping, startDelayMs)

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [text, speedMs, startDelayMs])

  return (
    <span className={cn("inline-block align-top", className)} aria-label={text}>
      {text.slice(0, visibleCount)}
      {showCursor ? <span className="typewriter-cursor">|</span> : null}
    </span>
  )
}
