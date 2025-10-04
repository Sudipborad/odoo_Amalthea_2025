const express = require('express');
const { 
  processApproval, 
  getPendingApprovals, 
  createApprovalRule, 
  getApprovalRules,
  deleteApprovalRule,
  overrideApproval 
} = require('../controllers/approvalController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/rules', auth, authorize('Admin'), createApprovalRule);
router.get('/rules', auth, authorize('Admin'), getApprovalRules);
router.delete('/rules/:ruleId', auth, authorize('Admin'), deleteApprovalRule);
router.get('/pending', auth, authorize('Manager', 'Finance', 'Director', 'CFO', 'Admin'), getPendingApprovals);
router.post('/:expenseId', auth, authorize('Manager', 'Finance', 'Director', 'CFO', 'Admin'), processApproval);
router.put('/:expenseId/override', auth, authorize('Admin'), overrideApproval);

module.exports = router;