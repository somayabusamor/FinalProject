const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); // This is the crucial addition
const Landmark = require('../models/Landmark');

// Get all landmarks
router.get('/', async (req, res) => {
  try {
    const landmarks = await Landmark.find();
    res.json(landmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new landmark
router.post('/', async (req, res) => {
  try {
    const landmark = new Landmark({
      ...req.body,
      verified: false,
      votes: []
    });
    await landmark.save();
    res.status(201).json(landmark);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Vote on a landmark - Updated with better error handling
router.put('/:id/vote', async (req, res) => {
  try {
    console.log('Vote request received:', req.body); // Debug log
    
    const { id } = req.params;
    const { userId, vote } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid landmark ID' 
      });
    }

    const landmark = await Landmark.findById(id);
    if (!landmark) {
      return res.status(404).json({ 
        success: false, 
        message: 'Landmark not found' 
      });
    }

    // Remove existing vote from this user
    landmark.votes = landmark.votes.filter(v => v.userId !== userId);
    
    // Add new vote
    landmark.votes.push({ userId, vote });

    // Update verification status
    const yesVotes = landmark.votes.filter(v => v.vote === 'yes').length;
    landmark.verified = yesVotes >= 5;

    await landmark.save();

    res.json({
      success: true,
      data: {
        id: landmark._id,
        verified: landmark.verified,
        votes: landmark.votes
      }
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal server error during voting' 
    });
  }
});
// DELETE a landmark by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Landmark.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Landmark not found' });
    }
    res.json({ success: true, message: 'Landmark deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;