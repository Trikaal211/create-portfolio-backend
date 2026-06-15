import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';

export const addTeamMember = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, designation, image, bio, linkedin, twitter } = req.body;

  const teamMember = await prisma.teamMember.create({
    data: {
      name,
      designation,
      image,
      bio,
      linkedin,
      twitter,
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      teamMember,
    },
  });
});

export const getAllTeamMembers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const teamMembers = await prisma.teamMember.findMany({
    orderBy: { createdAt: 'asc' },
  });

  res.status(200).json({
    status: 'success',
    results: teamMembers.length,
    data: {
      teamMembers,
    },
  });
});

export const updateTeamMember = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const { name, designation, image, bio, linkedin, twitter } = req.body;

  const member = await prisma.teamMember.findUnique({ where: { id } });
  if (!member) {
    return next(new AppError('No team member found with that ID', 404));
  }

  const updatedMember = await prisma.teamMember.update({
    where: { id },
    data: {
      name,
      designation,
      image,
      bio,
      linkedin,
      twitter,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      teamMember: updatedMember,
    },
  });
});

export const deleteTeamMember = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;

  const member = await prisma.teamMember.findUnique({ where: { id } });
  if (!member) {
    return next(new AppError('No team member found with that ID', 404));
  }

  await prisma.teamMember.delete({
    where: { id },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
