import apper from "https://cdn.apper.io/actions/apper-actions.js";

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
    const body = await request.text();
    let requestData;
    
    try {
      requestData = JSON.parse(body);
    } catch (parseError) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid JSON in request body' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { transactionId, documentType, filename } = requestData;

    // Validate required fields
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

    if (!filename) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Filename is required' 
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

    // Validate filename for security
    if (filename.includes('../') || filename.includes('..\\')) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid filename' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // In a real implementation, this would:
    // 1. Verify the file exists in cloud storage
    // 2. Check user permissions
    // 3. Generate a signed download URL
    // 4. Return the secure URL
    
    // For demo purposes, simulate file retrieval
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Simulate generating a download URL
    const downloadUrl = `https://example-storage.com/documents/${filename}?token=demo_${Date.now()}`;

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Download URL generated successfully',
      fileUrl: downloadUrl,
      filename: filename,
      expiresIn: 3600 // URL expires in 1 hour
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Download error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Download failed due to server error' 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});