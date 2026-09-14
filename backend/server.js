const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

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

const PORT = process.env.PORT || 5000;

const startServer = (port = PORT) => {
  const server = app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
  });

  return server;
};

if (require.main === module) {
  connectDB();
  startServer();
}

module.exports = { app, startServer };
