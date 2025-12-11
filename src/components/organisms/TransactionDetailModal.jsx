import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { transactionService } from "@/services/api/transactionService";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";

const TransactionDetailModal = ({ isOpen, onClose, transaction }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    propertyAddress: "",
    transactionType: "Sale",
    purchasePrice: "",
    estimatedClosingDate: "",
    status: "New",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (transaction) {
      setFormData({
        propertyAddress: transaction.propertyAddress || "",
        transactionType: transaction.transactionType || "Sale",
        purchasePrice: transaction.purchasePrice || "",
        estimatedClosingDate: transaction.estimatedClosingDate || "",
        status: transaction.status || "New",
        notes: transaction.notes || ""
      });
    }
  }, [transaction]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.propertyAddress.trim()) {
      newErrors.propertyAddress = "Property address is required";
    }
    
    if (formData.purchasePrice && isNaN(Number(formData.purchasePrice.replace(/[,$]/g, "")))) {
      newErrors.purchasePrice = "Purchase price must be a valid number";
    }
    
    if (!formData.estimatedClosingDate) {
      newErrors.estimatedClosingDate = "Estimated closing date is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Clean up purchase price for storage
      const cleanPrice = formData.purchasePrice ? 
        formData.purchasePrice.replace(/[,$]/g, "") : "";
      
      const updateData = {
        ...formData,
        purchasePrice: cleanPrice
      };
      
      await transactionService.update(transaction.Id, updateData);
      toast.success("Transaction updated successfully!");
      setIsEditing(false);
      
      // Trigger a page refresh to show updated data
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error("Failed to update transaction. Please try again.");
      console.error("Error updating transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this transaction? This action cannot be undone.")) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await transactionService.delete(transaction.Id);
      toast.success("Transaction deleted successfully!");
      onClose();
      
      // Trigger a page refresh to show updated data
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error("Failed to delete transaction. Please try again.");
      console.error("Error deleting transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsEditing(false);
      setErrors({});
      onClose();
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "";
    const numValue = Number(value.toString().replace(/[,$]/g, ""));
    return numValue.toLocaleString();
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  if (!transaction) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ApperIcon 
                      name={transaction.transactionType === "Sale" ? "Home" : 
                           transaction.transactionType === "Purchase" ? "ShoppingCart" : "Key"} 
                      size={20} 
                      className="text-primary" 
                    />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Transaction Details
                    </h2>
                    <p className="text-sm text-gray-500">
                      ID: {transaction.Id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      disabled={isSubmitting}
                      className="flex items-center space-x-2"
                    >
                      <ApperIcon name="Edit2" size={16} />
                      <span>Edit</span>
                    </Button>
                  )}
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <ApperIcon name="X" size={20} />
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <Badge size="md" className="text-sm">
                      {formData.status}
                    </Badge>
                    <div className="text-right text-sm text-gray-500">
                      <p>Created: {formatDate(transaction.createdAt)}</p>
                      <p>Updated: {formatDate(transaction.updatedAt)}</p>
                    </div>
                  </div>

                  {/* Property Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Property Information</h3>
                    
                    {isEditing ? (
                      <FormField
                        label="Property Address"
                        required
                        value={formData.propertyAddress}
                        onChange={(e) => handleInputChange("propertyAddress", e.target.value)}
                        placeholder="Enter property address"
                        error={errors.propertyAddress}
                        disabled={isSubmitting}
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Property Address
                        </label>
                        <p className="text-gray-900">{formData.propertyAddress}</p>
                      </div>
                    )}
                  </div>

                  {/* Transaction Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Transaction Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Transaction Type */}
                      {isEditing ? (
                        <FormField
                          label="Transaction Type"
                          component="select"
                          required
                          value={formData.transactionType}
                          onChange={(e) => handleInputChange("transactionType", e.target.value)}
                          error={errors.transactionType}
                          disabled={isSubmitting}
                        >
                          <option value="Sale">Sale</option>
                          <option value="Purchase">Purchase</option>
                          <option value="Lease">Lease</option>
                          <option value="Refinance">Refinance</option>
                        </FormField>
                      ) : (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Transaction Type
                          </label>
                          <p className="text-gray-900">{formData.transactionType}</p>
                        </div>
                      )}

                      {/* Status */}
                      {isEditing && (
                        <FormField
                          label="Status"
                          component="select"
                          required
                          value={formData.status}
                          onChange={(e) => handleInputChange("status", e.target.value)}
                          error={errors.status}
                          disabled={isSubmitting}
                        >
                          <option value="New">New</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Under Contract">Under Contract</option>
                          <option value="Closing">Closing</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </FormField>
                      )}
                    </div>

                    {/* Purchase Price */}
                    {isEditing ? (
                      <FormField
                        label="Purchase Price"
                        value={formData.purchasePrice}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^\d.]/g, "");
                          handleInputChange("purchasePrice", value);
                        }}
                        placeholder="Enter purchase price"
                        error={errors.purchasePrice}
                        disabled={isSubmitting}
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Purchase Price
                        </label>
                        <p className="text-gray-900">
                          {formData.purchasePrice ? `$${formatCurrency(formData.purchasePrice)}` : "Not specified"}
                        </p>
                      </div>
                    )}

                    {/* Estimated Closing Date */}
                    {isEditing ? (
                      <FormField
                        label="Estimated Closing Date"
                        type="date"
                        required
                        value={formData.estimatedClosingDate}
                        onChange={(e) => handleInputChange("estimatedClosingDate", e.target.value)}
                        error={errors.estimatedClosingDate}
                        disabled={isSubmitting}
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estimated Closing Date
                        </label>
                        <p className="text-gray-900">{formatDate(formData.estimatedClosingDate)}</p>
                      </div>
                    )}

                    {/* Notes */}
                    {isEditing ? (
                      <FormField
                        label="Notes"
                        component="textarea"
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        placeholder="Add any additional notes..."
                        error={errors.notes}
                        disabled={isSubmitting}
                        rows={3}
                      />
                    ) : (
                      formData.notes && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                          </label>
                          <p className="text-gray-900 whitespace-pre-wrap">{formData.notes}</p>
                        </div>
)
                    )}
                  </div>

                  {/* Documents Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Documents</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ApperIcon name="FileImage" size={20} className="text-gray-600" />
                          <span className="text-sm text-gray-700">
                            Manage transaction documents
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            window.open(`/documents#transaction-${transaction.Id}`, '_blank');
                          }}
                          className="flex items-center space-x-2"
                        >
                          <ApperIcon name="ExternalLink" size={16} />
                          <span>View Documents</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200">
                <div>
                  {isEditing && (
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isSubmitting}
                      className="flex items-center space-x-2"
                    >
                      <ApperIcon name="Trash2" size={16} />
                      <span>Delete</span>
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  {isEditing ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setErrors({});
                          // Reset form data
                          if (transaction) {
                            setFormData({
                              propertyAddress: transaction.propertyAddress || "",
                              transactionType: transaction.transactionType || "Sale",
                              purchasePrice: transaction.purchasePrice || "",
                              estimatedClosingDate: transaction.estimatedClosingDate || "",
                              status: transaction.status || "New",
                              notes: transaction.notes || ""
                            });
                          }
                        }}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="flex items-center space-x-2"
                      >
                        {isSubmitting ? (
                          <>
                            <ApperIcon name="Loader2" size={16} className="animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <ApperIcon name="Save" size={16} />
                            <span>Save Changes</span>
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={isSubmitting}
                    >
                      Close
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TransactionDetailModal;