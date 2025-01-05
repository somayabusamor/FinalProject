require('dotenv').config(); // Adjust the path as needed
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { User } = require('./models/User');
const { Update } = require('./models/Update'); // Correct import
const bcrypt = require('bcryptjs');
const fs = require('fs');

const updateRoute = require('./routes/Update'); // Import the update route
const usersRoutes = require('./routes/users');

const app = express();

const uploadPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define the storage configuration for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
        cb(null, `images-${uniqueSuffix}`);
    },
});

const upload = multer({ storage }); // Ensure this is defined only once

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

// Submit update route
app.post('/api/submitUpdate', upload.array('images', 10), async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Uploaded files:', req.files);

        const { firstName, lastName, villageName, updateType, description } = req.body;
        const imagePaths = req.files.map(file => file.path);

        const newUpdate = new Update({
            firstName,
            lastName,
            villageName,
            updateType,
            description,
            images: imagePaths,
          });
          await newUpdate.save();
          
        res.status(201).json({ message: 'Update submitted successfully!', update: newUpdate });
    } catch (error) {
        console.error('Error while handling request:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
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
    .then(() => { console.log('MongoDB connected successfully'); })
    .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 8082;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
