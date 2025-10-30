'use client'

import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

interface AnimatedGridPatternProps {
  width?: number
  height?: number
  numSquares?: number
  maxOpacity?: number
  duration?: number
  repeatDelay?: number
  className?: string
}

export function AnimatedGridPattern({
  width = 40,
  height = 40,
  numSquares = 50,
  maxOpacity = 0.5,
  duration = 4,
  repeatDelay = 0.5,
  className,
}: AnimatedGridPatternProps) {
  const containerRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!containerRef.current) return

    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: rect.width || 0,
          height: rect.height || 0,
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  const cols = Math.ceil(dimensions.width / width)
  const rows = Math.ceil(dimensions.height / height)

  return (
    <svg
      ref={containerRef}
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
    >
      <defs>
        <pattern id="grid-pattern" width={width} height={height} patternUnits="userSpaceOnUse">
          <path
            d={`M ${width} 0 L 0 0 0 ${height}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      <svg x="0" y="0" className="overflow-visible">
        {Array.from({ length: numSquares }).map((_, i) => {
          const x = Math.floor(Math.random() * cols) * width
          const y = Math.floor(Math.random() * rows) * height
          return (
            <rect
              key={`square-${i}`}
              x={x}
              y={y}
              width={width}
              height={height}
              fill="currentColor"
              strokeWidth="0"
              opacity="0"
              className="animate-pulse-glow"
              style={{
                animationDelay: `${i * (duration / numSquares)}s`,
                animationDuration: `${duration}s`,
              }}
            >
              <animate
                attributeName="opacity"
                from="0"
                to={maxOpacity}
                dur={`${duration}s`}
                begin={`${i * (duration / numSquares) + repeatDelay}s`}
                repeatCount="indefinite"
              />
            </rect>
          )
        })}
      </svg>
    </svg>
  )
}
