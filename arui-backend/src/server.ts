import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/routes.js';
import profileRoutes from './modules/profile/routes.js';
import assessmentRoutes from './modules/assessment/routes.js';
import questionRoutes from './modules/questions/routes.js';
import institutionalDataRoutes from './modules/institutional-data/routes.js';
import evidenceRoutes from './modules/evidence/routes.js';
import assessorRoutes from './modules/assessor/routes.js';
import reportRoutes from './modules/reports/routes.js';
import methodologyRoutes from './modules/methodology/routes.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'arui-production-backend', timestamp: new Date().toISOString() });
});

// Mount Routes
app.use('/api/v1/auth', authRoutes);
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

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

export default app;
