const axios = require('axios').default;

const fetchVideoDetails = async (token, advertiserId, authorizationCode) => {
  authorizationCode = authorizationCode.replace(/\+/g, '%2B').replace('#', '%23');
  const url =
    process.env.TKTOK_BUSNS_API_BASE_URL +
    `tt_video/info/?advertiser_id=${advertiserId}&auth_code=${authorizationCode}`;
  console.log(url);
  const headers = {
    'Access-Token': token,
    'Content-Type': 'application/json',
  };
  const _response = await axios.get(url, { headers });
  return _response.data;
};

module.exports = { fetchVideoDetails };
