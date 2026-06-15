import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KiwiClicks Digital Marketing Agency API',
      version: '1.0.0',
      description: 'REST API documentation for the KiwiClicks agency website and admin dashboard.',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token (Bearer token) to access protected administrative APIs.',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/routes/*.js', './src/app.ts', './src/app.js'],
};

export const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
