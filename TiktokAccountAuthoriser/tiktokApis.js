const axios = require('axios').default;

const exchangeAuthorizationCode = async (authorizationCode) => {
  let requestData = {
    app_id: process.env.TKTOK_APP_ID,
    auth_code: authorizationCode,
    secret: process.env.TKTOK_SECRET,
  };
  const apiUrl = process.env.TKTOK_BUSNS_API_ACCESS_ENDPOINT;
  const requestHeaders = {
    'User-Agent': 'PostmanRuntime/7.31.3',
    Accept: '*/*',
    'Content-Type': 'application/json',
    Connection: 'keep-alive',
  };
  const response = await axios.post(apiUrl, requestData, { headers: requestHeaders });
  console.log('TikTok API response: ', response?.data);
  return {
    access_token: response?.data?.data?.access_token,
    advertiser_id: response?.data?.data?.advertiser_ids?.[0] || '',
  };
};

module.exports = { exchangeAuthorizationCode };
