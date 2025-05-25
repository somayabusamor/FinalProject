const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  vote: { type: String, enum: ['yes', 'no'], required: true },
  weight: { type: Number, default: 1 } // Added weight field
}, { _id: false });

const landmarkSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lat: { type: Number, required: true },
  lon: { type: Number, required: true },
  color: { type: String, default: '#8B4513' },
  imageUrl: { type: String, default: '' },
  verified: { type: Boolean, default: false },
  votes: [voteSchema],
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Landmark', landmarkSchema);