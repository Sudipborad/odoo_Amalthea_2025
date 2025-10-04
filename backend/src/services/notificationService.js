class NotificationService {
  static async sendExpenseNotification(expense, type, recipient) {
    // In a real implementation, this would send emails/push notifications
    // For now, we'll just log the notification
    const notifications = {
      'expense_approved': {
        subject: 'Expense Approved',
        message: `Your expense for ${expense.category} (${expense.originalCurrency} ${expense.originalAmount}) has been approved.`
      },
      'expense_rejected': {
        subject: 'Expense Rejected', 
        message: `Your expense for ${expense.category} (${expense.originalCurrency} ${expense.originalAmount}) has been rejected.`
      },
      'expense_submitted': {
        subject: 'New Expense Submitted',
        message: `${expense.employeeId.name} has submitted a new expense for ${expense.category} (${expense.originalCurrency} ${expense.originalAmount}).`
      }
    };

    const notification = notifications[type];
    if (notification) {
      console.log(`📧 Notification to ${recipient.email}:`);
      console.log(`Subject: ${notification.subject}`);
      console.log(`Message: ${notification.message}`);
      
      // Here you would integrate with email service (SendGrid, AWS SES, etc.)
      // await emailService.send({
      //   to: recipient.email,
      //   subject: notification.subject,
      //   text: notification.message
      // });
    }
  }

  static async notifyExpenseStatusChange(expense, newStatus) {
    try {
      const User = require('../models/User');
      const employee = await User.findById(expense.employeeId);
      
      if (employee) {
        const type = newStatus === 'Approved' ? 'expense_approved' : 'expense_rejected';
        await this.sendExpenseNotification(expense, type, employee);
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }
}

module.exports = NotificationService;