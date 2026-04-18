import * as React from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { cn } from "../../lib/utils"

export interface CardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "raised" | "flat"
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-white border border-gray-100 shadow-sm",
      raised: "bg-skeuo-white border border-gray-50 shadow-[var(--shadow-skeuo)]",
      flat: "bg-gray-50 border border-gray-100",
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
