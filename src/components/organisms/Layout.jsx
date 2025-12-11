import React, { useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import Sidebar from "@/components/organisms/Sidebar";
import Header from "@/components/organisms/Header";
import CreateTransactionModal from "@/components/organisms/CreateTransactionModal";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleCreateTransaction = () => {
    setIsCreateModalOpen(true);
  };

  // Context to pass to child routes
  const outletContext = {
    isSidebarOpen,
    setIsSidebarOpen,
    isCreateModalOpen,
    setIsCreateModalOpen,
    toggleSidebar,
    closeSidebar,
    handleCreateTransaction,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <Header 
        onMenuToggle={toggleSidebar}
        onCreateTransaction={handleCreateTransaction}
      />
      <main className="lg:ml-64 pt-16">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <Outlet context={outletContext} />
        </div>
      </main>
      <CreateTransactionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default Layout;