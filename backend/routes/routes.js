const express = require('express');
const router = express.Router();
const Route = require('../models/Route');
const { User } = require('../models/User');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// GET all routes
router.get('/', async (req, res) => {
  try {
    const routes = await Route.find().sort({ createdAt: -1 });
    res.status(200).json(routes);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching routes', 
      error: error.message 
    });
  }
});

// POST create new route
router.post('/', auth, async (req, res) => {
  try {
    const { title, points, color } = req.body;
    
    if (!title || !points || points.length < 2) {
      return res.status(400).json({ 
        success: false,
        message: 'Title and at least 2 points are required' 
      });
    }
    const route = new Route({
      title,
      points,
      color: color || '#3A86FF',
      createdBy: req.user._id,
      verified: false,
      votes: []
    });
    
    await route.save();
    res.status(201).json({
      success: true,
      data: route
    });
  } catch (error) {
    console.error('Route creation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
});
// PUT vote on route
  router.put('/:id/vote', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { vote } = req.body;
    
    if (!['yes', 'no'].includes(vote)) {
      await session.abortTransaction();
      return res.status(400).json({ 
        success: false,
        message: 'Invalid vote type' 
      });
    }

    // Get user with proper fields
    const user = await User.findById(req.user._id)
      .select('isSuperlocal verifiedRoutesAdded reputationScore')
      .session(session);
    
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Use the getVoteWeight method
    const weight = user.getVoteWeight();

    // Get and lock route
    const route = await Route.findById(req.params.id).session(session);
    if (!route) {
      await session.abortTransaction();
      return res.status(404).json({ 
        success: false,
        message: 'Route not found' 
      });
    }

    // Update or add vote
    const voteIndex = route.votes.findIndex(v => 
      v.userId.toString() === user._id.toString()
    );
    
    const voteData = {
      userId: user._id,
      vote,
      weight,
      timestamp: new Date()
    };

    if (voteIndex >= 0) {
      route.votes[voteIndex] = voteData;
    } else {
      route.votes.push(voteData);
    }

    // Save and update verification status
    await route.save({ session });
    const updatedRoute = await route.updateVerificationStatus();
    
    await session.commitTransaction();

    res.status(200).json({
      success: true,
      data: updatedRoute,
      message: voteIndex >= 0 ? 'Vote updated successfully' : 'Vote recorded successfully',
      userWeight: weight
    });

  } catch (error) {
    await session.abortTransaction();
    console.error("Voting error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    session.endSession();
  }
});

// DELETE a route
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid route ID format'
      });
    }

    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ 
        success: false,
        message: 'Route not found' 
      });
    }

    // Authorization check (creator or admin)
    if (!route.createdBy.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized: You can only delete your own routes unless you are an admin'
      });
    }

    await Route.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ 
      success: true,
      message: 'Route deleted successfully' 
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting route',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;