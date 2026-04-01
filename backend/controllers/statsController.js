const Task = require('../models/Task');

// Helper: build start/end of a day
const dayRange = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// GET /api/stats/daily?date=YYYY-MM-DD
const getDailyStats = async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const { start, end } = dayRange(date);

    const tasks = await Task.find({
      user: req.user._id,
      date: { $gte: start, $lte: end },
    });

    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({
      success: true,
      stats: {
        date: start.toISOString().split('T')[0],
        total,
        completed,
        pending,
        completionRate,
      },
    });
  } catch (error) {
    console.error('GetDailyStats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/stats/weekly?weekStart=YYYY-MM-DD
const getWeeklyStats = async (req, res) => {
  try {
    // Default to the most recent Monday
    let weekStart;
    if (req.query.weekStart) {
      weekStart = new Date(req.query.weekStart);
    } else {
      weekStart = new Date();
      const day = weekStart.getDay(); // 0 = Sun
      const diff = day === 0 ? -6 : 1 - day; // shift to Monday
      weekStart.setDate(weekStart.getDate() + diff);
    }
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const tasks = await Task.find({
      user: req.user._id,
      date: { $gte: weekStart, $lte: weekEnd },
    });

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const stats = Array.from({ length: 7 }, (_, i) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + i);
      const { start, end } = dayRange(dayDate);

      const dayTasks = tasks.filter((t) => t.date >= start && t.date <= end);
      const total = dayTasks.length;
      const completed = dayTasks.filter((t) => t.completed).length;

      return {
        date: dayDate.toISOString().split('T')[0],
        day: dayNames[i],
        total,
        completed,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });

    res.json({ success: true, stats });
  } catch (error) {
    console.error('GetWeeklyStats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/stats/insights
const getProductivityInsights = async (req, res) => {
  try {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setDate(start.getDate() - 29); // last 30 days inclusive
    start.setHours(0, 0, 0, 0);

    const tasks = await Task.find({
      user: req.user._id,
      date: { $gte: start, $lte: end },
    });

    // Build a map of date string -> { total, completed }
    const dayMap = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dayMap[d.toISOString().split('T')[0]] = { total: 0, completed: 0 };
    }

    tasks.forEach((t) => {
      const key = new Date(t.date).toISOString().split('T')[0];
      if (dayMap[key]) {
        dayMap[key].total += 1;
        if (t.completed) dayMap[key].completed += 1;
      }
    });

    const days = Object.entries(dayMap); // [['YYYY-MM-DD', { total, completed }]]

    // Average completion rate across days that had at least one task
    const activeDays = days.filter(([, d]) => d.total > 0);
    const averageCompletionRate =
      activeDays.length > 0
        ? Math.round(
            activeDays.reduce((sum, [, d]) => sum + (d.completed / d.total) * 100, 0) /
              activeDays.length
          )
        : 0;

    // Most productive day of the week (by average tasks completed)
    const weekdayTotals = Array(7).fill(0);
    const weekdayCounts = Array(7).fill(0);
    days.forEach(([dateStr, d]) => {
      const dow = new Date(dateStr).getDay(); // 0=Sun
      weekdayTotals[dow] += d.completed;
      weekdayCounts[dow] += 1;
    });
    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let bestDow = 0;
    let bestAvg = -1;
    weekdayTotals.forEach((total, i) => {
      const avg = weekdayCounts[i] > 0 ? total / weekdayCounts[i] : 0;
      if (avg > bestAvg) { bestAvg = avg; bestDow = i; }
    });
    const mostProductiveDay = weekdayNames[bestDow];

    const totalTasksCompleted = tasks.filter((t) => t.completed).length;

    // Current streak: consecutive days ending today where completionRate > 0
    const sortedDays = days.sort(([a], [b]) => (a < b ? 1 : -1)); // descending
    let currentStreak = 0;
    for (const [, d] of sortedDays) {
      if (d.total > 0 && d.completed > 0) {
        currentStreak += 1;
      } else if (d.total > 0) {
        break; // had tasks but completed none — streak broken
      }
      // days with no tasks don't break the streak
    }

    res.json({
      success: true,
      insights: {
        averageCompletionRate,
        mostProductiveDay,
        totalTasksCompleted,
        currentStreak,
      },
    });
  } catch (error) {
    console.error('GetProductivityInsights error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getDailyStats, getWeeklyStats, getProductivityInsights };
