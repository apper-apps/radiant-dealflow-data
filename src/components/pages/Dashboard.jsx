import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { transactionService } from "@/services/api/transactionService";
import StatCard from "@/components/molecules/StatCard";
import TransactionCard from "@/components/molecules/TransactionCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [statsData, transactionsData] = await Promise.all([
        transactionService.getStats(),
        transactionService.getAll()
      ]);
      
      setStats(statsData);
      // Show only the 4 most recent transactions
      setRecentTransactions(
        transactionsData
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          .slice(0, 4)
      );
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <Loading type="stats" />
        <div>
          <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return <Error message={error} onRetry={loadDashboardData} />;
  }

  const statCards = [
    {
      title: "Active Transactions",
      value: stats?.totalActive || 0,
      icon: "FileText",
      color: "primary"
    },
    {
      title: "Closing This Month",
      value: stats?.closingThisMonth || 0,
      icon: "Calendar",
      color: "warning"
    },
    {
      title: "Completed This Month",
      value: stats?.completedThisMonth || 0,
      icon: "CheckCircle",
      color: "success"
    },
    {
      title: "Total Deals",
      value: Object.values(stats?.byStatus || {}).reduce((a, b) => a + b, 0),
      icon: "TrendingUp",
      color: "info"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Transactions
          </h2>
          <motion.a
            href="/transactions"
            className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
            whileHover={{ x: 4 }}
          >
            View all →
          </motion.a>
        </div>

        {recentTransactions.length === 0 ? (
          <Empty 
            title="No transactions yet"
            description="Create your first transaction to get started with DealFlow."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
{recentTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <TransactionCard 
                  transaction={transaction}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Status Breakdown */}
      {stats?.byStatus && Object.keys(stats.byStatus).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white rounded-lg p-6 card-shadow"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Status Breakdown
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600 capitalize">
                  {status.replace("-", " ")}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;