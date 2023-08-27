const axios = require('axios').default;

const fetchAdGroups = async (token, advertiserId, campaignId) => {
  const apiUrl =
    process.env.TKTOK_BUSNS_API_BASE_URL +
    `adgroup/get/?advertiser_id=${advertiserId}&fields=%5B%22adgroup_id%22%2C%22adgroup_name%22%2C%22secondary_status%22%2C%22operation_status%22%5D&filtering={\"campaign_ids\":[\"${campaignId}\"]}`;
  const requestHeaders = {
    'Access-Token': token,
  };
  const response = await axios.get(apiUrl, { headers: requestHeaders });
  return response.data;
};

module.exports = { fetchAdGroups };
