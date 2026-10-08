require('dotenv').config();
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/User');
const Watchlist = require('../models/Watchlist');

const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';
const TEST_NAME = 'Test Student';
let authToken = '';
let userId = '';

describe('EquiTrack Backend API Test Suite', () => {
  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/equitrackDB');
    }
    // Clean up any stale test user
    await User.deleteMany({ email: { $regex: /^test_/ } });
    await Watchlist.deleteMany({ userEmail: { $regex: /^test_/ } });
  });

  after(async () => {
    // Cleanup created test records
    await User.deleteMany({ email: { $regex: /^test_/ } });
    await Watchlist.deleteMany({ userEmail: { $regex: /^test_/ } });
    await mongoose.connection.close();
  });

  // 1. System Health Check
  describe('System Endpoints', () => {
    it('GET /health - Should return server health status 200 OK', async () => {
      const res = await request(app).get('/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.status, 'ok');
    });

    it('GET / - Should return running message', async () => {
      const res = await request(app).get('/');
      assert.strictEqual(res.status, 200);
      assert.match(res.text, /API is running/);
    });
  });

  // 2. User Authentication (R.1)
  describe('Authentication Module (R.1)', () => {
    it('POST /api/auth/register - Should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: TEST_NAME,
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.message, 'Registration successful');
      assert.ok(res.body.token, 'Token should be returned');
      assert.strictEqual(res.body.email, TEST_EMAIL);
      authToken = res.body.token;
      userId = res.body._id;
    });

    it('POST /api/auth/register - Should fail when registering duplicate email (409 Conflict)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: TEST_NAME,
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        });

      assert.strictEqual(res.status, 409);
      assert.match(res.body.message, /already registered/i);
    });

    it('POST /api/auth/register - Should fail when missing required fields (400 Bad Request)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'incomplete@example.com',
        });

      assert.strictEqual(res.status, 400);
    });

    it('POST /api/auth/login - Should login user successfully and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.message, 'Login successful');
      assert.ok(res.body.token);
      authToken = res.body.token; // Refresh token
    });

    it('POST /api/auth/login - Should fail with incorrect password (401 Unauthorized)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_EMAIL,
          password: 'wrong_password_xyz',
        });

      assert.strictEqual(res.status, 401);
      assert.match(res.body.message, /Invalid email or password/i);
    });

    it('GET /api/auth/profile - Should return 401 Unauthorized if no token provided', async () => {
      const res = await request(app).get('/api/auth/profile');
      assert.strictEqual(res.status, 401);
    });

    it('GET /api/auth/profile - Should return profile info when valid JWT bearer token provided', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.email, TEST_EMAIL);
      assert.strictEqual(res.body.name, TEST_NAME);
    });

    it('PUT /api/auth/profile - Should update profile name successfully', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Student Name',
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.name, 'Updated Student Name');
    });
  });

  // 3. Watchlist Management (R.3.2, R.3.3)
  describe('Watchlist Module (R.3)', () => {
    it('GET /api/watchlist - Should get user watchlist (empty initially)', async () => {
      const res = await request(app)
        .get('/api/watchlist')
        .set('Authorization', `Bearer ${authToken}`);

      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body));
    });

    it('POST /api/watchlist - Should add stock to watchlist', async () => {
      const res = await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          symbol: 'TCS-EQ',
          companyName: 'Tata Consultancy Services',
          exchange: 'NSE',
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.message, 'Stock added successfully');
      assert.strictEqual(res.body.item.symbol, 'TCS-EQ');
    });

    it('POST /api/watchlist - Should return 409 Conflict if stock already exists in watchlist', async () => {
      const res = await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          symbol: 'TCS-EQ',
          companyName: 'Tata Consultancy Services',
        });

      assert.strictEqual(res.status, 409);
      assert.match(res.body.message, /already in watchlist/i);
    });

    it('DELETE /api/watchlist/:symbol - Should remove stock from watchlist', async () => {
      const res = await request(app)
        .delete('/api/watchlist/TCS-EQ')
        .set('Authorization', `Bearer ${authToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.message, 'Stock removed successfully');
    });

    it('DELETE /api/watchlist/:symbol - Should return 404 Not Found if removing non-existent stock', async () => {
      const res = await request(app)
        .delete('/api/watchlist/NONEXISTENT-EQ')
        .set('Authorization', `Bearer ${authToken}`);

      assert.strictEqual(res.status, 404);
    });
  });

  // 4. Stock Details & Duration Validation (R.3.4)
  describe('Stock Chart & Duration Validation (R.3)', () => {
    it('GET /api/stocks/:symbol - Should return 401 Unauthorized without token', async () => {
      const res = await request(app).get('/api/stocks/RELIANCE-EQ?duration=1d');
      assert.strictEqual(res.status, 401);
    });

    it('GET /api/stocks/:symbol - Should fail with 400 when invalid duration is passed', async () => {
      const res = await request(app)
        .get('/api/stocks/RELIANCE-EQ?duration=invalid_duration')
        .set('Authorization', `Bearer ${authToken}`);

      assert.strictEqual(res.status, 400);
      assert.match(res.body.message, /5m, 1d, 1w, 1m/);
    });
  });
});
