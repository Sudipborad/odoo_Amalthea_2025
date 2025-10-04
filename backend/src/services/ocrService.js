class OCRService {
  static async processReceipt(file) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      amount: 395,
      date: '2024-09-25',
      vendor: 'Uber',
      description: 'Uber ride from Lokmanya Tilak Terminus to Mumbai Central Railway Station',
      category: 'Travel'
    };
  }

}

module.exports = OCRService;