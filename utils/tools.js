const crypto = require('crypto');

function nowDate() {
  return Math.floor(Date.now() / 1000);
}

function uuid() {
  return Date.now().toString(16).slice(0, 6) + '-' + 
         Math.random().toString(16).slice(2, 8);
}

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

function getHash(params, appSecret) {
  const sortedParams = Object.keys(params)
    .filter(key => params[key] && key !== 'hash')
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  const stringSignTemp = sortedParams + appSecret;
  return md5(stringSignTemp);
}

module.exports = { nowDate, uuid, md5, getHash };