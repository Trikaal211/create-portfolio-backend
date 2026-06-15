import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';
import { sendLeadNotification } from '../utils/mailer';

export const createLead = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, phone, service, budget, message } = req.body;

  const lead = await prisma.contactLead.create({
    data: {
      name,
      email,
      phone,
      service,
      budget,
      message,
    },
  });

  // Asynchronously trigger admin email alert (non-blocking)
  sendLeadNotification(lead).catch((err) => {
    console.error('Failed to trigger admin notification email:', err);
  });

  res.status(201).json({
    status: 'success',
    data: {
      lead,
    },
  });
});

export const getAllLeads = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { status } = req.query;

  const filter: any = {};
  if (status) {
    filter.status = String(status);
  }

  const leads = await prisma.contactLead.findMany({
    where: filter,
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    status: 'success',
    results: leads.length,
    data: {
      leads,
    },
  });
});

export const updateLeadStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const { status } = req.body;

  if (!status) {
    return next(new AppError('Please provide a status value', 400));
  }

  const existingLead = await prisma.contactLead.findUnique({ where: { id } });
  if (!existingLead) {
    return next(new AppError('No contact lead found with that ID', 404));
  }

  const updatedLead = await prisma.contactLead.update({
    where: { id },
    data: { status },
  });

  res.status(200).json({
    status: 'success',
    data: {
      lead: updatedLead,
    },
  });
});
