require('dotenv').config(); // Adjust the path as needed
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { User } = require('./models/User');
const { Update } = require('./models/Update'); // Correct import
const Village = require('./models/Village');
const Landmark = require('./models/Landmark');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const landmarksRoute = require('./routes/landmarks');
const villageRoutes = require('./routes/villages.js') ;
const updateRoute = require('./routes/Update'); // Import the update route
const usersRoutes = require('./routes/users');
const router = express.Router();  // Add this line

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
app.use('/api', usersRoutes);
app.use('/api/landmarks', landmarksRoute);
// Correct (add village routes)
app.use('/api/villages', villageRoutes);
// Use village routes
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
// GET /api/users - Fetch all users
// Simple GET /api/users endpoint
// In your backend index.js
app.get('/api/users', async (req, res) => {
    try {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
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

app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      
      if (!user) return res.status(404).send({ message: "User not found" });
  
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).send({ message: "Invalid password" });
  
      // إرجاع بيانات المستخدم بما فيها role
      res.status(200).send({
        message: "Logged in successfully",
        role: user.role,
        userId: user._id
      });
    } catch (error) {
      res.status(500).send({ message: "Server error" });
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
// GET single village
router.get('/:id', async (req, res) => {
  try {
    const village = await Village.findById(req.params.id);
    if (!village) {
      return res.status(404).json({ error: 'Village not found' });
    }
    res.json(village);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all villages (already in your index.js, but better here)
// Update the villages GET endpoint to ensure proper image URLs
app.get('/api/villages', async (req, res) => {
  try {
    const villages = await Village.find();
    
    // Map through villages to ensure proper image URLs
    const villagesWithFullUrls = villages.map(village => ({
      ...village._doc,
      images: village.images.map(img => 
        img.startsWith('http') ? img : `${req.protocol}://${req.get('host')}/${img.replace(/^\//, '')}`
      )
    }));

    res.status(200).json(villagesWithFullUrls);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching villages', 
      error: error.message 
    });
  }
});
app.post('/api/addVillage', async (req, res) => {
    try {
        const { name, description, images } = req.body; // Changed from imageUrl to images
        
        if (!name || !description) {
            return res.status(400).json({ error: "Name and description are required" });
        }

        if (!images || images.length === 0) {
            return res.status(400).json({ error: "At least one image is required" });
        }

        const newVillage = new Village({
            name,
            description,
            images, // Now accepts array directly
            location: {
                type: 'Point',
                coordinates: [0, 0] // Default coordinates
            }
        });

        await newVillage.save();
        res.status(201).json({
            _id: newVillage._id,
            name: newVillage.name,
            description: newVillage.description,
            images: newVillage.images // Return full images array
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ 
            error: "Failed to save village",
            details: error.message 
        });
    }
});
    app.get('/api/villages', async (req, res) => {
        try {
        const villages = await Village.find();
        res.status(200).json(villages);
        } catch (error) {
        res.status(500).json({ message: 'Error fetching villages', error: error.message });
        }
    });
    // نقاط API// API endpoints
app.post('/api/landmarks', async (req, res) => {
  try {
    const landmark = new Landmark({
      ...req.body,
      verified: false,
      votes: []
    });
    await landmark.save();
    res.status(201).json(landmark);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Improved vote endpoint
app.post("/api/landmarks/:id/vote", async (req, res) => {
  const { id } = req.params;
  const { vote } = req.body;

  if (!vote || !['yes', 'no'].includes(vote)) {
    return res.status(400).json({ message: "Invalid vote type" });
  }

  const landmark = await Landmark.findById(id);
  if (!landmark) return res.status(404).json({ message: "Landmark not found" });

  if (vote === "yes") landmark.yesVotes += 1;
  if (vote === "no") landmark.noVotes += 1;

  await landmark.save();
  res.json(landmark);
});

app.delete("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Landmark.findByIdAndDelete(id);
    res.status(200).json({ message: "Landmark deleted" });
  } catch (error) {
    console.error("Error deleting landmark:", error);
    res.status(500).json({ error: "Server error deleting landmark" });
  }
});

mongoose.connect(process.env.DB)
    .then(() => { console.log('MongoDB connected successfully'); })
    .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 8082;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
