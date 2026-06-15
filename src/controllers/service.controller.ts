import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export const createService = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { title, description, featuredImage, content } = req.body;

  let baseSlug = req.body.slug ? slugify(req.body.slug) : slugify(title);
  let slug = baseSlug;
  let isSlugExists = await prisma.service.findUnique({ where: { slug } });
  let counter = 1;
  while (isSlugExists) {
    slug = `${baseSlug}-${counter}`;
    isSlugExists = await prisma.service.findUnique({ where: { slug } });
    counter++;
  }

  const service = await prisma.service.create({
    data: {
      title,
      slug,
      description,
      featuredImage,
      content,
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      service,
    },
  });
});

export const getAllServices = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const services = await prisma.service.findMany();

  res.status(200).json({
    status: 'success',
    results: services.length,
    data: {
      services,
    },
  });
});

export const getServiceBySlug = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const slug = req.params.slug as string;

  const service = await prisma.service.findUnique({
    where: { slug },
  });

  if (!service) {
    return next(new AppError('No service found with that slug', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      service,
    },
  });
});

export const updateService = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const { title, description, featuredImage, content } = req.body;

  const existingService = await prisma.service.findUnique({ where: { id } });
  if (!existingService) {
    return next(new AppError('No service found with that ID', 404));
  }

  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
  if (content !== undefined) updateData.content = content;

  if (req.body.slug !== undefined || (title !== undefined && title !== existingService.title)) {
    let baseSlug = req.body.slug ? slugify(req.body.slug) : slugify(title || existingService.title);
    let slug = baseSlug;
    let isSlugExists = await prisma.service.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });
    let counter = 1;
    while (isSlugExists) {
      slug = `${baseSlug}-${counter}`;
      isSlugExists = await prisma.service.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });
      counter++;
    }
    updateData.slug = slug;
  }

  const updatedService = await prisma.service.update({
    where: { id },
    data: updateData,
  });

  res.status(200).json({
    status: 'success',
    data: {
      service: updatedService,
    },
  });
});

export const deleteService = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;

  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) {
    return next(new AppError('No service found with that ID', 404));
  }

  await prisma.service.delete({
    where: { id },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
