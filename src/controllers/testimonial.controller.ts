import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';

export const createTestimonial = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { clientName, company, designation, review, rating, image } = req.body;

  const testimonial = await prisma.testimonial.create({
    data: {
      clientName,
      company,
      designation,
      review,
      rating: Number(rating),
      image,
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      testimonial,
    },
  });
});

export const getAllTestimonials = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const testimonials = await prisma.testimonial.findMany();

  res.status(200).json({
    status: 'success',
    results: testimonials.length,
    data: {
      testimonials,
    },
  });
});

export const updateTestimonial = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const { clientName, company, designation, review, rating, image } = req.body;

  const existingTestimonial = await prisma.testimonial.findUnique({ where: { id } });
  if (!existingTestimonial) {
    return next(new AppError('No testimonial found with that ID', 404));
  }

  const updatedTestimonial = await prisma.testimonial.update({
    where: { id },
    data: {
      clientName,
      company,
      designation,
      review,
      rating: rating !== undefined ? Number(rating) : undefined,
      image,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      testimonial: updatedTestimonial,
    },
  });
});

export const deleteTestimonial = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;

  const existingTestimonial = await prisma.testimonial.findUnique({ where: { id } });
  if (!existingTestimonial) {
    return next(new AppError('No testimonial found with that ID', 404));
  }

  await prisma.testimonial.delete({
    where: { id },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
