require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const Update = require('./models/Update');

const app = express();
const PORT = 8081;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  });
  const upload = multer({ storage });
  
// POST endpoint to handle the update submission
app.post('/api/submitUpdate', upload.array('images', 10), async (req, res) => {
    try {
      const { firstName, lastName, villageName, updateType, description } = req.body;
      const images = req.files.map((file) => `/uploads/${file.filename}`); // Store full path
  
      const newUpdate = new Update({
        firstName,
        lastName,
        villageName,
        updateType,
        description,
        images,
      });
  
      await newUpdate.save();
      res.status(200).json({ message: 'Update submitted successfully', newUpdate });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error saving update', error });
    }
  });
  
// Connect to MongoDB
mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false

  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

