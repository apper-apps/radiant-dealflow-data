import React from "react";
import { format } from "date-fns";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";

const TransactionCard = ({ transaction, onClick }) => {
  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case "sale": return "Home";
      case "purchase": return "ShoppingCart";
      case "lease": return "Key";
      default: return "FileText";
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  return (
    <Card 
      hover 
      className="cursor-pointer transition-all duration-200"
      onClick={() => onClick && onClick(transaction)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ApperIcon 
              name={getTypeIcon(transaction.transactionType)} 
              size={20} 
              className="text-primary"
            />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 text-sm">
              {transaction.propertyAddress}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {transaction.transactionType}
            </p>
          </div>
        </div>
        <Badge size="sm">
          {transaction.status}
        </Badge>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <ApperIcon name="Calendar" size={14} />
          <span>Closing: {formatDate(transaction.estimatedClosingDate)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <ApperIcon name="Clock" size={14} />
          <span>Updated: {formatDate(transaction.updatedAt)}</span>
        </div>
      </div>
    </Card>
  );
};

export default TransactionCard;