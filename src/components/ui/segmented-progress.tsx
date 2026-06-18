"use client"

// Adapted from 21st.dev — original: SegmentedProgress by @igorbedesqui
import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface SegmentedProgressProps {
  value: number          // 0-100
  segments?: number
  label?: string
  showPercentage?: boolean
  filledClass?: string
  emptyClass?: string
  className?: string
}

export function SegmentedProgress({
  value,
  segments = 20,
  label,
  showPercentage = true,
  filledClass = "bg-primary",
  emptyClass = "bg-muted/60",
  className,
}: SegmentedProgressProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const animationRef = useRef<number | null>(null)
  const startValueRef = useRef(0)
  const startTimeRef = useRef(0)

  const filledSegments = Math.round((displayValue / 100) * segments)

  useEffect(() => {
    if (!isInitialized) {
      const t = setTimeout(() => setIsInitialized(true), 50)
      return () => clearTimeout(t)
    }

    const duration = 800
    startValueRef.current = displayValue
    startTimeRef.current = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(startValueRef.current + (value - startValueRef.current) * eased)
      if (progress < 1) animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isInitialized])

  const getSegmentStyle = (index: number) => {
    if (hoveredSegment === null) return {}
    const distance = Math.abs(hoveredSegment - index)
    if (distance === 0) return { transform: "scaleY(1.3) translateY(-1px)" }
    if (distance <= 3) {
      const falloff = Math.cos((distance / 3) * (Math.PI / 2))
      return { transform: `scaleY(${1 + 0.2 * falloff}) translateY(${-0.5 * falloff}px)` }
    }
    return {}
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs font-medium text-muted-foreground tracking-wide">{label}</span>}
          {showPercentage && (
            <span className="text-xs font-semibold text-foreground tabular-nums">
              {Math.round(displayValue)}%
            </span>
          )}
        </div>
      )}

      <div
        className="flex gap-[3px] py-0.5"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {Array.from({ length: segments }).map((_, index) => {
          const isFilled = index < filledSegments
          return (
            <div
              key={index}
              onMouseEnter={() => setHoveredSegment(index)}
              onMouseLeave={() => setHoveredSegment(null)}
              className={cn(
                "h-2.5 flex-1 rounded-[4px] cursor-default origin-center",
                "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                isFilled ? filledClass : emptyClass,
                hoveredSegment !== null && !isFilled && "opacity-60",
              )}
              style={{
                ...getSegmentStyle(index),
                transitionDelay: isInitialized ? `${index * 20}ms` : "0ms",
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
