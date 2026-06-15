import { Router } from 'express';
import { authRouter } from './auth.routes';
import { blogRouter } from './blog.routes';
import { teamRouter } from './team.routes';
import { serviceRouter } from './service.routes';
import { faqRouter } from './faq.routes';
import { testimonialRouter } from './testimonial.routes';
import { leadRouter } from './lead.routes';
import { dashboardRouter } from './dashboard.routes';
import { uploadRouter } from './upload.routes';
import { settingsRouter } from './settings.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/blogs', blogRouter);
router.use('/team', teamRouter);
router.use('/services', serviceRouter);
router.use('/faqs', faqRouter);
router.use('/testimonials', testimonialRouter);
router.use('/leads', leadRouter);
router.use('/dashboard', dashboardRouter);
router.use('/upload', uploadRouter);
router.use('/settings', settingsRouter);

export default router;
export { router as rootRouter };
