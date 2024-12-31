const express = require('express');
const app = express();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const cors = require('cors');
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/submitUpdate', (req, res) => {
    try {
        const { firstName, lastName, villageName, updateType, description } = req.body;
        const images = req.files.map((file) => `/uploads/${file.filename}`);

        // Save update logic (e.g., database save)

        res.status(200).json({ message: 'Update submitted successfully', newUpdate });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving update', error });
    }
});

app.listen(8081, () => console.log('Server running on port 8081'));


// Connect to MongoDB
mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false

  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

