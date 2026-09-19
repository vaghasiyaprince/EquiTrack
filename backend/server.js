const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '.env') });

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

const PORT = process.env.PORT || 5000;

const startServer = async(port = PORT) => {
  const server = app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
  });

  return server;
};

if (require.main === module) {
  connectDB().then(()=>{startServer()});
}

module.exports = { app, startServer };
