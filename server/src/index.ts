import express from 'express';
import cors from 'cors';
import { initializeDatabase, closeDatabase } from './database/db.js';
import helloRouter from './routes/hello.js';
import playerRouter from './routes/player.js';
import playersRouter from './routes/players.js';
import mapRouter from './routes/map.js';
import gachaRouter from './routes/gacha.js';
import encyclopediaRouter from './routes/encyclopedia.js';
import serversRouter from './routes/servers.js';

const app = express();
const port = 3000;

// Database initialization
try {
  initializeDatabase();
} catch (error) {
  console.error('[Error] データベースの初期化に失敗しました:', error);
  process.exit(1);
}

app.use(cors({
  exposedHeaders: ['X-Energy-Interval-Ms'],
}));

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Color Collector Server is running!');
});

app.use('/api/hello', helloRouter);
app.use('/api/player', playerRouter);
app.use('/api/players', playersRouter);
app.use('/api/map', mapRouter);
app.use('/api/gacha', gachaRouter);
app.use('/api/encyclopedia', encyclopediaRouter);
app.use('/api/servers', serversRouter);

const server = app.listen(port, () => {
  console.log('Server started:');
  console.log(`http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down gracefully...');
  server.close(() => {
    closeDatabase();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[Server] SIGINT received, shutting down gracefully...');
  server.close(() => {
    closeDatabase();
    process.exit(0);
  });
});