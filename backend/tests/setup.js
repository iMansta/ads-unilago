require('dotenv').config({ path: '.env.test' });

process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/unilago-test';
process.env.NODE_ENV = 'test'; 