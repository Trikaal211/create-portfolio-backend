import { Router } from 'express';
import { z } from 'zod';
import {
  createLead,
  getAllLeads,
  updateLeadStatus,
} from '../controllers/lead.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';

const router = Router();

const createLeadSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    email: z.string().email('Provide a valid email address'),
    phone: z.string().optional().or(z.literal('')),
    service: z.string().min(2, 'Service selection is required'),
    budget: z.string().optional().or(z.literal('')),
    message: z.string().min(10, 'Message must be at least 10 characters long'),
  }),
});

const updateLeadStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'contacted', 'closed'], {
      errorMap: () => ({ message: 'Status must be pending, contacted, or closed' }),
    }),
  }),
});

/**
 * @openapi
 * /api/leads:
 *   post:
 *     summary: Submit a contact lead
 *     description: Public endpoint to submit contact leads from contact forms.
 *     tags:
 *       - Leads
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - service
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Johnathan Smith"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               phone:
 *                 type: string
 *                 example: "+1-555-0199"
 *               service:
 *                 type: string
 *                 example: "Website Development"
 *               budget:
 *                 type: string
 *                 example: "$5,000 - $10,000"
 *               message:
 *                 type: string
 *                 example: "Looking to build a custom portfolio website with dynamic animations."
 *     responses:
 *       201:
 *         description: Lead submitted successfully
 *       400:
 *         description: Validation failed
 * 
 *   get:
 *     summary: View all leads
 *     description: Retrieve all contact form submissions. Admin only.
 *     tags:
 *       - Leads
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ["pending", "contacted", "closed"]
 *         description: Filter leads by current lifecycle status
 *     responses:
 *       200:
 *         description: Array of submitted leads
 */
router.post('/', validate(createLeadSchema), createLead);
router.get('/', protect, getAllLeads);

/**
 * @openapi
 * /api/leads/{id}/status:
 *   patch:
 *     summary: Update lead status
 *     description: Modify lead status to contacted or closed. Admin only.
 *     tags:
 *       - Leads
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: ["pending", "contacted", "closed"]
 *                 example: "contacted"
 *     responses:
 *       200:
 *         description: Lead status updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Lead not found
 */
router.patch('/:id/status', protect, validate(updateLeadStatusSchema), updateLeadStatus);

export default router;
export { router as leadRouter };
