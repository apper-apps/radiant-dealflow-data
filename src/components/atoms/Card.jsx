import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Card = forwardRef(({ 
  children, 
  className, 
  hover = false,
  padding = "md",
  ...props 
}, ref) => {
  const baseClasses = "bg-white rounded-lg border border-gray-200 transition-all duration-200";
  
  const hoverClasses = hover 
    ? "hover:-translate-y-0.5 hover:shadow-lg cursor-pointer card-shadow hover:card-shadow-hover" 
    : "card-shadow";
    
  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
    xl: "p-8"
  };

  return (
    <div
      ref={ref}
      className={cn(
        baseClasses,
        hoverClasses,
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;