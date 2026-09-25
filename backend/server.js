const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// server.js - at the very top, before other requires

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/market', require('./routes/marketRoutes'));

const PORT = process.env.PORT || 5000;

const startServer = async (port = PORT) => {
  const server = app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
  });

  return server;
};

if (require.main === module) {
  connectDB().then(() => { startServer() });
}

module.exports = { app, startServer };
