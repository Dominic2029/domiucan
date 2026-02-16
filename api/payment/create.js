/**
 * 创建支付订单 - Vercel Serverless Function
 * 路径: /api/payment/create
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

function generateOrderId() {
  return `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function uuid() {
  return Date.now().toString(16).slice(0, 6) + '-' + Math.random().toString(16).slice(2, 8);
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
    const { packageType, returnUrl } = req.body;

    const PACKAGES = {
      daily: { name: '单日套餐', price: 3 },
      weekly: { name: '周套餐', price: 7 },
      monthly: { name: '月套餐', price: 30 },
      lifetime: { name: '终身套餐', price: 100 },
    };

    const packageInfo = PACKAGES[packageType];
    if (!packageInfo) {
      console.error('无效的套餐类型:', packageType);
      return res.status(400).json({ error: '无效的套餐类型' });
    }

    const appid = process.env.HUPIJIAO_APPID || process.env.VITE_HUPIJIAO_MERCHANT_ID;
    const appSecret = process.env.HUPIJIAO_API_KEY || process.env.VITE_HUPIJIAO_API_KEY;

    console.log('支付配置:', { 
      appid,
      hasAppSecret: !!appSecret,
      env: process.env.NODE_ENV,
    });

    if (!appid || !appSecret) {
      console.error('支付配置未完成:', { 
        hasAppid: !!appid, 
        hasAppSecret: !!appSecret 
      });
      return res.status(500).json({ 
        error: '支付配置未完成，请配置 HUPIJIAO_APPID 和 HUPIJIAO_API_KEY' 
      });
    }

    const backendUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.BACKEND_URL || req.headers.origin || 'http://localhost:3000';

    const params = {
      version: '1.1',
      appid: appid,
      trade_order_id: generateOrderId(),
      total_fee: packageInfo.price.toFixed(2),
      title: packageInfo.name,
      time: nowDate(),
      notify_url: `${backendUrl}/api/payment/notify`,
      nonce_str: uuid(),
      type: 'WAP',
      wap_url: backendUrl,
      wap_name: 'Shopify AI 文章生成器',
    };

    const hash = getHash(params, appSecret);
    params.hash = hash;

    console.log('创建支付订单:', {
      orderId: params.trade_order_id,
      packageType,
      price: params.total_fee,
      params: params,
    });

    const requestParams = new URLSearchParams(params);
    
    console.log('请求虎皮椒 API:', {
      url: 'https://api.xunhupay.com/payment/do.html',
      method: 'POST',
      params: requestParams.toString(),
    });
    
    const response = await axios.post(
      'https://api.xunhupay.com/payment/do.html',
      requestParams.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      }
    );

    console.log('虎皮椒响应状态:', response.status);
    console.log('虎皮椒响应数据:', response.data);

    let data;
    if (typeof response.data === 'string') {
      try {
        data = JSON.parse(response.data);
      } catch (e) {
        console.error('解析虎皮椒响应失败:', response.data);
        data = { errcode: -1, errmsg: response.data };
      }
    } else {
      data = response.data;
    }

    if (data.errcode === 0 && data.url) {
      console.log('订单创建成功:', {
        orderId: params.trade_order_id,
        paymentUrl: data.url,
      });
      return res.status(200).json({
        success: true,
        url: data.url,
        orderId: params.trade_order_id,
      });
    } else {
      console.error('虎皮椒返回错误:', {
        errcode: data.errcode,
        errmsg: data.errmsg,
      });
      return res.status(400).json({
        success: false,
        error: data.errmsg || `创建订单失败 (错误码: ${data.errcode})`,
      });
    }
  } catch (error) {
    console.error('创建支付订单异常:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config?.url,
    });
    return res.status(500).json({
      success: false,
      error: error.message || '创建订单失败，请稍后重试',
    });
  }
}
