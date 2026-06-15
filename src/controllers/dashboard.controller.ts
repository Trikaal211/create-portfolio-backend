import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { catchAsync } from '../utils/catchAsync';

export const getDashboardStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Concurrently count totals for all administrative models and grab the 5 most recent leads
  const [
    totalLeads,
    pendingLeads,
    totalBlogs,
    publishedBlogs,
    totalTeam,
    totalServices,
    totalTestimonials,
    recentLeads
  ] = await Promise.all([
    prisma.contactLead.count(),
    prisma.contactLead.count({ where: { status: 'pending' } }),
    prisma.blog.count(),
    prisma.blog.count({ where: { published: true } }),
    prisma.teamMember.count(),
    prisma.service.count(),
    prisma.testimonial.count(),
    prisma.contactLead.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        leads: {
          total: totalLeads,
          pending: pendingLeads,
        },
        blogs: {
          total: totalBlogs,
          published: publishedBlogs,
        },
        teamCount: totalTeam,
        servicesCount: totalServices,
        testimonialsCount: totalTestimonials,
      },
      recentLeads,
    },
  });
});
