import * as React from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { cn } from "../../lib/utils"

export interface CardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "raised" | "flat"
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-white border border-[rgba(37,99,235,0.06)] shadow-[var(--shadow-premium)]",
      raised: "bg-white border border-[rgba(37,99,235,0.08)] shadow-[var(--shadow-premium)] hover:shadow-[0_20px_40px_-12px_rgba(37,99,235,0.1)] transition-shadow duration-300",
      flat: "bg-white border border-[rgba(37,99,235,0.08)]",
    }
    
    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-2xl overflow-hidden p-6 text-gray-800",
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"
