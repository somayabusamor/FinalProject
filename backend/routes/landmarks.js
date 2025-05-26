const express = require('express');
const router = express.Router();
const Landmark = require('../models/Landmark');
const User = require('../models/User');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// GET all landmarks
router.get('/', async (req, res) => {
  try {
    // Find only verified landmarks
    const verifiedLandmarks = await Landmark.find({ verified: true }).sort({ createdAt: -1 });
res.status(200).json(verifiedLandmarks);

  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching landmarks', 
      error: error.message 
    });
  }
});

// POST create new landmark
router.post('/', auth, async (req, res) => {
  try {
    const { title, lat, lon, color, imageUrl } = req.body;
    
    const landmark = new Landmark({
      title,
      lat,
      lon,
      color: color || '#8B4513',
      imageUrl: imageUrl || '',
      verified: false,
      votes: [],
      createdBy: req.user._id // Ensure this is included
    });

    const savedLandmark = await landmark.save();
    res.status(201).json(savedLandmark);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating landmark',
      error: error.message 
    });
  }
});

// PUT vote on landmark
router.put('/:id/vote', auth, async (req, res) => {
  try {
    const { vote } = req.body;
    const landmark = await Landmark.findById(req.params.id);
    
    if (!landmark) {
      return res.status(404).json({ 
        success: false,
        message: 'Landmark not found' 
      });
    }

    if (!['yes', 'no'].includes(vote)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid vote type' 
      });
    }

    const user = req.user;
    const existingVoteIndex = landmark.votes.findIndex(v => 
      v.userId.toString() === user._id.toString()
    );

    // If user already voted, update their vote
    if (existingVoteIndex !== -1) {
      landmark.votes[existingVoteIndex] = {
        userId: user._id,
        vote,
        weight: user.isSuper ? 2 : 1
      };
    } 
    // Otherwise add new vote
    else {
      landmark.votes.push({
        userId: user._id,
        vote,
        weight: user.isSuper ? 2 : 1
      });
    }

    // Recalculate verification status
    const { totalWeight, yesWeight } = landmark.votes.reduce((acc, v) => {
      const weight = v.weight || 1;
      return {
        totalWeight: acc.totalWeight + weight,
        yesWeight: v.vote === 'yes' ? acc.yesWeight + weight : acc.yesWeight
      };
    }, { totalWeight: 0, yesWeight: 0 });

    landmark.verified = totalWeight >= 5 && (yesWeight / totalWeight) >= 0.8;

    const updatedLandmark = await landmark.save();
    
    res.status(200).json({
      success: true,
      data: {
        ...updatedLandmark.toObject(),
        calculatedWeights: { totalWeight, yesWeight }
      },
      message: existingVoteIndex !== -1 
        ? 'Vote updated successfully' 
        : 'Vote recorded successfully'
    });

  } catch (error) {
    console.error("Voting error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE a landmark
router.delete('/:id', auth, async (req, res) => {
  try {
    const landmark = await Landmark.findById(req.params.id);
    
    // Check if landmark exists
    if (!landmark) {
      return res.status(404).json({ 
        success: false,
        message: 'Landmark not found' 
      });
    }

    // Check if user is creator or admin
    if (
      !landmark.createdBy.equals(req.user._id) && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized: You can only delete your own landmarks unless you are an admin'
      });
    }

    await Landmark.findByIdAndDelete(req.params.id);
    res.status(200).json({ 
      success: true,
      message: 'Landmark deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting landmark',
      error: error.message 
    });
  }
});

module.exports = router;