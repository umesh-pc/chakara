const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure folders exist
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = 'public/uploads/products';
    if (req.originalUrl.includes('gallery') || req.path.includes('gallery')) {
      dest = 'public/uploads/gallery';
    } else if (req.originalUrl.includes('restoration') || req.path.includes('restoration')) {
      dest = 'public/uploads/restorations';
    }
    ensureDirExists(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname).toLowerCase());
  }
});

// File filter (images only)
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed! (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

module.exports = upload;
