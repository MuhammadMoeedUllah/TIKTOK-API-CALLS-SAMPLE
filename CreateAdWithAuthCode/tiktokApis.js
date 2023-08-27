const axios = require('axios').default;

const createSparkAd = async (token, advertiserId, authorizationCode) => {
  const url = process.env.TKTOK_BUSNS_API_BASE_URL + `tt_video/authorize/`;
  console.log(url);
  const headers = {
    'Access-Token': token,
    'Content-Type': 'application/json',
  };
  const _response = await axios.post(
    url,
    {
      advertiser_id: advertiserId,
      auth_code: authorizationCode,
    },
    { headers }
  );
  return _response.data;
};

const findSparkAdItem = async (token, authorizationCode, advertiserId, pageNum) => {
  const url =
    process.env.TKTOK_BUSNS_API_BASE_URL +
    `tt_video/list/?advertiser_id=${advertiserId}&page_size=50&page=${pageNum}`;
  console.log(url);
  const headers = {
    'Access-Token': token,
  };
  const { data } = await axios.get(url, { headers });
  if (data?.code === 0 && data?.message === 'OK') {
    for (let _ad of data?.data?.list) {
      if (_ad?.item_info?.auth_code === authorizationCode) {
        return {
          item_id: _ad?.item_info?.item_id,
          identity_id: _ad?.user_info.identity_id,
        };
      }
    }
    return data?.data?.page_info;
  }
  throw new Error(
    `Listing Spark Ads returned an error: ${JSON.stringify(data)}`
  );
};

const isPageEndReached = (pageInfo) => {
  return pageInfo?.page < pageInfo?.total_page;
};

const createAdWithCampaign = async (token, adgroupId, advertiserId, adInfo) => {
  const url = process.env.TKTOK_BUSNS_API_BASE_URL + `ad/create/`;
  console.log(url);
  const headers = {
    'Access-Token': token,
    'Content-Type': 'application/json',
  };
  const _response = await axios.post(
    url,
    {
      advertiser_id: advertiserId,
      adgroup_id: adgroupId,
      creatives: [
        {
          identity_id: adInfo.identity_id,
          identity_type: 'AUTH_CODE',
          ad_name: '',
          tiktok_item_id: adInfo.item_id,
          ad_format: 'SINGLE_VIDEO',
          // "ad_text":"Testing",
          item_duet_status: 'DISABLE',
          item_stitch_status: 'DISABLE',
        },
      ],
    },
    { headers }
  );
  return _response.data;
};

const createAdvertisement = async (token, authorizationCode, advertiserId, adgroupId, userProfileId) => {
  console.log('Creating Spark Ad');
  const sparkAd = await createSparkAd(token, advertiserId, authorizationCode);
  console.log('Creating Spark Ad response', sparkAd);

  let currentPage = 1;
  if (sparkAd?.code !== 0 || sparkAd?.message !== 'OK') {
    throw new Error(
      `Creating Spark Ad returned Error ${JSON.stringify(sparkAd)}`
    );
  }
  console.log('Finding Spark Ad');
  let resp = await findSparkAdItem(token, authorizationCode, advertiserId, currentPage);
  while (!resp?.item_id) {
    if (isPageEndReached(resp)) {
      break;
    }
    currentPage += 1;
    resp = await findSparkAdItem(token, authorizationCode, advertiserId, currentPage);
  }
  if (!resp?.item_id) {
    throw new Error(
      `Listing Spark Ads didn't find any with authorizationCode: ${authorizationCode}`
    );
  }
  console.log('Finding Spark Ad Response ', resp);

  console.log('Creating Ad with GroupId');
  const adCreated = await createAdWithCampaign(token, adgroupId, advertiserId, resp);
  console.log('Creating Ad with GroupId response: ', adCreated);
  if (adCreated?.code !== 0 || adCreated?.message !== 'OK') {
    throw new Error(
      `Creating Ad With GroupId returned Error ${JSON.stringify(adCreated)}`
    );
  }
  return {
    identity_id: resp.identity_id,
    item_id: resp.item_id,
    ad_id: adCreated.data?.ad_ids?.[0],
    ad_group_id: adgroupId,
    campaign_id: adCreated.data?.creatives[0]?.campaign_id,
    advertiser_id: adCreated.data?.creatives[0]?.advertiser_id,
    user_profile_id: userProfileId,
    accessToken: token,
    ad_report: '',
    status: 'ACTIVE',
  };
};

module.exports = { createAdvertisement };
