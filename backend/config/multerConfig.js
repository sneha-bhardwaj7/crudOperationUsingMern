// backend/config/multerConfig.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create the uploads folder if it doesn't exist (in the backend root)
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
// Set storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    // Create a unique filename: fieldname-timestamp.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Initialize upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
  fileFilter: (req, file, cb) => {
    // Check file type: only accept images
    const filetypes = /jpeg|jpg|png|gif|JPG/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF) are allowed!'));
    }
  },
});

// Export the configured single file upload middleware, using the exact key name 'imageFile' 
// that your frontend uses in FormData: formData.append('imageFile', ...)
module.exports = upload.single('imageFile');