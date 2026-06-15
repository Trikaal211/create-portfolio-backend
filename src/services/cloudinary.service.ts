import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary';
import { AppError } from '../utils/appError';

export const uploadImage = async (file: Express.Multer.File, folderName: string = 'kiwiclicks'): Promise<string> => {
  if (!file) {
    throw new AppError('No file provided for upload', 400);
  }

  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: folderName },
        (error, result) => {
          if (error) {
            reject(new AppError(`Cloudinary upload failed: ${error.message}`, 500));
          } else {
            resolve(result?.secure_url || '');
          }
        }
      );
      uploadStream.end(file.buffer);
    });
  } else {
    // Fallback: Generate a base64 data URI of the file so it works out-of-the-box
    const base64Data = file.buffer.toString('base64');
    return `data:${file.mimetype};base64,${base64Data}`;
  }
};
