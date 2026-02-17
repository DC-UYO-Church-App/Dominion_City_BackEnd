"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type TypewriterTextProps = {
  texts: string[]
  className?: string
  speedMs?: number
  startDelayMs?: number
  pauseMs?: number
  showCursor?: boolean
}

export function TypewriterText({
  texts,
  className,
  speedMs = 45,
  startDelayMs = 300,
  pauseMs = 1400,
  showCursor = true,
}: TypewriterTextProps) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let index = 0

    const startTyping = () => {
      const tick = () => {
        index += 1
        setVisibleCount(index)
        if (index < texts[activeIndex].length) {
          timeoutId = setTimeout(tick, speedMs)
        } else {
          timeoutId = setTimeout(() => {
            index = 0
            setVisibleCount(0)
            setActiveIndex((prev) => (prev + 1) % texts.length)
          }, pauseMs)
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
  }, [texts, activeIndex, speedMs, startDelayMs, pauseMs])

  return (
    <span
      className={cn("inline-block align-top", className)}
      aria-label={texts[activeIndex]}
    >
      {texts[activeIndex].slice(0, visibleCount)}
      {showCursor ? <span className="typewriter-cursor">|</span> : null}
    </span>
  )
}
