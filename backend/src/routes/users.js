const express = require('express');
const { createUser, updateUserRole, assignManager } = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, authorize('Admin'), createUser);
router.put('/:id/role', auth, authorize('Admin'), updateUserRole);
router.put('/:id/manager', auth, authorize('Admin'), assignManager);

module.exports = router;