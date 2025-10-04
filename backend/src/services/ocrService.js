class OCRService {
  static async processReceipt(file) {
    // Stub OCR implementation - returns mock data
    return {
      amount: Math.floor(Math.random() * 1000) + 10,
      date: new Date().toISOString().split('T')[0],
      vendor: 'Sample Vendor',
      description: 'Business expense from receipt'
    };
  }
}

module.exports = OCRService;