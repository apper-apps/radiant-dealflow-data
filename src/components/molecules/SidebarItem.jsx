import React from "react";
import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const SidebarItem = ({ to, icon, children, onClick }) => {
  const baseClasses = "flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-white/10";
  
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn(baseClasses, "w-full text-left text-white/80 hover:text-white")}
      >
        <ApperIcon name={icon} size={20} />
        <span>{children}</span>
      </button>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          baseClasses,
          isActive 
            ? "bg-white/20 text-white" 
            : "text-white/80 hover:text-white"
        )
      }
    >
      <ApperIcon name={icon} size={20} />
      <span>{children}</span>
    </NavLink>
  );
};

export default SidebarItem;