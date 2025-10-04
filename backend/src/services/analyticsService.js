const Expense = require('../models/Expense');

class AnalyticsService {
  static async getExpenseAnalytics(companyId, userId, userRole) {
    try {
      let query = { companyId };
      
      // Filter by user role
      if (userRole === 'Manager') {
        const User = require('../models/User');
        const teamMembers = await User.find({ 
          managerId: userId,
          companyId 
        });
        const teamMemberIds = teamMembers.map(member => member._id);
        query.employeeId = { $in: teamMemberIds };
      } else if (userRole === 'Employee') {
        query.employeeId = userId;
      }

      const expenses = await Expense.find(query).populate('employeeId', 'name');
      
      // Category breakdown
      const categoryStats = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.convertedAmount;
        return acc;
      }, {});

      // Status breakdown
      const statusStats = expenses.reduce((acc, expense) => {
        acc[expense.status] = (acc[expense.status] || 0) + 1;
        return acc;
      }, { Pending: 0, Approved: 0, Rejected: 0 });

      // Monthly trends (last 6 months)
      const monthlyStats = this.getMonthlyTrends(expenses);

      return {
        totalExpenses: expenses.length,
        totalAmount: expenses.reduce((sum, e) => sum + e.convertedAmount, 0),
        categoryBreakdown: categoryStats,
        statusBreakdown: statusStats,
        monthlyTrends: monthlyStats
      };
    } catch (error) {
      throw new Error('Failed to generate analytics');
    }
  }

  static getMonthlyTrends(expenses) {
    const months = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toISOString().slice(0, 7); // YYYY-MM
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      months[monthName] = { approved: 0, rejected: 0, pending: 0, total: 0 };
    }

    expenses.forEach(expense => {
      const expenseDate = new Date(expense.createdAt);
      const monthName = expenseDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (months[monthName]) {
        const status = expense.status.toLowerCase();
        months[monthName][status] = (months[monthName][status] || 0) + 1;
        months[monthName].total += expense.convertedAmount;
      }
    });

    return months;
  }
}

module.exports = AnalyticsService;