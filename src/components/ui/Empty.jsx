import React from "react";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No transactions found", 
  description = "Get started by creating your first transaction.",
  actionLabel = "Create Transaction",
  onAction 
}) => {
  return (
    <Card className="text-center py-16">
      <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <ApperIcon name="FileText" size={40} className="text-primary" />
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-3">
        {title}
      </h3>
      <p className="text-gray-600 mb-8 max-w-sm mx-auto">
        {description}
      </p>
      {onAction && (
        <Button onClick={onAction} className="flex items-center space-x-2 mx-auto">
          <ApperIcon name="Plus" size={16} />
          <span>{actionLabel}</span>
        </Button>
      )}
    </Card>
  );
};

export default Empty;