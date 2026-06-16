import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { catchAsync } from '../utils/catchAsync';

export const getSettings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let settings = await prisma.agencySettings.findFirst();

  // Auto-initialize standard configuration if table is empty
  if (!settings) {
    settings = await prisma.agencySettings.create({
      data: {
        agencyName: 'KiwiClicks',
        logoUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
        phone: '6230078396',
        email: 'info@kiwiclicks.in',
        address: 'Dwarka Sector 2, New Delhi – 110077, India',
        mapsLink: 'https://maps.google.com',
        facebookLink: 'https://facebook.com/kiwiclicks',
        instagramLink: 'https://instagram.com/kiwiclicks',
        linkedinLink: 'https://linkedin.com/company/kiwiclicks',
        twitterLink: 'https://twitter.com/kiwiclicks',
      },
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      settings,
    },
  });
});

export const updateSettings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const {
    agencyName,
    logoUrl,
    phone,
    email,
    address,
    mapsLink,
    facebookLink,
    instagramLink,
    linkedinLink,
    twitterLink,
  } = req.body;

  let settings = await prisma.agencySettings.findFirst();

  if (!settings) {
    settings = await prisma.agencySettings.create({
      data: {
        agencyName,
        logoUrl,
        phone,
        email,
        address,
        mapsLink,
        facebookLink,
        instagramLink,
        linkedinLink,
        twitterLink,
      },
    });
  } else {
    settings = await prisma.agencySettings.update({
      where: { id: settings.id },
      data: {
        agencyName,
        logoUrl,
        phone,
        email,
        address,
        mapsLink,
        facebookLink,
        instagramLink,
        linkedinLink,
        twitterLink,
      },
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      settings,
    },
  });
});
