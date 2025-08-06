import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Select = forwardRef(({ 
  children,
  className, 
  error = false,
  ...props 
}, ref) => {
  const baseClasses = "w-full px-3 py-2.5 text-sm bg-white border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const stateClasses = error 
    ? "border-error focus:border-error focus:ring-error" 
    : "border-gray-300 focus:border-primary focus:ring-primary";

  return (
    <select
      ref={ref}
      className={cn(baseClasses, stateClasses, className)}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = "Select";

export default Select;