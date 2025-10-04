const express = require('express');
const { createUser, updateUserRole, assignManager, deleteUser, getAllUsers } = require('../controllers/userController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Test endpoint to check user role
router.get('/me', auth, (req, res) => {
  res.json({ 
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

router.get('/', auth, authorize('Admin'), getAllUsers);
router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});
router.post('/', auth, authorize('Admin'), createUser);
router.put('/:id/role', auth, authorize('Admin'), updateUserRole);
router.put('/:id/manager', auth, authorize('Admin'), assignManager);
router.delete('/:id', auth, authorize('Admin'), deleteUser);

module.exports = router;