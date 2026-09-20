require('dotenv').config();
const { getAngelSession } = require('./utils/angelClient');

const test = async () => {
  const smartApi = await getAngelSession();
  const instanceMethods = Object.getOwnPropertyNames(smartApi);
  console.log(instanceMethods);
};

test();