const express = require('express');
const router = express.Router();
const Visualization = require('./visualizer.model');
const { authenticate } = require('../../core/middlewares/auth.middleware');
const { successResponse } = require('../../core/utils');

router.use(authenticate);

// Save a visualization session
router.post('/', async (req, res, next) => {
  try {
    const data = { ...req.body, user: req.user.id };
    const visualization = await Visualization.create(data);
    successResponse(res, { visualization }, 'Visualization saved', 201);
  } catch (error) {
    next(error);
  }
});

// Get user's saved visualizations
router.get('/my-saves', async (req, res, next) => {
  try {
    const visualizations = await Visualization.find({ user: req.user.id })
      .populate('selectedTile', 'name price images sizes finishes')
      .populate('roomTemplate', 'name type')
      .sort({ createdAt: -1 });
    
    successResponse(res, { visualizations });
  } catch (error) {
    next(error);
  }
});

// Delete a saved visualization
router.delete('/:id', async (req, res, next) => {
  try {
    const visualization = await Visualization.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    
    if (!visualization) {
      return res.status(404).json({ success: false, message: 'Visualization not found' });
    }
    
    successResponse(res, null, 'Saved visualization deleted');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
