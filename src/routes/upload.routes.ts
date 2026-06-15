import { Router, Request, Response, NextFunction } from 'express';
import { upload } from '../middlewares/upload.middleware';
import { protect } from '../middlewares/auth.middleware';
import { uploadImage } from '../services/cloudinary.service';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

/**
 * @openapi
 * /api/upload:
 *   post:
 *     summary: Upload an image
 *     description: Accepts multipart/form-data with an image field. Uploads it to Cloudinary and returns the URL. Falls back to base64 Data URI when API keys are not supplied. Admin only.
 *     tags:
 *       - Uploads
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (Max 5MB)
 *               folder:
 *                 type: string
 *                 description: Cloudinary folder namespace to upload into
 *                 example: blogs
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       example: "https://res.cloudinary.com/demo/image/upload/v1572212345/sample.jpg"
 *       400:
 *         description: No file uploaded or invalid file format
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  protect,
  upload.single('image'),
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next(new AppError('Please upload an image file under "image" key.', 400));
    }

    const folder = req.body.folder || 'kiwiclicks';
    const imageUrl = await uploadImage(req.file, folder);

    res.status(200).json({
      status: 'success',
      data: {
        url: imageUrl,
      },
    });
  })
);

export default router;
export { router as uploadRouter };
