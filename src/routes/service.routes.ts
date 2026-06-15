import { Router } from 'express';
import { z } from 'zod';
import {
  createService,
  getAllServices,
  getServiceBySlug,
  updateService,
  deleteService,
} from '../controllers/service.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';

const router = Router();

const createServiceSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters long'),
    slug: z.string().optional(),
    description: z.string().min(10, 'Description must be at least 10 characters long'),
    featuredImage: z.string().url('Featured image must be a valid URL'),
    content: z.string().min(20, 'Content must be at least 20 characters long'),
  }),
});

const updateServiceSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    slug: z.string().optional(),
    description: z.string().min(10).optional(),
    featuredImage: z.string().url().optional(),
    content: z.string().min(20).optional(),
  }),
});

/**
 * @openapi
 * /api/services:
 *   post:
 *     summary: Create a service
 *     description: Creates a new service offering (e.g. SEO, Social Media Marketing). Admin only.
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - featuredImage
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: "AI Automation"
 *               description:
 *                 type: string
 *                 example: "Leverage artificial intelligence to automate workflow bottlenecks."
 *               featuredImage:
 *                 type: string
 *                 format: uri
 *                 example: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
 *               content:
 *                 type: string
 *                 example: "Full-scale custom agent workflows, automated database entry, and chatbot building..."
 *     responses:
 *       201:
 *         description: Service created
 *       400:
 *         description: Validation failed
 * 
 *   get:
 *     summary: Get all services
 *     description: Public list of marketing and dev service offerings.
 *     tags:
 *       - Services
 *     responses:
 *       200:
 *         description: Array of service items
 */
router.post('/', protect, validate(createServiceSchema), createService);
router.get('/', getAllServices);

/**
 * @openapi
 * /api/services/slug/{slug}:
 *   get:
 *     summary: Get service by slug
 *     description: Retrieve details of a single service offering using its unique slug.
 *     tags:
 *       - Services
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service retrieved
 *       404:
 *         description: Service not found
 */
router.get('/slug/:slug', getServiceBySlug);

/**
 * @openapi
 * /api/services/{id}:
 *   put:
 *     summary: Update a service
 *     description: Modify details of an existing service offering. Admin only.
 *     tags:
 *       - Services
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
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service updated
 * 
 *   delete:
 *     summary: Delete a service
 *     description: Delete a service offering record. Admin only.
 *     tags:
 *       - Services
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
 *         description: Service deleted
 */
router.put('/:id', protect, validate(updateServiceSchema), updateService);
router.delete('/:id', protect, deleteService);

export default router;
export { router as serviceRouter };
