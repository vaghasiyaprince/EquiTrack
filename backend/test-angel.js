require('dotenv').config();
console.log('API_KEY:', process.env.ANGEL_API_KEY ? 'loaded' : 'MISSING');
console.log('CLIENT_CODE:', process.env.ANGEL_CLIENT_CODE ? 'loaded' : 'MISSING');
console.log('PIN:', process.env.ANGEL_PIN ? 'loaded' : 'MISSING');
console.log('TOTP_SECRET:', process.env.ANGEL_TOTP_SECRET ? 'loaded' : 'MISSING');

const { getAngelSession } = require('./utils/angelClient');

const test = async () => {
  try {
    const smartApi = await getAngelSession();
    const profile = await smartApi.getProfile();
    console.log(profile);
  } catch (error) {
    console.error('Angel One login failed:', error.message);
  }
};

test();