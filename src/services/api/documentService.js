import documentsData from "@/services/mockData/documents.json";

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for documents
let documents = { ...documentsData };

export const documentService = {
  async getAll() {
    await delay(300);
    return { ...documents };
  },

  async getByTransaction(transactionId) {
    await delay(200);
    const transactionDocs = {};
    const transactionIdStr = transactionId.toString();
    
    Object.keys(documents).forEach(key => {
      if (key.startsWith(`${transactionIdStr}-`)) {
        transactionDocs[key] = [...documents[key]];
      }
    });
    
    return transactionDocs;
  },

  async addDocument(transactionId, documentType, documentInfo) {
    await delay(400);
    const key = `${transactionId}-${documentType}`;
    
    if (!documents[key]) {
      documents[key] = [];
    }
    
    const newDocument = {
      id: Date.now(),
      filename: documentInfo.filename,
      originalName: documentInfo.originalName,
      size: documentInfo.size,
      uploadDate: new Date().toISOString(),
      ...documentInfo
    };
    
    documents[key].push(newDocument);
    return newDocument;
  },

  async deleteDocument(transactionId, documentType, documentId) {
    await delay(300);
    const key = `${transactionId}-${documentType}`;
    
    if (documents[key]) {
      documents[key] = documents[key].filter(doc => doc.id !== documentId);
      if (documents[key].length === 0) {
        delete documents[key];
      }
      return true;
    }
    
    throw new Error("Document not found");
  },

  async getDocument(transactionId, documentType, documentId) {
    await delay(200);
    const key = `${transactionId}-${documentType}`;
    
    if (documents[key]) {
      const document = documents[key].find(doc => doc.id === documentId);
      if (document) {
        return { ...document };
      }
    }
    
    throw new Error("Document not found");
  },

  async getStats() {
    await delay(200);
    const stats = {
      totalDocuments: 0,
      byType: {
        purchase_sale_contracts: 0,
        appraisals: 0,
        inspections: 0,
        settlement_statements: 0,
        miscellaneous: 0
      },
      byTransaction: {}
    };

    Object.keys(documents).forEach(key => {
      const [transactionId, documentType] = key.split('-');
      const count = documents[key].length;
      
      stats.totalDocuments += count;
      stats.byType[documentType] = (stats.byType[documentType] || 0) + count;
      stats.byTransaction[transactionId] = (stats.byTransaction[transactionId] || 0) + count;
    });

    return stats;
  }
};