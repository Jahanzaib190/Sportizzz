const path = require('path');
const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

const router = express.Router();

// 1. Config Check
console.log('--- CLOUDINARY CONFIG CHECK ---');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? 'Loaded ✅' : 'MISSING ❌');
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Loaded ✅' : 'MISSING ❌');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Auto-create Uploads Folder
if (!fs.existsSync('uploads')) {
    console.log('⚠️ Uploads folder missing. Creating it now...');
    fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

function checkFileType(file, cb) {
  // 1. Added '/i' flag for case-insensitivity (matches PNG, png, Png)
  // 2. Added 'jfif' (common issue) and 'gif'
  const filetypes = /jpg|jpeg|png|webp|jfif|gif/i; 
  
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  // --- DIAGNOSTIC LOG ---
  console.log('🔎 Checking File:');
  console.log(`   - Name: ${file.originalname}`);
  console.log(`   - Ext: ${path.extname(file.originalname)}`);
  console.log(`   - Mime: ${file.mimetype}`);
  console.log(`   - Result: Ext=${extname}, Mime=${mimetype}`);
  // ----------------------

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    // Pass the actual values in the error so we see them
    cb(new Error(`Images only! (Received: ${file.mimetype})`)); 
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// 3. THE FIX: Explicit Middleware Error Handling
// This wrapper catches the crash before it hits the default error handler
router.post('/', (req, res, next) => {
    const uploadSingle = upload.single('image');

    uploadSingle(req, res, (err) => {
        if (err) {
            console.error('❌ MULTER UPLOAD ERROR:', err); // PRINT THE ERROR
            return res.status(500).send({ message: err.message });
        }
        // If no error, proceed to the main logic
        next();
    });
}, async (req, res) => {
  console.log('📸 File received by server. Starting Cloudinary upload...');
  
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'jahanzaib-sports',
    });

    console.log('✅ Cloudinary Success:', result.secure_url);

    fs.unlink(req.file.path, (err) => {
      if (err) console.error('⚠️ Failed to delete local file:', err);
    });

    res.send({
      message: 'Image Uploaded',
      image: result.secure_url,
    });
  } catch (error) {
    console.error('❌ CLOUDINARY API ERROR:', error);
    res.status(500).send({ message: 'Cloudinary Upload Failed' });
  }
});

module.exports = router;