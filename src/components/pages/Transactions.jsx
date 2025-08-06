import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { transactionService } from "@/services/api/transactionService";
import TransactionCard from "@/components/molecules/TransactionCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (err) {
      setError("Failed to load transactions");
      console.error("Error loading transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === "all" || transaction.status.toLowerCase().replace(" ", "-") === filter;
    const matchesSearch = transaction.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.transactionType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusFilters = [
    { value: "all", label: "All Transactions", count: transactions.length },
    { value: "new", label: "New", count: transactions.filter(t => t.status === "New").length },
    { value: "in-progress", label: "In Progress", count: transactions.filter(t => t.status === "In Progress").length },
    { value: "under-contract", label: "Under Contract", count: transactions.filter(t => t.status === "Under Contract").length },
    { value: "closing", label: "Closing", count: transactions.filter(t => t.status === "Closing").length },
    { value: "completed", label: "Completed", count: transactions.filter(t => t.status === "Completed").length }
  ];

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadTransactions} />;
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg p-6 card-shadow"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-wrap gap-2">
            {statusFilters.map(statusFilter => (
              <Button
                key={statusFilter.value}
                variant={filter === statusFilter.value ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilter(statusFilter.value)}
                className="flex items-center space-x-2"
              >
                <span>{statusFilter.label}</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                  {statusFilter.count}
                </span>
              </Button>
            ))}
          </div>
          
          <div className="relative w-full lg:w-64">
            <ApperIcon 
              name="Search" 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            />
          </div>
        </div>
      </motion.div>

      {/* Transactions Grid */}
      {filteredTransactions.length === 0 ? (
        <Empty 
          title={searchTerm ? "No transactions found" : "No transactions yet"}
          description={
            searchTerm 
              ? `No transactions match "${searchTerm}". Try adjusting your search criteria.`
              : "Get started by creating your first transaction."
          }
          actionLabel="Create Transaction"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <TransactionCard transaction={transaction} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Summary */}
      {filteredTransactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center text-gray-600"
        >
          Showing {filteredTransactions.length} of {transactions.length} transactions
          {searchTerm && ` matching "${searchTerm}"`}
          {filter !== "all" && ` with status "${statusFilters.find(f => f.value === filter)?.label}"`}
        </motion.div>
      )}
    </div>
  );
};

export default Transactions;