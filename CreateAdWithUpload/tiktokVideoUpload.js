const axios = require('axios').default;

const AWS = require('aws-sdk');
const s3 = new AWS.S3({ signatureVersion: 'v4' });

const checkS3Object = async (key) => {
  try {
    await s3
      .headObject({ Bucket: process.env.CREATIVES_BUCKET, Key: key })
      .promise();
    return true;
  } catch (err) {
    return false;
  }
};

const getSignedS3Url = async (key) => {
  const url = await s3.getSignedUrl('getObject', {
    Bucket: process.env.CREATIVES_BUCKET,
    Key: key, //filename
    Expires: 60 * 60, //time to expire in seconds - 60 min
  });

  return url;
};

const uploadToTiktok = async (token, advertiserId, videoPath) => {
  console.log('Checking if object is available ', videoPath);

  const isPresent = await checkS3Object(videoPath);
  if (!isPresent) {
    return { error: true };
  }
  console.log('Getting Signed URL');
  const videoUrl = await getSignedS3Url(videoPath);
  console.log('Signed URL: ', videoUrl);

  const baseUrl = process.env.TKTOK_BUSNS_API_BASE_URL;

  const url = baseUrl + `file/video/ad/upload/`;
  console.log('Base URL: ', url);

  const headers = {
    'Access-Token': token,
    'Content-Type': 'application/json',
  };
  const _response = await axios.post(
    url,
    {
      advertiser_id: advertiserId,
      video_url: videoUrl,
      upload_type: 'UPLOAD_BY_URL',
      allow_download: true,
    },
    { headers }
  );
  return { data: _response.data, error: false };
};

const generateVideoThumbnail = async (token, advertiserId, videoId) => {
  let url =
    process.env.TKTOK_BUSNS_API_BASE_URL +
    `file/video/suggestcover/?advertiser_id=${advertiserId}&video_id=${videoId}`;
  console.log('Prepared url :', url);
  const headers = {
    'Access-Token': token,
    'Content-Type': 'application/json',
  };
  const _response = await axios.get(url, { headers });
  if (_response?.data?.data?.list?.length < 1) {
    throw new Error('No thumbnails found');
  }
  console.log(_response?.data);
  console.log(_response?.data?.data?.list);
  return _response?.data?.data?.list?.[0]?.id;
};

const getIdentityId = async (token, advertiserId) => {
  const url =
    process.env.TKTOK_BUSNS_API_BASE_URL +
    `identity/get/?advertiser_id=${advertiserId}`;
  console.log('Prepared url :', url);
  const headers = {
    'Access-Token': token,
    'Content-Type': 'application/json',
  };
  const _response = await axios.get(url, { headers });
  if (_response?.data?.data?.identity_list?.length < 0) {
    console.log('No identities found', _response?.data);
    return false;
  }
  for (let _identity of _response?.data?.data?.identity_list) {
    if (_identity?.display_name === 'CUSTOMIZED_USER') {
      return _identity?.identity_id;
    }
  }
  console.log('No identities found', _response?.data);
  return false;
};

const createAdWithVideoUpload = async (
  token,
  adGroupId,
  advertiserId,
  videoId,
  userProfileId
) => {

  console.log('getting video thumbnail');
  const imageId = await generateVideoThumbnail(token, advertiserId, videoId);
  console.log('video thumbnail id: ', imageId);
  const baseUrl = process.env.TKTOK_BUSNS_API_BASE_URL.replace('1.3', '1.2');
  const url = baseUrl + `ad/create/`;
  console.log('Prepared url :', url);
  const headers = {
    'Access-Token': token,
    'Content-Type': 'application/json',
  };
  const _response = await axios.post(
    url,
    {
      advertiser_id: advertiserId,
      adgroup_id: adGroupId,
      creatives: [
        {
          ad_name: '',
          display_name: 'DISPLAY_NAME',
          video_id: videoId,
          ad_format: 'SINGLE_VIDEO',
          ad_text: 'asd',
          image_ids: [imageId],
          item_duet_status: 'DISABLE',
          item_stitch_status: 'DISABLE',
        },
      ],
    },
    { headers }
  );
  console.log('Ad creation Response: ', _response.data);
  if (_response?.data?.message !== 'OK') {
    throw new Error('Error while creating ad', _response.data);
  }
  return {
    identity_id: 'VIDEO_UPLOAD',
    item_id: videoId,
    ad_id: '' + _response?.data?.data?.ad_ids?.[0],
    ad_group_id: adGroupId,
    campaing_id: 'NONE',
    advertiser_id: advertiserId,
    user_profile_id: userProfileId,
    accessToken: token,
    ad_report: '',
    status: 'ACTIVE',
  };
};

module.exports = { uploadToTiktok, createAdWithVideoUpload };
