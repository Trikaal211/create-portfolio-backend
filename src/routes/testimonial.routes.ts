import { Router } from 'express';
import { z } from 'zod';
import {
  createTestimonial,
  getAllTestimonials,
  updateTestimonial,
  deleteTestimonial,
} from '../controllers/testimonial.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';

const router = Router();

const createTestimonialSchema = z.object({
  body: z.object({
    clientName: z.string().min(2, 'Client name must be at least 2 characters long'),
    company: z.string().min(2, 'Company name is required'),
    designation: z.string().min(2, 'Designation is required'),
    review: z.string().min(10, 'Review must be at least 10 characters long'),
    rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
    image: z.string().url('Image must be a valid URL').optional().or(z.literal('')),
  }),
});

const updateTestimonialSchema = z.object({
  body: z.object({
    clientName: z.string().min(2).optional(),
    company: z.string().min(2).optional(),
    designation: z.string().min(2).optional(),
    review: z.string().min(10).optional(),
    rating: z.number().min(1).max(5).optional(),
    image: z.string().url().optional().or(z.literal('')),
  }),
});

/**
 * @openapi
 * /api/testimonials:
 *   post:
 *     summary: Add testimonial
 *     description: Submit a new testimonial review from a client. Admin only.
 *     tags:
 *       - Testimonials
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientName
 *               - company
 *               - designation
 *               - review
 *               - rating
 *             properties:
 *               clientName:
 *                 type: string
 *                 example: "Mark Cubit"
 *               company:
 *                 type: string
 *                 example: "TechVentures Ltd"
 *               designation:
 *                 type: string
 *                 example: "Chief Operating Officer"
 *               review:
 *                 type: string
 *                 example: "KiwiClicks delivered our new web app ahead of schedule and with spectacular aesthetics."
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               image:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Testimonial created
 *       400:
 *         description: Validation failed
 * 
 *   get:
 *     summary: Get all testimonials
 *     description: Public route to fetch client reviews.
 *     tags:
 *       - Testimonials
 *     responses:
 *       200:
 *         description: Array of testimonials
 */
router.post('/', protect, validate(createTestimonialSchema), createTestimonial);
router.get('/', getAllTestimonials);

/**
 * @openapi
 * /api/testimonials/{id}:
 *   put:
 *     summary: Update testimonial
 *     description: Edit details of a testimonial. Admin only.
 *     tags:
 *       - Testimonials
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Testimonial updated
 * 
 *   delete:
 *     summary: Delete testimonial
 *     description: Permanently remove a testimonial from display. Admin only.
 *     tags:
 *       - Testimonials
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Testimonial deleted
 */
router.put('/:id', protect, validate(updateTestimonialSchema), updateTestimonial);
router.delete('/:id', protect, deleteTestimonial);

export default router;
export { router as testimonialRouter };
