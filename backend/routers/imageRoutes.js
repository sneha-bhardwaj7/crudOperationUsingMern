// backend/routers/imageRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../config/multerConfig'); // The configured Multer middleware
const imageController = require('../controllers/imageController');
const { protect } = require('../middleware/authMiddleware'); // Auth placeholder

// Base route is /api/images

// Create Image (Requires file upload middleware)
router.post('/', upload, imageController.createImage); 

// Get All Images
router.get('/', imageController.getImages);

// Get Single Image
router.get('/:id', imageController.getImageById);

// Update Image (Requires file upload middleware, as file is optional)
router.put('/:id', upload, imageController.updateImage); 

// Delete Image
router.delete('/:id', imageController.deleteImage);

module.exports = router;