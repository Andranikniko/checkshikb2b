export const API_ENDPOINTS = {
  AUTHORIZE: 'https://9qmmmgbfl0.execute-api.eu-west-2.amazonaws.com/1/authorize',
  UPLOAD_LINK: 'https://9qmmmgbfl0.execute-api.eu-west-2.amazonaws.com/1/upload-link',
  REUPLOAD: 'https://hook.eu1.make.com/imcee7xibaq02ey4g48dqtrwb34hkma1',
  WEBHOOK_REUPLOAD: 'https://hook.eu1.make.com/vqqh9v2igoietowyrrxiowebjtcsg3w4',
  BASE_URL: process.env.REACT_APP_API_URL || 'https://your-api-url.com',
};

export const API_CREDENTIALS = {
  'client-id': 'da43ac39-bc25-4d96-ab55-fec86aef5a54',
  'client-secret': '8TUs6Ey8FwXQuA7X1vuJW2w2',
};


export const WEBHOOKS = {
  WEBHOOK_REUPLOAD: 'https://hook.eu1.make.com/vqqh9v2igoietowyrrxiowebjtcsg3w4',
  REUPLOAD: 'https://hook.eu1.make.com/imcee7xibaq02ey4g48dqtrwb34hkma1',
  PAYMENT_DETAILS: 'https://hook.eu1.make.com/gyqc8wfic57qpb63145m3czcfvf76dkt',
  CONFIRMATION_TOKEN: 'https://hook.eu1.make.com/25p2pjjxx50mlrk7r5duhx87tefreb8v',
  SUCCESS: 'https://hook.eu1.make.com/wokf5aociw1cxdl6e9uspijnbthxgi38',
};

export const CDN = {
  BASE_URL: 'https://drwrnzzt9lr9u.cloudfront.net',
  S3_BASE_URL: 'https://lg-photos-storage.s3.eu-west-2.amazonaws.com',
}; 
