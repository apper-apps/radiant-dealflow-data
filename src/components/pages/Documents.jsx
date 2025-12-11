import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { transactionService } from "@/services/api/transactionService";
import { documentService } from "@/services/api/documentService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";

const Documents = () => {
  const [transactions, setTransactions] = useState([]);
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState({});

const documentTypes = [
    { id: "purchase_sale_contracts", name: "Purchase & Sale Contracts", icon: "FileContract" },
    { id: "appraisals", name: "Appraisals", icon: "TrendingUp" },
    { id: "inspections", name: "Inspections", icon: "Search" },
    { id: "settlement_statements", name: "Settlement Statements", icon: "Calculator" },
    { id: "photos", name: "Photos", icon: "Image" },
    { id: "miscellaneous", name: "Miscellaneous", icon: "FolderOpen" }
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [transactionsData, documentsData] = await Promise.all([
        transactionService.getAll(),
        documentService.getAll()
      ]);
      
      setTransactions(transactionsData);
      setDocuments(documentsData);
    } catch (err) {
      setError("Failed to load documents data");
      console.error("Error loading documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileUpload = async (transactionId, documentType, files) => {
    if (!files || files.length === 0) return;

    const uploadKey = `${transactionId}-${documentType}`;
    setUploadingFiles(prev => ({ ...prev, [uploadKey]: true }));

    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('transactionId', transactionId.toString());
      formData.append('documentType', documentType);

      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const result = await apperClient.functions.invoke(import.meta.env.VITE_UPLOAD_DOCUMENT, {
        body: formData
      });

      if (result.success) {
        toast.success("Document uploaded successfully!");
        // Reload documents data
        const updatedDocuments = await documentService.getAll();
        setDocuments(updatedDocuments);
      } else {
        console.info(`apper_info: Got an error in this function: ${import.meta.env.VITE_UPLOAD_DOCUMENT}. The response body is: ${JSON.stringify(result)}.`);
        toast.error(result.error || "Upload failed");
      }
    } catch (error) {
      console.info(`apper_info: Got this error an this function: ${import.meta.env.VITE_UPLOAD_DOCUMENT}. The error is: ${error.message}`);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploadingFiles(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const handleDownload = async (transactionId, documentType, filename) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const result = await apperClient.functions.invoke(import.meta.env.VITE_DOWNLOAD_DOCUMENT, {
        body: JSON.stringify({
          transactionId: transactionId.toString(),
          documentType,
          filename
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (result.success && result.fileUrl) {
        // Create download link
        const link = document.createElement('a');
        link.href = result.fileUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Document downloaded!");
      } else {
        toast.error("Download failed");
      }
    } catch (error) {
      toast.error("Download failed. Please try again.");
    }
  };

  const getDocumentCount = (transactionId, documentType) => {
    const key = `${transactionId}-${documentType}`;
    return documents[key] ? documents[key].length : 0;
  };

  const getDocumentFiles = (transactionId, documentType) => {
    const key = `${transactionId}-${documentType}`;
    return documents[key] || [];
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  if (transactions.length === 0) {
    return (
      <Empty 
        title="No transactions found"
        description="Create transactions first to manage their documents."
        actionLabel="Go to Transactions"
        onAction={() => window.location.href = '/transactions'}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg p-6 card-shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ApperIcon name="FileImage" size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
              <p className="text-gray-600">Upload and manage transaction documents</p>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>{transactions.length} transactions</p>
            <p>{Object.values(documents).flat().length} total documents</p>
          </div>
        </div>
      </motion.div>

      {/* Documents Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  {documentTypes.map(docType => (
                    <th key={docType.id} className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col items-center space-y-1">
                        <ApperIcon name={docType.icon} size={16} />
                        <span className="hidden sm:block">{docType.name}</span>
                        <span className="sm:hidden">{docType.name.split(' ')[0]}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction.Id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <ApperIcon 
                            name={transaction.transactionType === "Sale" ? "Home" : 
                                 transaction.transactionType === "Purchase" ? "ShoppingCart" : "Key"} 
                            size={16} 
                            className="text-primary" 
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {transaction.propertyAddress}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.transactionType} • ID: {transaction.Id}
                          </div>
                        </div>
                      </div>
                    </td>
                    {documentTypes.map(docType => {
                      const uploadKey = `${transaction.Id}-${docType.id}`;
                      const isUploading = uploadingFiles[uploadKey];
                      const documentCount = getDocumentCount(transaction.Id, docType.id);
                      const files = getDocumentFiles(transaction.Id, docType.id);
                      
                      return (
                        <td key={docType.id} className="px-6 py-4 text-center">
                          <div className="space-y-2">
                            {/* Upload Button */}
                            <div className="relative">
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileUpload(transaction.Id, docType.id, e.target.files)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={isUploading}
                                id={uploadKey}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isUploading}
                                className="flex items-center space-x-1"
                              >
                                {isUploading ? (
                                  <>
                                    <ApperIcon name="Loader2" size={14} className="animate-spin" />
                                    <span className="hidden sm:inline">Uploading...</span>
                                  </>
                                ) : (
                                  <>
                                    <ApperIcon name="Upload" size={14} />
                                    <span className="hidden sm:inline">Upload</span>
                                  </>
                                )}
                              </Button>
                            </div>
                            
                            {/* Document Count Badge */}
                            {documentCount > 0 && (
                              <div className="flex flex-col items-center space-y-1">
                                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  {documentCount} file{documentCount !== 1 ? 's' : ''}
                                </div>
                                
                                {/* File List */}
                                <div className="space-y-1">
                                  {files.map((file, fileIndex) => (
                                    <button
                                      key={fileIndex}
                                      onClick={() => handleDownload(transaction.Id, docType.id, file.filename)}
                                      className="text-xs text-blue-600 hover:text-blue-800 underline block max-w-24 truncate"
                                      title={file.filename}
                                    >
                                      {file.filename}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        {documentTypes.map(docType => {
          const totalCount = transactions.reduce((total, transaction) => 
            total + getDocumentCount(transaction.Id, docType.id), 0
          );
          
          return (
            <Card key={docType.id} className="p-4 text-center">
              <div className="flex flex-col items-center space-y-2">
                <ApperIcon name={docType.icon} size={20} className="text-gray-600" />
                <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
                <div className="text-xs text-gray-500 text-center">
                  {docType.name}
                </div>
              </div>
            </Card>
          );
        })}
      </motion.div>
    </div>
  );
};

export default Documents;