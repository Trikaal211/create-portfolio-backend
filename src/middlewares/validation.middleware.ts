import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { catchAsync } from '../utils/catchAsync';

export const validate = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'fail',
          message: 'Validation failed',
          errors: error.errors.map((err) => ({
            field: err.path.slice(1).join('.'), // Formats path, e.g. body.email -> email
            message: err.message,
          })),
        });
      }
      next(error);
    }
  });
};
