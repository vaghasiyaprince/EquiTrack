const { SmartAPI } = require('smartapi-javascript');
const { authenticator } = require('otplib');

let smartApiInstance = null;
let sessionExpiry = null;

const getAngelSession = async () => {
  const apiKey = process.env.ANGEL_API_KEY;
  const clientCode = process.env.ANGEL_CLIENT_CODE;
  const pin = process.env.ANGEL_PIN;
  const totpSecret = process.env.ANGEL_TOTP_SECRET;

  if (!apiKey || !clientCode || !pin || !totpSecret) {
    const error = new Error('Angel One credentials missing or incomplete in backend/.env (ANGEL_API_KEY, ANGEL_CLIENT_CODE, ANGEL_PIN, ANGEL_TOTP_SECRET)');
    error.code = 'ANGEL_CONFIG_MISSING';
    error.statusCode = 503;
    throw error;
  }

  const now = Date.now();

  // Reuse existing session if still valid
  if (smartApiInstance && sessionExpiry && now < sessionExpiry) {
    return smartApiInstance;
  }

  let totpCode;
  try {
    totpCode = authenticator.generate(totpSecret);
  } catch (err) {
    const error = new Error(`Invalid ANGEL_TOTP_SECRET: ${err.message}`);
    error.code = 'INVALID_TOTP_SECRET';
    error.statusCode = 400;
    throw error;
  }

  const smartApi = new SmartAPI({ api_key: apiKey });

  try {
    const sessionRes = await smartApi.generateSession(clientCode, pin, totpCode);

    if (sessionRes && sessionRes.status === false) {
      const error = new Error(sessionRes.message || 'Angel One session authentication failed');
      error.code = 'ANGEL_AUTH_FAILED';
      error.statusCode = 401;
      throw error;
    }

    smartApiInstance = smartApi;
    // Session valid till midnight per Angel One docs — refresh a bit earlier to be safe
    const midnight = new Date();
    midnight.setHours(23, 45, 0, 0);
    sessionExpiry = midnight.getTime();

    console.log('Angel One session established successfully');
    return smartApiInstance;
  } catch (error) {
    if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
      const netError = new Error('Weak internet connection or timeout contacting Angel One API');
      netError.code = 'WEAK_CONNECTION';
      netError.statusCode = 504;
      throw netError;
    }
    throw error;
  }
};

module.exports = { getAngelSession };