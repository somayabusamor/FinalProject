const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  villageName: { type: String, required: true },
  updateType: { type: String, required: true },
  description: { type: String, required: true },
  images: { type: [String], required: true }, // Store image paths as an array of strings
});

const Update = mongoose.model('Update', updateSchema);

module.exports = { Update };
