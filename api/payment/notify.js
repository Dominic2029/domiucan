/**
 * 支付回调通知 - Vercel Serverless Function
 * 路径: /api/payment/notify
 * 虎皮椒支付成功后会 POST 请求到此接口
 */

const md5 = require('md5');

function getHash(params, appSecret) {
  const sortedParams = Object.keys(params)
    .filter(key => params[key] && key !== 'hash')
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  const stringSignTemp = sortedParams + appSecret;
  const hash = md5(stringSignTemp);
  return hash;
}

function parseFormData(body) {
  if (!body) return {};
  
  if (typeof body === 'object') {
    return body;
  }
  
  const params = {};
  const pairs = body.split('&');
  
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=');
    const key = decodeURIComponent(pair[0] || '');
    const value = decodeURIComponent(pair[1] || '');
    
    if (key) {
      params[key] = value;
    }
  }
  
  return params;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Content-Type', 'text/plain');
    return res.status(405).send('Method not allowed');
  }

  try {
    let data = {};
    
    const contentType = req.headers['content-type'] || '';
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const body = await new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });
        req.on('end', () => {
          resolve(body);
        });
      });
      data = parseFormData(body);
    } else if (contentType.includes('application/json')) {
      data = req.body || {};
    } else {
      data = req.body || {};
    }
    
    const appSecret = process.env.HUPIJIAO_API_KEY || process.env.VITE_HUPIJIAO_API_KEY;

    if (!appSecret) {
      console.error('HUPIJIAO_API_KEY 未配置');
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send('success');
    }

    console.log('收到支付回调:', JSON.stringify(data, null, 2));

    const expectedHash = getHash(data, appSecret);
    if (data.hash !== expectedHash) {
      console.error('验签失败', {
        received: data.hash,
        expected: expectedHash,
        data: data,
      });
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send('success');
    }

    if (data.status === 'OD') {
      console.log('支付成功:', {
        trade_order_id: data.trade_order_id,
        total_fee: data.total_fee,
        transaction_id: data.transaction_id,
      });
    } else {
      console.log('支付未成功，状态:', data.status);
    }

    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send('success');
  } catch (error) {
    console.error('处理支付回调失败:', error);
    res.setHeader('Content-Type', 'text/plain');
    return res.status(200).send('success');
  }
}
