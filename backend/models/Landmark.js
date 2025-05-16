const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  vote: { type: String, enum: ['yes', 'no'], required: true }
}, { _id: false });

const landmarkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  color: { type: String, default: '#8B4513' },
  imageUrl: { type: String, default: '' },
  verified: { type: Boolean, default: false },
  votes: [voteSchema]
}, { timestamps: true });

module.exports = mongoose.model('Landmark', landmarkSchema);