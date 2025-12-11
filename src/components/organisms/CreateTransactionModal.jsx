import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { transactionService } from "@/services/api/transactionService";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";

const CreateTransactionModal = ({ isOpen, onClose }) => {
const [formData, setFormData] = useState({
    propertyName: "",
    propertyAddress: "",
    propertyPurchaseDate: "",
    propertyStatus: "Pending - purchase",
    transactionType: "Sale",
    estimatedClosingDate: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

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
    
if (!formData.propertyName.trim()) {
      newErrors.propertyName = "Property name is required";
    }

    if (!formData.propertyAddress.trim()) {
      newErrors.propertyAddress = "Property address is required";
    }
    
    if (!formData.estimatedClosingDate) {
      newErrors.estimatedClosingDate = "Estimated closing date is required";
    } else {
      const selectedDate = new Date(formData.estimatedClosingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.estimatedClosingDate = "Closing date must be in the future";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await transactionService.create(formData);
      toast.success("Transaction created successfully!");
      
      // Reset form
      setFormData({
propertyName: "",
        propertyAddress: "",
        propertyPurchaseDate: "",
        propertyStatus: "Pending - purchase",
        transactionType: "Sale",
        estimatedClosingDate: ""
      });
      setErrors({});
      onClose();
      
      // Trigger a page refresh to show new data
      window.location.reload();
    } catch (error) {
      toast.error("Failed to create transaction. Please try again.");
      console.error("Error creating transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
propertyName: "",
        propertyAddress: "",
        propertyPurchaseDate: "",
        propertyStatus: "Pending - purchase",
        transactionType: "Sale",
        estimatedClosingDate: ""
      });
      setErrors({});
      onClose();
    }
  };

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
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ApperIcon name="Plus" size={20} className="text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Create New Transaction
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>
              
<form onSubmit={handleSubmit} className="p-6 space-y-4">
                <FormField
                  label="Property Name"
                  required
                  value={formData.propertyName}
                  onChange={(e) => handleInputChange("propertyName", e.target.value)}
                  placeholder="Enter property name"
                  error={errors.propertyName}
                  disabled={isSubmitting}
                />

                <FormField
                  label="Property Address"
                  required
                  value={formData.propertyAddress}
                  onChange={(e) => handleInputChange("propertyAddress", e.target.value)}
                  placeholder="Enter property address"
                  error={errors.propertyAddress}
                  disabled={isSubmitting}
                />

                <FormField
                  label="Property Purchase Date"
                  type="date"
                  value={formData.propertyPurchaseDate}
                  onChange={(e) => handleInputChange("propertyPurchaseDate", e.target.value)}
                  error={errors.propertyPurchaseDate}
                  disabled={isSubmitting}
                />

                <FormField
                  label="Property Status"
                  component="select"
                  required
                  value={formData.propertyStatus}
                  onChange={(e) => handleInputChange("propertyStatus", e.target.value)}
                  error={errors.propertyStatus}
                  disabled={isSubmitting}
                >
                  <option value="Pending - purchase">Pending - purchase</option>
                  <option value="Rehab">Rehab</option>
                  <option value="Listed">Listed</option>
                  <option value="Pending - sale">Pending - sale</option>
                </FormField>
                
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
                </FormField>
                
                <FormField
                  label="Estimated Closing Date"
                  type="date"
                  required
                  value={formData.estimatedClosingDate}
                  onChange={(e) => handleInputChange("estimatedClosingDate", e.target.value)}
                  error={errors.estimatedClosingDate}
                  disabled={isSubmitting}
                />
                
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <ApperIcon name="Loader2" size={16} className="animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <ApperIcon name="Plus" size={16} />
                        <span>Create Transaction</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateTransactionModal;