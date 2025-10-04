import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { expenseAPI, serviceAPI } from '../api';
import { useAuth } from '../contexts/AuthContext';

const SubmitExpense: React.FC = () => {
  const { company } = useAuth();
  
  const getDefaultCurrency = () => {
    if (!company) return 'USD';
    return company.currency || 'USD';
  };
  
  const [formData, setFormData] = useState({
    originalAmount: '',
    originalCurrency: getDefaultCurrency(),
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  
  useEffect(() => {
    if (company) {
      setFormData(prev => ({
        ...prev,
        originalCurrency: company.currency || 'USD'
      }));
    }
  }, [company]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Auto-convert currency when amount or currency changes
    if ((name === 'originalAmount' || name === 'originalCurrency') && formData.originalAmount && company) {
      convertCurrency(
        name === 'originalAmount' ? parseFloat(value) : parseFloat(formData.originalAmount),
        name === 'originalCurrency' ? value : formData.originalCurrency
      );
    }
  };

  const convertCurrency = async (amount: number, fromCurrency: string) => {
    if (!company || fromCurrency === company.currency) {
      setConvertedAmount(amount);
      return;
    }
    
    try {
      const response = await serviceAPI.convertCurrency(fromCurrency, company.currency, amount);
      setConvertedAmount(response.data.convertedAmount);
    } catch (error) {
      console.error('Currency conversion failed:', error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Process OCR
      setOcrLoading(true);
      try {
        const response = await serviceAPI.uploadOCR(selectedFile);
        const ocrData = response.data;
        
        setFormData({
          ...formData,
          originalAmount: ocrData.amount.toString(),
          description: ocrData.description,
          date: ocrData.date,
          category: ocrData.category || formData.category
        });
        
        // Convert currency for OCR amount
        if (company) {
          convertCurrency(ocrData.amount, formData.originalCurrency);
        }
      } catch (error) {
        console.error('OCR processing failed:', error);
      } finally {
        setOcrLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });
      if (file) {
        submitData.append('receipt', file);
      }

      await expenseAPI.submitExpense(submitData);
      
      setSuccess(true);
      setFormData({
        originalAmount: '',
        originalCurrency: company?.currency || 'USD',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setFile(null);
      setConvertedAmount(null);
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting expense:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Submit Expense</h1>
          <p className="text-gray-600 text-lg">Create a new expense claim with receipt upload</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">New Expense Claim</h2>
          </div>
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
              ✅ Expense submitted successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt Upload
              </label>
              <div className="border-2 border-dashed border-blue-300 rounded-2xl p-8 text-center hover:border-blue-500 transition-all duration-200 bg-blue-50/50">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="hidden"
                  id="receipt-upload"
                />
                <label htmlFor="receipt-upload" className="cursor-pointer">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    {ocrLoading ? 'Processing Receipt...' : file ? file.name : 'Upload Receipt'}
                  </p>
                  <p className="text-sm text-blue-600 font-medium">
                    {ocrLoading ? 'Extracting data automatically' : 'Drag & drop or click to browse'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Supports JPG, PNG, PDF files
                  </p>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  name="originalAmount"
                  type="number"
                  step="0.01"
                  required
                  value={formData.originalAmount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {convertedAmount && company && formData.originalCurrency !== company.currency && (
                  <p className="text-xs text-gray-500 mt-1">
                    ≈ {company.currency} {convertedAmount.toFixed(2)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  name="originalCurrency"
                  value={formData.originalCurrency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select category</option>
                <option value="Travel">Travel</option>
                <option value="Meals">Meals</option>
                <option value="Equipment">Equipment</option>
                <option value="Software">Software</option>
                <option value="Training">Training</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                name="date"
                type="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Enter expense details..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading || ocrLoading}
              className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Expense'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SubmitExpense;