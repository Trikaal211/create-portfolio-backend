import multer from 'multer';
import { AppError } from '../utils/appError';

// Configure storage buffer
const storage = multer.memoryStorage();

// Filter uploads by content type (images only)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only image uploads are allowed.', 400));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Enforce a 5MB image size limit
  },
});
export default upload;
