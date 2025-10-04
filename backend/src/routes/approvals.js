const express = require('express');
const { 
  processApproval, 
  getPendingApprovals, 
  createApprovalRule, 
  getApprovalRules,
  overrideApproval 
} = require('../controllers/approvalController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/:expenseId', auth, authorize('Manager', 'Admin'), processApproval);
router.get('/pending', auth, authorize('Manager', 'Admin'), getPendingApprovals);
router.post('/rules', auth, authorize('Admin'), createApprovalRule);
router.get('/rules', auth, authorize('Admin'), getApprovalRules);
router.put('/:expenseId/override', auth, authorize('Admin'), overrideApproval);

module.exports = router;