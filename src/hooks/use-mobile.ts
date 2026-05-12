import * as React from "react"

const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
} as const

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.mobile - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.mobile)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < BREAKPOINTS.mobile)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(
      `(min-width: ${BREAKPOINTS.mobile}px) and (max-width: ${BREAKPOINTS.tablet - 1}px)`
    )
    const onChange = () => {
      setIsTablet(
        window.innerWidth >= BREAKPOINTS.mobile &&
          window.innerWidth < BREAKPOINTS.tablet
      )
    }
    mql.addEventListener("change", onChange)
    setIsTablet(
      window.innerWidth >= BREAKPOINTS.mobile &&
        window.innerWidth < BREAKPOINTS.tablet
    )
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isTablet
}

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState<boolean | undefined>(
    undefined
  )

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS.tablet}px)`)
    const onChange = () => {
      setIsDesktop(window.innerWidth >= BREAKPOINTS.tablet)
    }
    mql.addEventListener("change", onChange)
    setIsDesktop(window.innerWidth >= BREAKPOINTS.tablet)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isDesktop
}
