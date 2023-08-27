const axios = require('axios').default;

const listCampaigns = async (token, advId) => {
  const url =
    process.env.TKTOK_BUSNS_API_BASE_URL +
    `campaign/get/?advertiser_id=${advId}&fields=%5B%22campaign_name%22%2C%22advertiser_id%22%5D&filtering={\"primary_status\":\"STATUS_DELIVERY_OK\"}`;
  const headers = {
    'Access-Token': token,
  };
  const _response = await axios.get(url, { headers });
  return _response.data;
};

module.exports = { listCampaigns };
