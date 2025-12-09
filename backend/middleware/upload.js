const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define absolute path to backend/uploads
const uploadRoot = path.join(__dirname, '../uploads');
const pdfDir = path.join(uploadRoot, 'pdfs');
const imgDir = path.join(uploadRoot, 'images');

// Ensure upload directories exist using absolute paths
[uploadRoot, pdfDir, imgDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// PDF upload configuration
const pdfStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, pdfDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'pdf-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const pdfUpload = multer({
    storage: pdfStorage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

// Image upload configuration
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imgDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'image-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const imageUpload = multer({
    storage: imageStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// IMPORTANT: Exporting the .single() middleware functions directly
module.exports = {
    pdfUpload: pdfUpload.single('pdf'),
    imageUpload: imageUpload.single('image')
};