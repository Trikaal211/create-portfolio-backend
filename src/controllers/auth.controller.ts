import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { AppError } from '../utils/appError';
import { catchAsync } from '../utils/catchAsync';

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // 1) Verify payload inputs
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // 2) Retrieve admin and match hashed passwords
  const user = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) Create bearer JWT sign payload
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'kiwiclicks_jwt_secret_key_change_me_in_production_123456',
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
  );

  // Strip hashed password from return response
  const sanitizedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: sanitizedUser,
    },
  });
});

export const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
});
