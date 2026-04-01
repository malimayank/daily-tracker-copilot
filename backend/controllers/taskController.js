const Task = require('../models/Task');

// GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const { date, startDate, endDate, completed, priority, category, search } = req.query;
    const filter = { user: req.user._id };

    if (date) {
      // Match tasks for a single calendar day
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    } else if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
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
