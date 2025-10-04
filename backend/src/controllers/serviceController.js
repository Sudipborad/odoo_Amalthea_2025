const CurrencyService = require('../services/currencyService');
const OCRService = require('../services/ocrService');

const convertCurrency = async (req, res) => {
  try {
    const { from, to, amount } = req.query;
    const convertedAmount = await CurrencyService.convertCurrency(from, to, parseFloat(amount));
    res.json({ convertedAmount, rate: convertedAmount / amount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const processOCR = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const ocrResult = await OCRService.processReceipt(req.file);
    res.json(ocrResult);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { convertCurrency, processOCR };