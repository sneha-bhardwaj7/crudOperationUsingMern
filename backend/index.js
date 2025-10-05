// backend/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// --- Middleware Setup ---
app.use(cors()); // Allow requests from the frontend
app.use(express.json()); // To parse JSON request bodies

// --- Serve Static Files (The uploaded images) ---
// This makes http://localhost:5000/uploads/image_name.jpg accessible
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

// --- MongoDB Connection ---
const MONGO_URI = process.env.MONGO_URI; 
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- Routes Registration ---
const imageRoutes = require('./routers/imageRoutes');
app.use('/api/images', imageRoutes);

// --- Server Start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});