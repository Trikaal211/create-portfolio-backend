import { Router } from 'express';
import { z } from 'zod';
import {
  createBlog,
  getAllBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  getBlogById,
  getBlogsByCategory,
} from '../controllers/blog.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validation.middleware';

const router = Router();

const createBlogSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters long'),
    slug: z.string().optional(),
    excerpt: z.string().min(10, 'Excerpt must be at least 10 characters long'),
    content: z.string().min(20, 'Content must be at least 20 characters long'),
    featuredImage: z.string().url('Featured image must be a valid URL'),
    category: z.string().min(2, 'Category name is required'),
    author: z.string().min(2, 'Author name is required'),
    tags: z.array(z.string()).optional(),
    published: z.boolean().optional(),
    metaTitle: z.string().optional().nullable(),
    metaDescription: z.string().optional().nullable(),
    ogImage: z.string().url().optional().or(z.literal('')).nullable(),
    keywords: z.array(z.string()).optional(),
    canonicalUrl: z.string().url().optional().or(z.literal('')).nullable(),
    schemaMarkup: z.string().optional().nullable(),
  }),
});

const updateBlogSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    slug: z.string().optional(),
    excerpt: z.string().min(10).optional(),
    content: z.string().min(20).optional(),
    featuredImage: z.string().url().optional(),
    category: z.string().min(2).optional(),
    author: z.string().min(2).optional(),
    tags: z.array(z.string()).optional(),
    published: z.boolean().optional(),
    metaTitle: z.string().optional().nullable(),
    metaDescription: z.string().optional().nullable(),
    ogImage: z.string().url().optional().or(z.literal('')).nullable(),
    keywords: z.array(z.string()).optional(),
    canonicalUrl: z.string().url().optional().or(z.literal('')).nullable(),
    schemaMarkup: z.string().optional().nullable(),
  }),
});

/**
 * @openapi
 * /api/blogs:
 *   post:
 *     summary: Create a blog post
 *     description: Adds a new blog post. Restricted to admins.
 *     tags:
 *       - Blogs
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - excerpt
 *               - content
 *               - featuredImage
 *               - category
 *               - author
 *             properties:
 *               title:
 *                 type: string
 *                 example: "10 Key SEO Tips for 2026"
 *               slug:
 *                 type: string
 *                 example: "seo-tips-2026"
 *               excerpt:
 *                 type: string
 *                 example: "Learn how to optimize your site with these simple yet effective tips."
 *               content:
 *                 type: string
 *                 example: "Detailed search engine optimization guidelines covering Core Web Vitals..."
 *               featuredImage:
 *                 type: string
 *                 format: uri
 *                 example: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
 *               category:
 *                 type: string
 *                 example: "SEO"
 *               author:
 *                 type: string
 *                 example: "Jane Doe"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["SEO", "Marketing", "Growth"]
 *               published:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Blog post created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 * 
 *   get:
 *     summary: Get all blog posts
 *     description: Retrieves list of blogs, supporting public filters.
 *     tags:
 *       - Blogs
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter articles by category
 *       - in: query
 *         name: published
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         description: Filter by publish state
 *     responses:
 *       200:
 *         description: A list of blog posts
 */
router.post('/', protect, validate(createBlogSchema), createBlog);
router.get('/', getAllBlogs);
router.get('/category/:category', getBlogsByCategory);

/**
 * @openapi
 * /api/blogs/slug/{slug}:
 *   get:
 *     summary: Get blog by slug
 *     description: Retrieve details of a single blog using its unique URL slug.
 *     tags:
 *       - Blogs
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique slug representing the blog post
 *     responses:
 *       200:
 *         description: Blog post retrieved
 *       404:
 *         description: Blog post not found
 */
router.get('/slug/:slug', getBlogBySlug);

/**
 * @openapi
 * /api/blogs/{id}:
 *   put:
 *     summary: Update a blog post
 *     description: Modify details of an existing blog post. Admin only.
 *     tags:
 *       - Blogs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the blog to modify
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               published:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Blog post updated
 *       404:
 *         description: Blog post not found
 * 
 *   delete:
 *     summary: Delete a blog post
 *     description: Permanently deletes a blog post. Admin only.
 *     tags:
 *       - Blogs
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the blog to delete
 *     responses:
 *       204:
 *         description: Blog deleted successfully
 *       404:
 *         description: Blog post not found
 */
router.put('/:id', protect, validate(updateBlogSchema), updateBlog);
router.delete('/:id', protect, deleteBlog);
router.get('/:id', getBlogById);

export default router;
export { router as blogRouter };
