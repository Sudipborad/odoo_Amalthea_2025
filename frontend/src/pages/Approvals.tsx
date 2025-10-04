import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { approvalAPI } from '../api';

const Approvals: React.FC = () => {
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    try {
      const response = await approvalAPI.getPendingApprovals();
      setPendingExpenses(response.data);
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (expenseId: string, decision: 'Approved' | 'Rejected', comments?: string) => {
    setProcessingId(expenseId);
    try {
      await approvalAPI.processApproval(expenseId, decision, comments);
      await fetchPendingApprovals();
    } catch (error) {
      console.error('Error processing approval:', error);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <div className="text-lg font-medium text-gray-600">Loading approvals...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
          <div className="bg-primary text-white px-4 py-2 rounded-lg font-medium">
            {pendingExpenses.length} Pending
          </div>
        </div>
        
        {pendingExpenses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-green-500 text-4xl mb-4">✅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h3>
            <p className="text-gray-600">All expenses have been reviewed.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingExpenses.map((expense: any) => (
                  <tr key={expense._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{expense.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{expense.employeeId?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(expense.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {expense.originalCurrency} {expense.originalAmount}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={expense.description}>
                        {expense.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {(() => {
                        const user = JSON.parse(localStorage.getItem('user') || '{}');
                        const userApproval = expense.approvals?.find((a: any) => 
                          a.approverId === user.id && a.decision !== 'Pending'
                        );
                        
                        if (userApproval) {
                          return (
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              userApproval.decision === 'Approved' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {userApproval.decision} by you
                            </span>
                          );
                        }
                        
                        return (
                          <div className="flex space-x-2 justify-center">
                            <button
                              onClick={() => handleApproval(expense._id, 'Approved')}
                              disabled={processingId === expense._id}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                            >
                              {processingId === expense._id ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleApproval(expense._id, 'Rejected', 'Rejected by manager')}
                              disabled={processingId === expense._id}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                            >
                              {processingId === expense._id ? 'Processing...' : 'Reject'}
                            </button>
                          </div>
                        );
                      })()
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Approvals;