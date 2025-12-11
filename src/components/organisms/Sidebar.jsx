import React from "react";
import { motion } from "framer-motion";
import SidebarItem from "@/components/molecules/SidebarItem";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = ({ isOpen, onClose }) => {
const sidebarItems = [
    { to: "/dashboard", icon: "LayoutDashboard", label: "Dashboard" },
    { to: "/transactions", icon: "FileText", label: "Transactions" },
    { to: "/projects", icon: "Home", label: "Projects" },
    { to: "/documents", icon: "FileImage", label: "Documents" }
  ];

  // Desktop sidebar
  const DesktopSidebar = () => (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 sidebar-gradient overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <ApperIcon name="Building" size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">DealFlow</h1>
          </div>
        </div>
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-4 pb-4 space-y-2">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.to}
                to={item.to}
                icon={item.icon}
              >
                {item.label}
              </SidebarItem>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );

  // Mobile sidebar
  const MobileSidebar = () => (
    <>
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={onClose}
        />
      )}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isOpen ? "0%" : "-100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 sidebar-gradient"
      >
        <div className="flex flex-col h-full pt-5">
          <div className="flex items-center justify-between flex-shrink-0 px-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <ApperIcon name="Building" size={24} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">DealFlow</h1>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-4 pb-4 space-y-2">
              {sidebarItems.map((item) => (
                <SidebarItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  onClick={onClose}
                >
                  {item.label}
                </SidebarItem>
              ))}
            </nav>
          </div>
        </div>
      </motion.div>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;