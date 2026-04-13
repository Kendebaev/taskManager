const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');

// GET all habits
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find().sort({ lastUpdated: -1 });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new habit
router.post('/', async (req, res) => {
  const habit = new Habit({
    name: req.body.name,
  });

  try {
    const newHabit = await habit.save();
    res.status(201).json(newHabit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH toggle habit status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (habit == null) {
      return res.status(404).json({ message: 'Cannot find habit' });
    }

    habit.status = !habit.status;
    habit.lastUpdated = Date.now();
    const updatedHabit = await habit.save();
    res.json(updatedHabit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE a habit
router.delete('/:id', async (req, res) => {
  try {
    const habit = await Habit.findByIdAndDelete(req.params.id);
    if (!habit) {
      return res.status(404).json({ message: 'Cannot find habit' });
    }
    res.json({ message: 'Deleted Habit' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
