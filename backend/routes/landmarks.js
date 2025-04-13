// routes/landmarks.js
const express = require('express');
const router = express.Router();
const Landmark = require('../models/Landmark'); // تأكد أنك تجيب الموديل

// POST /api/landmarks
router.post('/', async (req, res) => {
  const { name, lat, lon } = req.body;

  if (!name || !lat || !lon) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newLandmark = new Landmark({ name, lat, lon });
    await newLandmark.save();
    res.status(201).json(newLandmark);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add landmark' });
  }
});

// GET /api/landmarks
router.get('/', async (req, res) => {
  try {
    const landmarks = await Landmark.find();
    res.json(landmarks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch landmarks' });
  }
});

module.exports = router;
