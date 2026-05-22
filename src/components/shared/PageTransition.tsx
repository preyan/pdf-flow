import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function PageTransition({ children, routeKey }: { children: ReactNode; routeKey: string }) {
  const reduced = useReducedMotion()
  const transition = reduced
    ? { duration: 0 }
    : { duration: 0.2, ease: 'easeOut' as const }

  return (
    <motion.div
      key={routeKey}
      initial={reduced ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, y: -4 }}
      transition={transition}
      className="h-full"
    >
      {children}
    </motion.div>
  )
}
