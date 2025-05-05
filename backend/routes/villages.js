const express = require('express');
const router = express.Router();
const Village = require('../models/Village');

// GET all villages
router.get('/', async (req, res) => {
  try {
    const villages = await Village.find();
    res.status(200).json(villages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching villages', error: error.message });
  }
});

// GET single village by ID
router.get('/:id', async (req, res) => {
  try {
    const village = await Village.findById(req.params.id);
    if (!village) {
      return res.status(404).json({ message: 'Village not found' });
    }
    res.status(200).json(village);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching village', error: error.message });
  }
});

// POST create new village
router.post('/', async (req, res) => {
  try {
    const { name, description, images } = req.body;
    
    const newVillage = new Village({
      name,
      description,
      images: images || ['https://via.placeholder.com/300x200?text=No+Image'],
      location: {
        type: 'Point',
        coordinates: [0, 0] // Default coordinates
      }
    });

    const savedVillage = await newVillage.save();
    res.status(201).json(savedVillage);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating village',
      error: error.message 
    });
  }
});

// PUT update village
router.put('/:id', async (req, res) => {
  try {
    const updatedVillage = await Village.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!updatedVillage) {
      return res.status(404).json({ message: 'Village not found' });
    }
    
    res.status(200).json(updatedVillage);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating village',
      error: error.message 
    });
  }
});

// DELETE village
router.delete('/:id', async (req, res) => {
  try {
    const deletedVillage = await Village.findByIdAndDelete(req.params.id);
    
    if (!deletedVillage) {
      return res.status(404).json({ message: 'Village not found' });
    }
    
    res.status(200).json({ message: 'Village deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error deleting village',
      error: error.message 
    });
  }
});

module.exports = router;