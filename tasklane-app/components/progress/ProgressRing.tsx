// components/progress/ProgressRing.tsx
'use client'

import { useEffect, useRef } from 'react'

export default function ProgressRing() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const percentage = 62.5 // 5 out of 8 tasks done

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = 70
    const lineWidth = 8

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Background circle (light gray)
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.strokeStyle = '#e7e5e3'
    ctx.lineWidth = lineWidth
    ctx.stroke()

    // Progress circle (accent color)
    const startAngle = -Math.PI / 2
    const endAngle = startAngle + (Math.PI * 2 * percentage) / 100
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.strokeStyle = '#7c3aed'
    ctx.lineCap = 'round'
    ctx.lineWidth = lineWidth
    ctx.stroke()

    // Center text
    ctx.fillStyle = '#1c1917'
    ctx.font = 'bold 32px Bricolage Grotesque'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${Math.round(percentage)}%`, centerX, centerY - 10)

    ctx.fillStyle = '#78716c'
    ctx.font = '14px Instrument Sans'
    ctx.fillText('5 of 8 tasks', centerX, centerY + 20)
  }, [percentage])

  return (
    <div className="flex flex-col items-center gap-8">
      <div>
        <h2 className="text-2xl font-bold text-primary mb-2 text-center">Today's Progress</h2>
        <p className="text-secondary text-center">Keep the momentum going</p>
      </div>

      <canvas
        ref={canvasRef}
        width={280}
        height={280}
        className="mx-auto"
      />

      {/* Per-type progress bars */}
      <div className="w-full max-w-md space-y-3">
        <div>
          <div className="flex justify-between text-xs font-medium mb-1">
            <span className="text-primary">Deep work</span>
            <span className="text-secondary">2 of 3</span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div
              className="bg-deep-work h-2 rounded-full transition-all duration-300"
              style={{ width: '67%' }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium mb-1">
            <span className="text-primary">Meetings</span>
            <span className="text-secondary">1 of 2</span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div
              className="bg-meetings h-2 rounded-full transition-all duration-300"
              style={{ width: '50%' }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs font-medium mb-1">
            <span className="text-primary">Errands</span>
            <span className="text-secondary">1 of 1</span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div
              className="bg-errands h-2 rounded-full transition-all duration-300"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Daily goal */}
      <div className="w-full max-w-md bg-bg rounded-lg p-4 text-center">
        <p className="text-xs text-secondary mb-1">Daily Goal</p>
        <p className="text-2xl font-bold text-accent">105 of 120 min</p>
        <p className="text-xs text-secondary mt-1">You're on track!</p>
      </div>
    </div>
  )
}
