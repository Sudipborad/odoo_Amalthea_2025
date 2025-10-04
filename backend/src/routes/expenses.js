const express = require('express');
const multer = require('multer');
const { submitExpense, getMyExpenses, getAllExpenses, getTeamExpenses } = require('../controllers/expenseController');
const { auth, authorize } = require('../middleware/auth');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/', auth, upload.single('receipt'), submitExpense);
router.get('/me', auth, getMyExpenses);
router.get('/team', auth, authorize('Manager', 'Admin'), getTeamExpenses);
router.get('/', auth, authorize('Admin'), getAllExpenses);

module.exports = router;