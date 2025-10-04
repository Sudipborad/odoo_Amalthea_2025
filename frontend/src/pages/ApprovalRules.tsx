import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { approvalAPI } from '../api';

const ApprovalRules: React.FC = () => {
  const [rules, setRules] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sequence: [{ step: 1, approverRole: 'Manager' }],
    percentageRule: 60,
    specificApproverId: '',
    hybrid: false,
    amountThreshold: 0
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await approvalAPI.getApprovalRules();
      setRules(response.data);
    } catch (error) {
      console.error('Error fetching rules:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await approvalAPI.createApprovalRule(formData);
      setShowForm(false);
      fetchRules();
    } catch (error) {
      console.error('Error creating rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId: string, ruleName: string) => {
    if (window.confirm(`Are you sure you want to delete the rule "${ruleName}"?`)) {
      try {
        await approvalAPI.deleteApprovalRule(ruleId);
        fetchRules();
      } catch (error) {
        console.error('Error deleting rule:', error);
      }
    }
  };

  const addSequenceStep = () => {
    setFormData({
      ...formData,
      sequence: [...formData.sequence, { step: formData.sequence.length + 1, approverRole: 'Manager' }]
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Approval Rules</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Create Rule
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Create Approval Rule</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rule Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter rule name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Sequence
                </label>
                {formData.sequence.map((step, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <span className="px-3 py-2 bg-gray-100 rounded">Step {step.step}</span>
                    <select
                      value={step.approverRole}
                      onChange={(e) => {
                        const newSequence = [...formData.sequence];
                        newSequence[index].approverRole = e.target.value;
                        setFormData({ ...formData, sequence: newSequence });
                      }}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Manager">Manager</option>
                      <option value="Finance">Finance</option>
                      <option value="Director">Director</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSequenceStep}
                  className="text-primary hover:text-blue-600 text-sm"
                >
                  + Add Step
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Percentage Rule (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.percentageRule}
                    onChange={(e) => setFormData({ ...formData, percentageRule: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount Threshold ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.amountThreshold}
                    onChange={(e) => setFormData({ ...formData, amountThreshold: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0 for all amounts"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.hybrid}
                  onChange={(e) => setFormData({ ...formData, hybrid: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Enable Hybrid Rules</label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Create Rule
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Current Rules</h2>
          </div>
          <div className="p-6">
            {rules.length === 0 ? (
              <p className="text-gray-500">No approval rules configured</p>
            ) : (
              rules.map((rule: any) => (
                <div key={rule._id} className="border rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                    <button
                      onClick={() => handleDeleteRule(rule._id, rule.name)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <h4 className="font-medium">Sequence</h4>
                      {rule.sequence.map((step: any, index: number) => (
                        <p key={index} className="text-sm text-gray-600">
                          Step {step.step}: {step.approverRole}
                        </p>
                      ))}
                    </div>
                    <div>
                      <h4 className="font-medium">Percentage Rule</h4>
                      <p className="text-sm text-gray-600">{rule.percentageRule}%</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Amount Threshold</h4>
                      <p className="text-sm text-gray-600">{rule.amountThreshold || 0}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Hybrid</h4>
                      <p className="text-sm text-gray-600">{rule.hybrid ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ApprovalRules;