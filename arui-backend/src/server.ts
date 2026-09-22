import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import authRoutes from './modules/auth/routes.js';
import profileRoutes from './modules/profile/routes.js';
import assessmentRoutes from './modules/assessment/routes.js';
import questionRoutes from './modules/questions/routes.js';
import institutionalDataRoutes from './modules/institutional-data/routes.js';
import evidenceRoutes from './modules/evidence/routes.js';
import assessorRoutes from './modules/assessor/routes.js';
import reportRoutes from './modules/reports/routes.js';
import methodologyRoutes from './modules/methodology/routes.js';
import dashboardRoutes from './modules/docs/dashboard.js';
import adminRoutes from './modules/admin/routes.js';
import benchmarkingRoutes from './modules/benchmarking/routes.js';
import entitlementRoutes from './modules/entitlements/routes.js';
import { getJwtSecret } from './middleware/auth.js';

dotenv.config();

// Fail startup if production and JWT_SECRET is absent
getJwtSecret();

const app = express();

// Parse allowed origins from environment
const rawCorsOrigin = process.env.CORS_ORIGIN || 'http://localhost:8080,http://localhost:5173,http://localhost:3000';
const allowedOrigins = rawCorsOrigin.split(',').map((o) => o.trim()).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // In development mode or test environments, allow tunnels and local development
      const isProd = process.env.NODE_ENV === 'production';
      if (!isProd) {
        if (
          origin.includes('localhost') ||
          origin.includes('127.0.0.1') ||
          origin.includes('trycloudflare.com') ||
          origin.includes('loca.lt') ||
          origin.includes('ngrok') ||
          origin.includes('vercel.app') ||
          /^http:\/\/(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(origin)
        ) {
          return callback(null, true);
        }
      }

      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }

      // Check for preview/subdomain deployments matching pattern
      const isAllowedSubdomain = allowedOrigins.some((allowed) => {
        if (allowed.startsWith('*.')) {
          const domain = allowed.slice(2);
          return origin.endsWith(domain);
        }
        return false;
      });
      if (isAllowedSubdomain) return callback(null, true);

      return callback(new Error(`CORS policy error: Origin ${origin} not allowed`));
    },
    credentials: true,
  })
);


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads directory relative to project root
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Interactive API Explorer & Dashboard on root
app.use('/docs', dashboardRoutes);
app.get('/', dashboardRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'arui-production-backend',
    version: '4.2.0',
    methodology: '11 Domains / 143 Metrics / 69 Cards / 63 Questions',
    timestamp: new Date().toISOString(),
  });
});

app.get(['/api/v1', '/api'], (req, res) => {
  res.json({
    status: 'active',
    version: '1.0.0',
    frameworks: ['ARUI (143 Metrics / 11 Domains)', 'ECRI (132 Metrics / 11 Dimensions)'],
    endpoints: {
      health: '/health',
      domains: '/api/v1/methodology/domains',
      metrics: '/api/v1/methodology/metrics',
      enquiries: '/api/v1/enquiries'
    }
  });
});

// Mount Production API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/v1', profileRoutes);
app.use('/', profileRoutes);

app.use('/api/v1', assessmentRoutes);
app.use('/', assessmentRoutes);

app.use('/api/v1', questionRoutes);
app.use('/', questionRoutes);

app.use('/api/v1', institutionalDataRoutes);
app.use('/', institutionalDataRoutes);

app.use('/api/v1', evidenceRoutes);
app.use('/', evidenceRoutes);

app.use('/api/v1', assessorRoutes);
app.use('/', assessorRoutes);

app.use('/api/v1', reportRoutes);
app.use('/', reportRoutes);

app.use('/api/v1', methodologyRoutes);
app.use('/', methodologyRoutes);

app.use('/api/v1', adminRoutes);
app.use('/', adminRoutes);

app.use('/api/v1/benchmarking', benchmarkingRoutes);
app.use('/benchmarking', benchmarkingRoutes);

app.use('/api/v1/entitlements', entitlementRoutes);
app.use('/entitlements', entitlementRoutes);

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

export default app;
