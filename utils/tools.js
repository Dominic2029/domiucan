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
  // 按照虎皮椒文档的签名算法
  const sortedParams = Object.keys(params)
    .filter(key => {
      // 过滤掉空值和hash本身
      const value = params[key];
      return value !== null && value !== undefined && value !== '' && key !== 'hash';
    })
    .sort() // 字典序排序
    .map(key => `${key}=${params[key]}`)
    .join('&');
    
  const stringSignTemp = sortedParams + appSecret;
  const hash = md5(stringSignTemp);
  
  // 调试用（生产环境可以删除）
  // console.log('签名字符串:', stringSignTemp);
  // console.log('签名结果:', hash);
  
  return hash;
}

module.exports = { nowDate, uuid, md5, getHash };
