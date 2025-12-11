import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { transactionService } from "@/services/api/transactionService";
import { documentService } from "@/services/api/documentService";
import ApperIcon from "@/components/ApperIcon";
import Documents from "@/components/pages/Documents";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch transaction details
        const transactionData = await transactionService.getById(parseInt(id));
        setTransaction(transactionData);
        
        // Fetch associated documents
        const documentsData = await documentService.getByTransaction(parseInt(id));
        setDocuments(documentsData);
        
      } catch (err) {
        setError("Failed to load project details");
        console.error("Error fetching project data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const formatCurrency = (value) => {
    if (!value) return "Not specified";
    const numValue = Number(value.toString().replace(/[,$]/g, ""));
    return `$${numValue.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const handlePhotoUpload = (files) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('transactionId', transaction.Id);
          formData.append('documentType', 'photos');
          
          const response = await fetch(`/api/upload-document`, {
            method: 'POST',
            body: formData
          });
          
          if (response.ok) {
            toast.success(`Photo ${file.name} uploaded successfully!`);
            // Refresh documents
            const documentsData = await documentService.getByTransaction(transaction.Id);
            setDocuments(documentsData);
          } else {
            throw new Error('Upload failed');
          }
        } catch (error) {
          toast.error(`Failed to upload ${file.name}`);
          console.error('Photo upload error:', error);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCameraCapture = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          video.srcObject = stream;
          video.play();
          
          const modal = document.createElement('div');
          modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
          modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 class="text-lg font-medium mb-4">Take Photo</h3>
              <video autoplay class="w-full mb-4 rounded-lg"></video>
              <div class="flex space-x-2">
                <button id="capture-btn" class="flex-1 bg-primary text-white px-4 py-2 rounded-lg">Capture</button>
                <button id="cancel-btn" class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg">Cancel</button>
              </div>
            </div>
          `;
          
          const modalVideo = modal.querySelector('video');
          modalVideo.srcObject = stream;
          
          modal.querySelector('#capture-btn').onclick = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
ctx.drawImage(video, 0, 0);
            
            canvas.toBlob(async (blob) => {
              // Create File object with fallback for older browsers
              let file;
              if (typeof File === 'function') {
                file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
              } else {
                // Fallback for browsers that don't support File constructor
                file = blob;
                file.name = `photo-${Date.now()}.jpg`;
                file.lastModified = Date.now();
              }
              
              try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('transactionId', transaction.Id);
                formData.append('documentType', 'photos');
                
                const response = await fetch(`/api/upload-document`, {
                  method: 'POST',
                  body: formData
                });
                
                if (response.ok) {
                  toast.success('Photo captured and uploaded successfully!');
                  const documentsData = await documentService.getByTransaction(transaction.Id);
                  setDocuments(documentsData);
                } else {
                  throw new Error('Upload failed');
                }
              } catch (error) {
                toast.error('Failed to upload photo');
                console.error('Photo upload error:', error);
              }
              
              stream.getTracks().forEach(track => track.stop());
              document.body.removeChild(modal);
            }, 'image/jpeg', 0.8);
          };
          
          modal.querySelector('#cancel-btn').onclick = () => {
            stream.getTracks().forEach(track => track.stop());
            document.body.removeChild(modal);
          };
          
          document.body.appendChild(modal);
        })
        .catch(error => {
          toast.error('Camera access denied or not available');
          console.error('Camera error:', error);
        });
    } else {
      toast.error('Camera not supported on this device');
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!transaction) return <Error message="Project not found" />;

  const photos = documents[`${transaction.Id}-photos`] || [];
  const otherDocuments = Object.entries(documents).filter(([key]) => !key.endsWith('-photos'));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="ArrowLeft" size={16} />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{transaction.propertyName}</h1>
            <p className="text-gray-500">{transaction.propertyAddress}</p>
          </div>
        </div>
        <Badge size="lg" className="text-sm">
          {transaction.status}
        </Badge>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: "overview", label: "Overview", icon: "Home" },
            { id: "photos", label: "Photos", icon: "Image" },
            { id: "documents", label: "Documents", icon: "FileText" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <ApperIcon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Property Information */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Property Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Property Name</label>
                  <p className="text-gray-900">{transaction.propertyName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900">{transaction.propertyAddress}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Purchase Date</label>
                  <p className="text-gray-900">{formatDate(transaction.propertyPurchaseDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <p className="text-gray-900">{transaction.propertyStatus}</p>
                </div>
              </div>
            </Card>

            {/* Transaction Details */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Transaction Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Transaction Type</label>
                  <p className="text-gray-900">{transaction.transactionType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Purchase Price</label>
                  <p className="text-gray-900">{formatCurrency(transaction.purchasePrice)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Estimated Closing Date</label>
                  <p className="text-gray-900">{formatDate(transaction.estimatedClosingDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Created</label>
                  <p className="text-gray-900">{formatDate(transaction.createdAt)}</p>
                </div>
              </div>
            </Card>

            {/* Notes */}
            {transaction.notes && (
              <Card className="p-6 lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{transaction.notes}</p>
              </Card>
            )}
          </div>
        )}

        {activeTab === "photos" && (
          <div className="space-y-6">
            {/* Upload Controls */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Project Photos</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    multiple
                    className="hidden"
                    id="photo-upload-details"
                    onChange={(e) => {
                      handlePhotoUpload(e.target.files);
                      e.target.value = '';
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('photo-upload-details').click()}
                    className="flex items-center space-x-2"
                  >
                    <ApperIcon name="Upload" size={16} />
                    <span>Upload Photos</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCameraCapture}
                    className="flex items-center space-x-2"
                  >
                    <ApperIcon name="Camera" size={16} />
                    <span>Take Photo</span>
                  </Button>
                </div>
              </div>

              {/* Photos Grid */}
              {photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <img
                        src={`/api/download-document?id=${photo.id}`}
                        alt={photo.originalName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white text-gray-700"
                            onClick={() => window.open(`/api/download-document?id=${photo.id}`, '_blank')}
                          >
                            <ApperIcon name="Eye" size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              if (confirm('Delete this photo?')) {
                                try {
                                  await documentService.deleteDocument(transaction.Id, 'photos', photo.id);
                                  toast.success('Photo deleted successfully');
                                  const documentsData = await documentService.getByTransaction(transaction.Id);
                                  setDocuments(documentsData);
                                } catch (error) {
                                  toast.error('Failed to delete photo');
                                  console.error('Delete error:', error);
                                }
                              }
                            }}
                          >
                            <ApperIcon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                        <p className="text-white text-xs truncate">{photo.originalName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ApperIcon name="Image" size={48} className="mx-auto text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No photos yet</h4>
                  <p className="text-gray-500 mb-4">Upload photos or use the camera to capture images for this project.</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Project Documents</h3>
                <Button
                  variant="outline"
                  onClick={() => window.open(`/documents#transaction-${transaction.Id}`, '_blank')}
                  className="flex items-center space-x-2"
                >
                  <ApperIcon name="ExternalLink" size={16} />
                  <span>Manage Documents</span>
                </Button>
              </div>

              {otherDocuments.length > 0 ? (
                <div className="space-y-4">
                  {otherDocuments.map(([key, docs]) => {
                    const [, docType] = key.split('-');
                    const typeNames = {
                      purchase_sale_contracts: 'Purchase & Sale Contracts',
                      appraisals: 'Appraisals', 
                      inspections: 'Inspections',
                      settlement_statements: 'Settlement Statements',
                      miscellaneous: 'Miscellaneous'
                    };
                    
                    return (
                      <div key={key} className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{typeNames[docType] || docType}</h4>
                        <div className="space-y-2">
                          {docs.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                              <div>
                                <p className="font-medium text-gray-900">{doc.originalName}</p>
                                <p className="text-sm text-gray-500">
                                  Uploaded {formatDate(doc.uploadDate)}
                                </p>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`/api/download-document?id=${doc.id}`, '_blank')}
                              >
                                <ApperIcon name="Download" size={16} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ApperIcon name="FileText" size={48} className="mx-auto text-gray-400 mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h4>
                  <p className="text-gray-500">Documents for this project will appear here.</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProjectDetails;