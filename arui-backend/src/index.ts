import app from './server.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = parseInt(process.env.PORT || '4000', 10);

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 ARUI Production Backend Service is Running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`📋 API Base: http://localhost:${PORT}/api/v1`);
  console.log(`====================================================`);
});
