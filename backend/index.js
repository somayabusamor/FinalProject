require('dotenv').config(); // Adjust the path as needed
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { User } = require('./models/User');

const Update = require('./models/Update');
const updateRoute = require('./routes/Update'); // Import the update route
const usersRoutes = require('./routes/users');
const app = express();
// Start the server

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
app.use("/api", usersRoutes);

// POST endpoint to handle the update submission
// Use the update route
app.use('/api/update', updateRoute);
console.log('MongoDB URI:', process.env.DB);
const addTestUser = async () => {
    try {
        const existingUser = await User.findOne({ email: 'test@example.com' });
        if (!existingUser) {
            const testUser = new User({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123', // In production, hash the password
                role: 'local', // Provide a role
            });
            const savedUser = await testUser.save();
            console.log('Test user created successfully:', savedUser);
        } else {
            console.log('Test user already exists:', existingUser);
        }
    } catch (error) {
        console.error('Error creating test user:', error);
    }
};
// New route to test adding a user
app.get('/api/test-user', async (req, res) => {
    try {
        await addTestUser();
        res.status(200).send('Test user added successfully!');
    } catch (error) {
        res.status(500).send('Error adding test user.');
    }
});
mongoose
    .connect(process.env.DB)
    mongoose
    .connect(process.env.DB)
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((err) => console.error('MongoDB connection error:', err));
    const PORT = process.env.PORT ||8082; // 0 means any available port

    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
