import React from "react";
import { useLocation } from "react-router-dom";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Header = ({ onMenuToggle, onCreateTransaction }) => {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
      case "/dashboard":
        return "Dashboard";
case "/transactions":
        return "Transactions";
      case "/documents":
        return "Documents";
      default:
        return "DealFlow";
    }
  };

  const showCreateButton = location.pathname === "/transactions";

  return (
    <header className="bg-white border-b border-gray-200 lg:ml-64">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <ApperIcon name="Menu" size={24} />
            </button>
            <h1 className="ml-3 lg:ml-0 text-2xl font-bold text-gray-900">
              {getPageTitle()}
            </h1>
          </div>
          
          {showCreateButton && (
            <Button
              onClick={onCreateTransaction}
              className="flex items-center space-x-2"
            >
              <ApperIcon name="Plus" size={20} />
              <span>New Transaction</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;