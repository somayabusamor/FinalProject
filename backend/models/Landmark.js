// models/Landmark.js
const mongoose = require('mongoose');

const landmarkSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true }
});

module.exports = mongoose.model('Landmark', landmarkSchema);
