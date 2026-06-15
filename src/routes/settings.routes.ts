import { Router } from 'express';
import { z } from 'zod';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';

const router = Router();

const updateSettingsSchema = z.object({
  body: z.object({
    agencyName: z.string().min(2, 'Agency name is required'),
    logoUrl: z.string().url('Logo must be a valid URL').optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    email: z.string().email('Provide a valid email address').optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    mapsLink: z.string().optional().or(z.literal('')),
    facebookLink: z.string().optional().or(z.literal('')),
    instagramLink: z.string().optional().or(z.literal('')),
    linkedinLink: z.string().optional().or(z.literal('')),
    twitterLink: z.string().optional().or(z.literal('')),
  }),
});

/**
 * @openapi
 * /api/settings:
 *   get:
 *     summary: Get agency configurations
 *     description: Public endpoint to fetch global branding and settings (logo, address, links).
 *     tags:
 *       - Settings
 *     responses:
 *       200:
 *         description: Settings configurations
 * 
 *   put:
 *     summary: Update agency configurations
 *     description: Update branding and settings console details. Admin only.
 *     tags:
 *       - Settings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agencyName
 *             properties:
 *               agencyName:
 *                 type: string
 *                 example: KiwiClicks
 *               logoUrl:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               mapsLink:
 *                 type: string
 *               facebookLink:
 *                 type: string
 *               instagramLink:
 *                 type: string
 *               linkedinLink:
 *                 type: string
 *               twitterLink:
 *                 type: string
 *     responses:
 *       200:
 *         description: Settings updated
 */
router.get('/', getSettings);
router.put('/', protect, validate(updateSettingsSchema), updateSettings);

export default router;
export { router as settingsRouter };
