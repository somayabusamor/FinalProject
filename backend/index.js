require('dotenv').config(); // Adjust the path as needed
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { User } = require('./models/User');
const bcrypt = require('bcryptjs');

const Update = require('./models/Update');
const updateRoute = require('./routes/Update'); // Import the update route
const usersRoutes = require('./routes/users');
const app = express();
// Start the server

// Middlewareapp.use(cors({ origin: true, credentials: true }));

app.use(cors({ origin: true, credentials: true }));
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
// Remove the duplicate POST /api/signup route
app.post("/api/signup", async (req, res) => {
    try {
      const { name, email, password, confirmPassword, role } = req.body;
  
      // Validate input
      if (!name || !email || !password || !confirmPassword || !role) {
        return res.status(400).json({ message: "All fields are required" });
      }
      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
  
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create new user
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role,
      });
  
      await newUser.save();
  
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
// New route to test adding a user
app.get('/api/test-user', async (req, res) => {
    try {
        await addTestUser();
        res.status(200).send('Test user added successfully!');
    } catch (error) {
        res.status(500).send('Error adding test user.');
    }
});
mongoose.connect(process.env.DB)
    .then(() => {console.log('MongoDB connected successfully');})
    .catch((err) => console.error('MongoDB connection error:', err));
    const PORT = process.env.PORT ||8082; // 0 means any available port

    app.listen(8082, () => {
        console.log('Server running on http://localhost:8082');
    });
    