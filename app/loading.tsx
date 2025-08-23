"use client"

import { useState, useEffect } from "react"

export default function Loading() {
  const [displayText, setDisplayText] = useState("")
  const [currentPhase, setCurrentPhase] = useState(0)
  const [showCursor, setShowCursor] = useState(true)

  const phases = [
    { text: "Drop it. Save it. Find it.", delay: 100 },
    { text: "Quick Drop", delay: 100 },
    { text: "Your Digital Workspace", delay: 80 },
    { text: "Markdown Editor", delay: 90 },
    { text: "Note Organization", delay: 85 },
    { text: "Copy-Paste Notebook", delay: 100 },
  ]

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)

    return () => clearInterval(cursorInterval)
  }, [])

  useEffect(() => {
    let timeout: NodeJS.Timeout

    const typeText = async () => {
      const currentPhaseData = phases[currentPhase]
      const targetText = currentPhaseData.text

      // Typing phase
      for (let i = 0; i <= targetText.length; i++) {
        await new Promise((resolve) => {
          timeout = setTimeout(
            () => {
              setDisplayText(targetText.slice(0, i))
              resolve(void 0)
            },
            currentPhaseData.delay + Math.random() * 50,
          )
        })
      }

      // Pause at full text
      await new Promise((resolve) => {
        timeout = setTimeout(resolve, 1500)
      })

      // Backspace phase (except for last phase)
      if (currentPhase < phases.length - 1) {
        for (let i = targetText.length; i >= 0; i--) {
          await new Promise((resolve) => {
            timeout = setTimeout(
              () => {
                setDisplayText(targetText.slice(0, i))
                resolve(void 0)
              },
              50 + Math.random() * 30,
            )
          })
        }

        // Brief pause before next phase
        await new Promise((resolve) => {
          timeout = setTimeout(resolve, 300)
        })

        setCurrentPhase((prev) => (prev + 1) % phases.length)
      }
    }

    typeText()

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [currentPhase])

  return (
    <div className="fixed inset-0 bg-stone-950 flex items-center justify-center z-50">
      <div className="text-center space-y-8">
        {/* Main typing text */}
        <div className="h-16 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent">
            {displayText}
            <span
              className={`inline-block w-1 h-12 bg-purple-400 ml-1 ${showCursor ? "opacity-100" : "opacity-0"} transition-opacity duration-100`}
            />
          </h1>
        </div>

        {/* Loading workspace text */}
        <div className="space-y-4">
          <p className="text-stone-400 text-lg animate-pulse">Loading your workspace...</p>

          {/* Loading dots animation */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-stone-800 rounded-full overflow-hidden mx-auto">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"
            style={{
              width: `${((currentPhase + 1) / phases.length) * 100}%`,
              transition: "width 0.5s ease-in-out",
            }}
          />
        </div>
      </div>
    </div>
  )
}
