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
          <div className="text-lg">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
        
        {pendingExpenses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-gray-400 text-4xl mb-4">✅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h3>
            <p className="text-gray-600">All expenses have been reviewed.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingExpenses.map((expense: any) => (
              <div key={expense._id} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {expense.category}
                      </h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {expense.originalCurrency} {expense.originalAmount}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      Submitted by {expense.employeeId?.name} on {new Date(expense.date).toLocaleDateString()}
                    </div>
                    
                    <div className="text-gray-700 mb-4">
                      {expense.description}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button
                    onClick={() => handleApproval(expense._id, 'Approved')}
                    disabled={processingId === expense._id}
                    className="flex-1 bg-primary text-white py-3 px-6 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">✅</span>
                    {processingId === expense._id ? 'Processing...' : 'Approve'}
                  </button>
                  
                  <button
                    onClick={() => handleApproval(expense._id, 'Rejected', 'Rejected by manager')}
                    disabled={processingId === expense._id}
                    className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <span className="mr-2">❌</span>
                    {processingId === expense._id ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Approvals;