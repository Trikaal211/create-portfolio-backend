import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';

export const createFAQ = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { question, answer, category } = req.body;

  const faq = await prisma.fAQ.create({
    data: {
      question,
      answer,
      category,
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      faq,
    },
  });
});

export const getAllFAQs = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { category } = req.query;

  const filter: any = {};
  if (category) {
    filter.category = String(category);
  }

  const faqs = await prisma.fAQ.findMany({
    where: filter,
  });

  res.status(200).json({
    status: 'success',
    results: faqs.length,
    data: {
      faqs,
    },
  });
});

export const updateFAQ = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const { question, answer, category } = req.body;

  const existingFAQ = await prisma.fAQ.findUnique({ where: { id } });
  if (!existingFAQ) {
    return next(new AppError('No FAQ found with that ID', 404));
  }

  const updatedFAQ = await prisma.fAQ.update({
    where: { id },
    data: {
      question,
      answer,
      category,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      faq: updatedFAQ,
    },
  });
});

export const deleteFAQ = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;

  const existingFAQ = await prisma.fAQ.findUnique({ where: { id } });
  if (!existingFAQ) {
    return next(new AppError('No FAQ found with that ID', 404));
  }

  await prisma.fAQ.delete({
    where: { id },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
