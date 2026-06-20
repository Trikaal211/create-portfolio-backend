import './loadEnv';
import app from './app';

const dbUrl = process.env.DATABASE_URL || '';
const maskedUrl = dbUrl.replace(/(:\/\/)([^:]+)(:[^@]+)?@/, '$1$2:***@');
console.log(`[Runtime Config] DATABASE_URL at startup: ${maskedUrl}`);

// Production-safe startup checks
if (process.env.NODE_ENV === 'production') {
  if (!process.env.DATABASE_URL) {
    console.error('CRITICAL CONFIGURATION ERROR: DATABASE_URL is not defined in production!');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error('CRITICAL CONFIGURATION ERROR: JWT_SECRET is not defined in production!');
    process.exit(1);
  }
}

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`=================================================`);
  console.log(`KiwiClicks backend running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`HTTP Server listening on port: ${port}`);
  console.log(`Swagger API Docs: http://localhost:${port}/api-docs`);
  console.log(`=================================================`);
});

// Capture and log unhandled promise rejections outside route boundaries
process.on('unhandledRejection', (err: any) => {
  console.error('UNHANDLED REJECTION! 💥 Gracefully shutting down...');
  console.error(err.name || 'Error', err.message || err);
  server.close(() => {
    process.exit(1);
  });
});
