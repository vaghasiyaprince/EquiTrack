const { SmartAPI } = require('smartapi-javascript');
const { authenticator } = require('otplib');

let smartApiInstance = null;
let sessionExpiry = null;

const getAngelSession = async () => {
  const now = Date.now();

  // Reuse existing session if still valid
  if (smartApiInstance && sessionExpiry && now < sessionExpiry) {
    return smartApiInstance;
  }

  const smartApi = new SmartAPI({ api_key: process.env.ANGEL_API_KEY });

  const totpCode = authenticator.generate(process.env.ANGEL_TOTP_SECRET);

  await smartApi.generateSession(
    process.env.ANGEL_CLIENT_CODE,
    process.env.ANGEL_PIN,
    totpCode
  );

  smartApiInstance = smartApi;
  // Session valid till midnight per Angel One docs — refresh a bit earlier to be safe
  const midnight = new Date();
  midnight.setHours(23, 45, 0, 0);
  sessionExpiry = midnight.getTime();

  console.log('Angel One session established');
  return smartApiInstance;
};

module.exports = { getAngelSession };