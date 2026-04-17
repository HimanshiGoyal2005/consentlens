"use client";

import { motion } from "framer-motion";

export function PillButton({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled, 
  className = "" 
}) {
  const baseStyles = "rounded-[var(--radius-card)] font-bold transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed select-none";
  
  const variants = {
    primary: "bg-primary text-white shadow-lg shadow-primary/20 active:scale-95",
    accent: "bg-accent text-white shadow-md shadow-accent/15",
    ghost: "bg-transparent text-primary hover:bg-primary/5",
    pink: "bg-pink text-white shadow-lg shadow-pink/20",
    outline: "border-2 border-primary/20 text-primary hover:bg-primary/5"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
