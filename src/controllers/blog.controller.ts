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

export const createBlog = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { title, excerpt, content, featuredImage, category, author, tags, published, metaTitle, metaDescription, ogImage, keywords, canonicalUrl } = req.body;

  let baseSlug = req.body.slug ? slugify(req.body.slug) : slugify(title);
  
  // Verify unique slug and suffix on duplicates
  let slug = baseSlug;
  let isSlugExists = await prisma.blog.findUnique({ where: { slug } });
  let counter = 1;
  while (isSlugExists) {
    slug = `${baseSlug}-${counter}`;
    isSlugExists = await prisma.blog.findUnique({ where: { slug } });
    counter++;
  }

  const blog = await prisma.blog.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      category,
      author,
      tags: tags || [],
      published: published !== undefined ? published : false,
      metaTitle,
      metaDescription,
      ogImage,
      keywords: keywords || [],
      canonicalUrl,
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      blog,
    },
  });
});

export const getAllBlogs = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { category, published } = req.query;
  
  const filter: any = {};
  if (category) {
    filter.category = String(category);
  }
  if (published !== undefined) {
    filter.published = published === 'true';
  }

  const blogs = await prisma.blog.findMany({
    where: filter,
    orderBy: { createdAt: 'desc' },
  });

  res.status(200).json({
    status: 'success',
    results: blogs.length,
    data: {
      blogs,
    },
  });
});

export const getBlogBySlug = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const slug = req.params.slug as string;

  const blog = await prisma.blog.findUnique({
    where: { slug },
  });

  if (!blog) {
    return next(new AppError('No blog found with that slug', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      blog,
    },
  });
});

export const updateBlog = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const { title, excerpt, content, featuredImage, category, author, tags, published, metaTitle, metaDescription, ogImage, keywords, canonicalUrl } = req.body;

  // Check if blog exists
  const existingBlog = await prisma.blog.findUnique({ where: { id } });
  if (!existingBlog) {
    return next(new AppError('No blog found with that ID', 404));
  }

  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (excerpt !== undefined) updateData.excerpt = excerpt;
  if (content !== undefined) updateData.content = content;
  if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
  if (category !== undefined) updateData.category = category;
  if (author !== undefined) updateData.author = author;
  if (tags !== undefined) updateData.tags = tags;
  if (published !== undefined) updateData.published = published;
  if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
  if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
  if (ogImage !== undefined) updateData.ogImage = ogImage;
  if (keywords !== undefined) updateData.keywords = keywords;
  if (canonicalUrl !== undefined) updateData.canonicalUrl = canonicalUrl;

  // Handle slug updates if title changes or manual slug is provided
  if (req.body.slug !== undefined || (title !== undefined && title !== existingBlog.title)) {
    let baseSlug = req.body.slug ? slugify(req.body.slug) : slugify(title || existingBlog.title);
    let slug = baseSlug;
    let isSlugExists = await prisma.blog.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });
    let counter = 1;
    while (isSlugExists) {
      slug = `${baseSlug}-${counter}`;
      isSlugExists = await prisma.blog.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });
      counter++;
    }
    updateData.slug = slug;
  }

  const updatedBlog = await prisma.blog.update({
    where: { id },
    data: updateData,
  });

  res.status(200).json({
    status: 'success',
    data: {
      blog: updatedBlog,
    },
  });
});

export const deleteBlog = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;

  const blog = await prisma.blog.findUnique({ where: { id } });
  if (!blog) {
    return next(new AppError('No blog found with that ID', 404));
  }

  await prisma.blog.delete({
    where: { id },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const getBlogById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;

  const blog = await prisma.blog.findUnique({
    where: { id },
  });

  if (!blog) {
    return next(new AppError('No blog found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      blog,
    },
  });
});
