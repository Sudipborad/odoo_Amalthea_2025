const { Parser } = require('json2csv');

class ExportService {
  static async exportExpensesToCSV(expenses) {
    try {
      const fields = [
        { label: 'Employee', value: 'employeeId.name' },
        { label: 'Category', value: 'category' },
        { label: 'Description', value: 'description' },
        { label: 'Amount', value: 'originalAmount' },
        { label: 'Currency', value: 'originalCurrency' },
        { label: 'Converted Amount', value: 'convertedAmount' },
        { label: 'Date', value: 'date' },
        { label: 'Status', value: 'status' },
        { label: 'Submitted Date', value: 'createdAt' }
      ];

      const parser = new Parser({ fields });
      const csv = parser.parse(expenses);
      return csv;
    } catch (error) {
      throw new Error('Failed to export expenses to CSV');
    }
  }

  static formatExpenseData(expenses) {
    return expenses.map(expense => ({
      ...expense.toObject(),
      date: new Date(expense.date).toLocaleDateString(),
      createdAt: new Date(expense.createdAt).toLocaleDateString(),
      convertedAmount: parseFloat(expense.convertedAmount).toFixed(2)
    }));
  }
}

module.exports = ExportService;