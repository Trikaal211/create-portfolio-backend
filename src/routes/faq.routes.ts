import { Router } from 'express';
import { z } from 'zod';
import {
  createFAQ,
  getAllFAQs,
  updateFAQ,
  deleteFAQ,
} from '../controllers/faq.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';

const router = Router();

const createFAQSchema = z.object({
  body: z.object({
    question: z.string().min(5, 'Question must be at least 5 characters long'),
    answer: z.string().min(10, 'Answer must be at least 10 characters long'),
    category: z.string().min(2, 'Category name is required'),
  }),
});

const updateFAQSchema = z.object({
  body: z.object({
    question: z.string().min(5).optional(),
    answer: z.string().min(10).optional(),
    category: z.string().min(2).optional(),
  }),
});

/**
 * @openapi
 * /api/faqs:
 *   post:
 *     summary: Add FAQ
 *     description: Create a new FAQ entry. Admin only.
 *     tags:
 *       - FAQs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - answer
 *               - category
 *             properties:
 *               question:
 *                 type: string
 *                 example: "How long does a typical SEO audit take?"
 *               answer:
 *                 type: string
 *                 example: "Generally, audits take between 2 to 4 weeks depending on the size and complexity of the website."
 *               category:
 *                 type: string
 *                 example: "SEO"
 *     responses:
 *       201:
 *         description: FAQ created
 *       400:
 *         description: Validation failed
 * 
 *   get:
 *     summary: Get all FAQs
 *     description: Public route to fetch FAQs, support filtering by category query parameter.
 *     tags:
 *       - FAQs
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category of FAQs to retrieve
 *     responses:
 *       200:
 *         description: Array of FAQs
 */
router.post('/', protect, validate(createFAQSchema), createFAQ);
router.get('/', getAllFAQs);

/**
 * @openapi
 * /api/faqs/{id}:
 *   put:
 *     summary: Update FAQ
 *     description: Edit details of an FAQ entry. Admin only.
 *     tags:
 *       - FAQs
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
 *               question:
 *                 type: string
 *     responses:
 *       200:
 *         description: FAQ updated
 * 
 *   delete:
 *     summary: Delete FAQ
 *     description: Delete an FAQ entry. Admin only.
 *     tags:
 *       - FAQs
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
 *         description: FAQ deleted
 */
router.put('/:id', protect, validate(updateFAQSchema), updateFAQ);
router.delete('/:id', protect, deleteFAQ);

export default router;
export { router as faqRouter };
