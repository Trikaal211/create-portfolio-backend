import { Router } from 'express';
import { z } from 'zod';
import {
  addTeamMember,
  getAllTeamMembers,
  updateTeamMember,
  deleteTeamMember,
} from '../controllers/team.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';

const router = Router();

const createTeamMemberSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    designation: z.string().min(2, 'Designation is required'),
    image: z.string().url('Image must be a valid URL'),
    bio: z.string().min(5, 'Bio must be at least 5 characters long'),
    linkedin: z.string().url('LinkedIn link must be a valid URL').optional().or(z.literal('')),
    twitter: z.string().url('Twitter link must be a valid URL').optional().or(z.literal('')),
  }),
});

const updateTeamMemberSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    designation: z.string().min(2).optional(),
    image: z.string().url().optional(),
    bio: z.string().min(5).optional(),
    linkedin: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
  }),
});

/**
 * @openapi
 * /api/team:
 *   post:
 *     summary: Add team member
 *     description: Add a new member to the agency team. Admin only.
 *     tags:
 *       - Team
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - designation
 *               - image
 *               - bio
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Sarah Jenkins"
 *               designation:
 *                 type: string
 *                 example: "Head of SEO"
 *               image:
 *                 type: string
 *                 format: uri
 *                 example: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
 *               bio:
 *                 type: string
 *                 example: "Sarah has 8+ years of organic search marketing experience."
 *               linkedin:
 *                 type: string
 *                 format: uri
 *               twitter:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Member added successfully
 *       400:
 *         description: Validation failed
 * 
 *   get:
 *     summary: Get all team members
 *     description: Public list of agency team members.
 *     tags:
 *       - Team
 *     responses:
 *       200:
 *         description: Array of team members
 */
router.post('/', protect, validate(createTeamMemberSchema), addTeamMember);
router.get('/', getAllTeamMembers);

/**
 * @openapi
 * /api/team/{id}:
 *   put:
 *     summary: Update team member
 *     description: Edit details of a team member. Admin only.
 *     tags:
 *       - Team
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
 *               designation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Team member updated
 * 
 *   delete:
 *     summary: Delete team member
 *     description: Delete a team member record. Admin only.
 *     tags:
 *       - Team
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
 *         description: Member deleted
 */
router.put('/:id', protect, validate(updateTeamMemberSchema), updateTeamMember);
router.delete('/:id', protect, deleteTeamMember);

export default router;
export { router as teamRouter };
