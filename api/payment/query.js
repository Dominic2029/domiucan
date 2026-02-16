/**
 * 查询支付订单状态 - Vercel Serverless Function
 * 路径: /api/payment/query
 */

const md5 = require('md5');
const axios = require('axios');

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

function nowDate() {
  return Math.floor(new Date().valueOf() / 1000);
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: '订单号不能为空' });
    }

    const appid = process.env.HUPIJIAO_APPID || process.env.VITE_HUPIJIAO_MERCHANT_ID;
    const appSecret = process.env.HUPIJIAO_API_KEY || process.env.VITE_HUPIJIAO_API_KEY;

    console.log('查询支付配置:', { 
      appid,
      hasAppSecret: !!appSecret,
      orderId,
    });

    if (!appid || !appSecret) {
      return res.status(500).json({ 
        error: '支付配置未完成，请配置 HUPIJIAO_APPID 和 HUPIJIAO_API_KEY' 
      });
    }

    const params = {
      version: '1.1',
      lang: 'zh-cn',
      plugins: 'xunhupay',
      appid: appid,
      trade_order_id: orderId,
      time: nowDate(),
    };

    const hash = getHash(params, appSecret);
    params.hash = hash;

    const requestParams = new URLSearchParams(params);
    
    console.log('查询虎皮椒订单:', {
      url: 'https://api.xunhupay.com/payment/query.html',
      method: 'POST',
      params: requestParams.toString(),
    });
    
    const response = await axios.post(
      'https://api.xunhupay.com/payment/query.html',
      requestParams.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      }
    );

    console.log('虎皮椒查询响应状态:', response.status);
    console.log('虎皮椒查询响应数据:', response.data);

    let data;
    if (typeof response.data === 'string') {
      try {
        data = JSON.parse(response.data);
      } catch (e) {
        console.error('解析虎皮椒查询响应失败:', response.data);
        data = { errcode: -1, errmsg: response.data };
      }
    } else {
      data = response.data;
    }

    if (data.errcode === 0) {
      const status = data.status === 'OD' ? 'paid' : 'pending';
      return res.status(200).json({
        success: true,
        status,
        trade_order_id: data.trade_order_id,
        total_fee: data.total_fee,
        paid_at: data.paid_at || data.time,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: data.errmsg || `查询失败 (错误码: ${data.errcode})`,
      });
    }
  } catch (error) {
    console.error('查询支付订单失败:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config?.url,
    });
    return res.status(500).json({
      success: false,
      error: error.message || '查询订单失败，请稍后重试',
    });
  }
}
