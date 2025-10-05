// backend/controllers/imageController.js
const Image = require('../models/Image');
const fs = require('fs');
const path = require('path');

// Helper to construct the absolute path for local file operations
const getImagePath = (relativePath) => path.join(__dirname, '..', relativePath);

// --- CREATE Image (POST) ---
exports.createImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded.' });
    }

    const newImage = new Image({
      title: req.body.title,
      description: req.body.description,
      imageUrl: `/uploads/${req.file.filename}`, // Relative path for frontend access
      originalName: req.file.filename,
    });

    const image = await newImage.save();
    res.status(201).json(image);
  } catch (err) {
    console.error(err.message);
    // CRITICAL: Clean up file if DB save fails
    if (req.file) {
        fs.unlinkSync(req.file.path); 
    }
    res.status(500).json({ msg: 'Server Error during image creation.', error: err.message });
  }
};

// --- READ All Images (GET) ---
exports.getImages = async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error fetching images.' });
  }
};

// --- READ Single Image (GET /:id) ---
exports.getImageById = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ msg: 'Image not found' });
    }
    res.json(image);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error retrieving image.' });
  }
};

// --- UPDATE Image (PUT /:id) ---
exports.updateImage = async (req, res) => {
  try {
    const { title, description } = req.body;
    let updateFields = { title, description };
    let oldImagePath = null;

    const existingImage = await Image.findById(req.params.id);
    if (!existingImage) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(404).json({ msg: 'Image not found' });
    }

    // Handle new file upload
    if (req.file) {
      updateFields.imageUrl = `/uploads/${req.file.filename}`;
      updateFields.originalName = req.file.filename;
      oldImagePath = getImagePath(existingImage.imageUrl);
    }

    const updatedImage = await Image.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    // If a new file was uploaded, delete the old file from the filesystem
    if (req.file && fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
    }

    res.json(updatedImage);
  } catch (err) {
    console.error(err.message);
    // Clean up newly uploaded file if DB update fails
    if (req.file) {
        fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ msg: 'Server Error during image update.', error: err.message });
  }
};

// --- DELETE Image (DELETE /:id) ---
exports.deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ msg: 'Image not found' });
    }

    // 1. Construct the local file path and delete the file from the filesystem
    const imagePath = getImagePath(image.imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    // 2. Delete the record from MongoDB
    await Image.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Image deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error during image deletion.' });
  }
};