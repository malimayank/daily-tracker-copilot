const express = require('express');
const router = express.Router();
const { getDailyStats, getWeeklyStats, getProductivityInsights } = require('../controllers/statsController');
const auth = require('../middleware/auth');

// All stats routes require authentication
router.use(auth);

router.get('/daily', getDailyStats);
router.get('/weekly', getWeeklyStats);
router.get('/insights', getProductivityInsights);

module.exports = router;
