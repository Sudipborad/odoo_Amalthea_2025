const express = require('express');
const AnalyticsService = require('../services/analyticsService');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/expenses', auth, async (req, res) => {
  try {
    const analytics = await AnalyticsService.getExpenseAnalytics(
      req.user.companyId._id,
      req.user._id,
      req.user.role
    );
    res.json(analytics);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;