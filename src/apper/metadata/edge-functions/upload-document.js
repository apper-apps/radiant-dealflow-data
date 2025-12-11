import apper from "https://cdn.apper.io/actions/apper-actions.js";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/jpg', 
  'image/png'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];

function validateFile(file, filename) {
  // Size validation
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size exceeds 50MB limit' };
  }

  // Extension validation
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return { valid: false, error: 'File type not allowed. Accepted: PDF, DOC, DOCX, JPG, PNG' };
  }

  // MIME type validation
  if (file.type && !ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }

  return { valid: true };
}

function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

export default apper.serve(async (request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Method not allowed' 
    }), { 
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Content-Type must be multipart/form-data' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const transactionId = formData.get('transactionId');
    const documentType = formData.get('documentType');

    // Validate required fields
    if (!file) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No file provided' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!transactionId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Transaction ID is required' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!documentType) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Document type is required' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate transaction ID format
    const transactionIdNum = parseInt(transactionId);
    if (isNaN(transactionIdNum) || transactionIdNum <= 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid transaction ID' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate document type
    const validDocTypes = [
      'purchase_sale_contracts', 
      'appraisals', 
      'inspections', 
      'settlement_statements', 
      'miscellaneous'
    ];
    
    if (!validDocTypes.includes(documentType)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid document type' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate file
    const validation = validateFile(file, file.name);
    if (!validation.valid) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: validation.error 
      }), { 
        status: 422,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Generate safe filename
    const timestamp = Date.now();
    const sanitizedName = sanitizeFilename(file.name);
    const finalFilename = `${transactionId}_${documentType}_${timestamp}_${sanitizedName}`;

    // In a real implementation, this would upload to cloud storage
    // For demo purposes, we simulate successful upload
    const fileInfo = {
      filename: finalFilename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      transactionId: transactionIdNum,
      documentType: documentType,
      uploadDate: new Date().toISOString(),
      url: `/uploads/${finalFilename}` // Simulated file URL
    };

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Document uploaded successfully',
      document: fileInfo
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Upload failed due to server error' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});