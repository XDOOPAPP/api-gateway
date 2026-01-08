export const gatewayConfig = () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://fepa:fepa123@rabbitmq:5672',
  },

  services: {
    auth: {
      host: process.env.AUTH_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.AUTH_SERVICE_PORT ?? '3001', 10),
    },
    expense: {
      host: process.env.EXPENSE_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.EXPENSE_SERVICE_PORT ?? '3002', 10),
    },
    budget: {
      host: process.env.BUDGET_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.BUDGET_SERVICE_PORT ?? '3003', 10),
    },
    blog: {
      host: process.env.BLOG_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.BLOG_SERVICE_PORT ?? '3004', 10),
    },
    subscription: {
      host: process.env.SUBSCRIPTION_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.SUBSCRIPTION_SERVICE_PORT ?? '3005', 10),
    },
    notification: {
      host: process.env.NOTIFICATION_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.NOTIFICATION_SERVICE_PORT ?? '3006', 10),
    },
    ocr: {
      host: process.env.OCR_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.OCR_SERVICE_PORT ?? '3007', 10),
    },
    ai: {
      host: process.env.AI_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.AI_SERVICE_PORT ?? '3008', 10),
    },
    payment: {
      host: process.env.PAYMENT_SERVICE_HOST || 'localhost',
      port: parseInt(process.env.PAYMENT_SERVICE_PORT ?? '3101', 10),
    },
  },

  jwt: {
    secret: process.env.JWT_SECRET, // No default - must be set in .env
    expiresIn: process.env.JWT_EXPIRATION || '24h',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS ?? '100', 10),
  },

  logging: {
    level: process.env.LOG_LEVEL || 'debug',
  },
});
