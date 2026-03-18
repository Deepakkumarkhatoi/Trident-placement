import { useEffect, useState } from "react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)")
    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }
    mq.addEventListener("change", onChange)
    setIsMobile(mq.matches)
    return () => mq.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
