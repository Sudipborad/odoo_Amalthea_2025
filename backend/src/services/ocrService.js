class OCRService {
  static async processReceipt(file) {
    // Enhanced OCR implementation with better mock data based on filename/type
    const filename = file.originalname?.toLowerCase() || '';
    
    // Generate more realistic data based on common receipt patterns
    let amount, description, vendor;
    
    if (filename.includes('restaurant') || filename.includes('food') || filename.includes('meal')) {
      amount = Math.floor(Math.random() * 80) + 15; // $15-95
      description = 'Business meal expense';
      vendor = 'Restaurant';
    } else if (filename.includes('hotel') || filename.includes('accommodation')) {
      amount = Math.floor(Math.random() * 300) + 100; // $100-400
      description = 'Hotel accommodation';
      vendor = 'Hotel';
    } else if (filename.includes('taxi') || filename.includes('uber') || filename.includes('transport')) {
      amount = Math.floor(Math.random() * 50) + 10; // $10-60
      description = 'Transportation expense';
      vendor = 'Transportation Service';
    } else if (filename.includes('office') || filename.includes('supplies')) {
      amount = Math.floor(Math.random() * 150) + 25; // $25-175
      description = 'Office supplies';
      vendor = 'Office Supply Store';
    } else {
      // Default business expense
      amount = Math.floor(Math.random() * 200) + 20; // $20-220
      description = 'Business expense';
      vendor = 'Business Vendor';
    }
    
    // Generate a recent date (within last 30 days)
    const today = new Date();
    const daysAgo = Math.floor(Math.random() * 30);
    const receiptDate = new Date(today.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    
    return {
      amount: parseFloat(amount.toFixed(2)),
      date: receiptDate.toISOString().split('T')[0],
      vendor,
      description
    };
  }
}

module.exports = OCRService;