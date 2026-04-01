const Task = require('../models/Task');

// Escape special regex characters to prevent ReDoS from user-supplied search terms
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Parse and validate a date string; returns a Date or null if invalid
const parseDate = (str) => {
  // Only accept YYYY-MM-DD or ISO 8601 date strings to limit the attack surface
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}(T[\d:.Z+-]+)?$/.test(str)) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

// GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const { date, startDate, endDate, completed, priority, category, search } = req.query;
    const filter = { user: req.user._id };

    if (date) {
      const parsed = parseDate(date);
      if (!parsed) return res.status(400).json({ success: false, message: 'Invalid date' });
      // Match tasks for a single calendar day using validated Date objects
      const start = new Date(parsed);
      start.setHours(0, 0, 0, 0);
      const end = new Date(parsed);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    } else if (startDate || endDate) {
      const dateRange = {};
      if (startDate) {
        const parsed = parseDate(startDate);
        if (!parsed) return res.status(400).json({ success: false, message: 'Invalid startDate' });
        parsed.setHours(0, 0, 0, 0);
        dateRange.$gte = parsed;
      }
      if (endDate) {
        const parsed = parseDate(endDate);
        if (!parsed) return res.status(400).json({ success: false, message: 'Invalid endDate' });
        parsed.setHours(23, 59, 59, 999);
        dateRange.$lte = parsed;
      }
      filter.date = dateRange;
    }

    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }
    // Whitelist priority against the schema enum to prevent operator injection
    const PRIORITY_ENUM = ['high', 'medium', 'low'];
    if (priority && PRIORITY_ENUM.includes(priority)) filter.priority = priority;
    // Cast category to string to block object/operator injection
    if (category) filter.category = String(category);
    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(filter).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, tasks, count: tasks.length });
  } catch (error) {
    console.error('GetTasks error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/tasks/:id
const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, task });
  } catch (error) {
    console.error('GetTask error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/tasks
const createTask = async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, task });
  } catch (error) {
    console.error('CreateTask error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Track completion timestamp when marking done for the first time
    if (req.body.completed === true && !task.completed) {
      req.body.completedAt = Date.now();
    }

    Object.assign(task, req.body);
    await task.save();

    res.json({ success: true, task });
  } catch (error) {
    console.error('UpdateTask error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    console.error('DeleteTask error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/tasks/reorder/bulk
const reorderTasks = async (req, res) => {
  try {
    const { tasks } = req.body; // [{ id, order }]
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ success: false, message: 'tasks array is required' });
    }

    await Promise.all(
      tasks.map(({ id, order }) =>
        Task.findOneAndUpdate({ _id: id, user: req.user._id }, { order })
      )
    );

    res.json({ success: true });
  } catch (error) {
    console.error('ReorderTasks error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/tasks/bulk/update
const bulkUpdateTasks = async (req, res) => {
  try {
    const { taskIds, updates } = req.body;
    if (!Array.isArray(taskIds) || !updates) {
      return res.status(400).json({ success: false, message: 'taskIds and updates are required' });
    }

    // Only allow safe bulk-update fields
    const allowed = {};
    if (updates.completed !== undefined) {
      allowed.completed = updates.completed;
      if (updates.completed) allowed.completedAt = Date.now();
    }
    if (updates.priority !== undefined) allowed.priority = updates.priority;
    if (updates.category !== undefined) allowed.category = updates.category;

    await Task.updateMany(
      { _id: { $in: taskIds }, user: req.user._id },
      { $set: allowed }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('BulkUpdateTasks error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getTasks, getTask, createTask, updateTask, deleteTask, reorderTasks, bulkUpdateTasks };
