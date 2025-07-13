import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Storage configuration for profile photos
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/profiles';
        ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, `profile-${uniqueSuffix}${fileExtension}`);
    }
});

// Storage configuration for documents
const documentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/documents';
        ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        const fieldName = file.fieldname;
        cb(null, `${fieldName}-${uniqueSuffix}${fileExtension}`);
    }
});

// File filter for images (profile photos)
const imageFileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, JPG, PNG, GIF) are allowed for profile photos'), false);
    }
};

// File filter for documents
const documentFileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files, PDF, and Word documents are allowed'), false);
    }
};

// Multer configuration for user registration
export const uploadUserFiles = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            let uploadPath;
            if (file.fieldname === 'profilePhoto') {
                uploadPath = 'uploads/profiles';
            } else {
                uploadPath = 'uploads/documents';
            }
            ensureDirectoryExists(uploadPath);
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const fileExtension = path.extname(file.originalname);
            const fieldName = file.fieldname;
            cb(null, `${fieldName}-${uniqueSuffix}${fileExtension}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'profilePhoto') {
            imageFileFilter(req, file, cb);
        } else {
            documentFileFilter(req, file, cb);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 4 // Maximum 4 files (profilePhoto, adharCard, panCard, bankDetails)
    }
}).fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'adharCard', maxCount: 1 },
    { name: 'panCard', maxCount: 1 },
    { name: 'bankDetails', maxCount: 1 }
]);

// Simple profile photo upload
export const uploadProfilePhoto = multer({
    storage: profileStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit for profile photos
    }
}).single('profilePhoto');

// Document upload
export const uploadDocument = multer({
    storage: documentStorage,
    fileFilter: documentFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit for documents
    }
}).single('document');