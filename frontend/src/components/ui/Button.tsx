import * as React from "react"
import { motion, type HTMLMotionProps } from "framer-motion"
import { cn } from "../../lib/utils"

export interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const variants = {
      primary: "bg-skeuo-primary text-white shadow-[var(--shadow-skeuo)] border border-blue-400 hover:shadow-[var(--shadow-skeuo-hover)] active:shadow-[var(--shadow-skeuo-active)]",
      secondary: "bg-white text-gray-800 shadow-[var(--shadow-skeuo)] border border-gray-200 hover:shadow-[var(--shadow-skeuo-hover)] active:shadow-[var(--shadow-skeuo-active)]",
      outline: "bg-transparent text-gray-700 border-2 border-gray-300 hover:border-gray-400",
      ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
    }
    
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5 text-base",
      lg: "px-8 py-3.5 text-lg font-medium",
    }

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
