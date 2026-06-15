import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @openapi
 * /api/dashboard/stats:
 *   get:
 *     summary: Get administrative dashboard statistics
 *     description: Computes operational stats like total leads, pending counts, blog counts, etc. and lists the 5 most recent leads. Admin only.
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats payload
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
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', protect, getDashboardStats);

export default router;
export { router as dashboardRouter };
