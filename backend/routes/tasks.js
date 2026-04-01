const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  reorderTasks,
  bulkUpdateTasks,
} = require('../controllers/taskController');
const auth = require('../middleware/auth');

// All task routes require authentication
router.use(auth);

// Specific bulk routes must be declared before /:id to avoid param capture
router.put('/reorder/bulk', reorderTasks);
router.put('/bulk/update', bulkUpdateTasks);

router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
