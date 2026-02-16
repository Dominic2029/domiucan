const axios = require('axios');
const { nowDate, uuid, getHash } = require('../utils/tools');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { order_id, money, title, package_type, return_url } = req.body;

    // 参数校验
    if (!order_id || !money || !title || !package_type) {
      return res.status(400).json({ 
        error: '缺少必要参数' 
      });
    }

    // 验证金额是否合法
    const amount = parseFloat(money);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ 
        error: '无效的金额' 
      });
    }

    // 从环境变量获取配置
    const APPID = process.env.XUNHU_APPID;
    const APP_SECRET = process.env.XUNHU_APP_SECRET;
    
    if (!APPID || !APP_SECRET) {
      console.error('虎皮椒配置缺失');
      return res.status(500).json({ 
        error: '支付服务配置错误，请联系管理员' 
      });
    }

    const BASE_URL = process.env.BASE_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    // 构建支付参数（严格按照虎皮椒文档）
    const params = {
      version: '1.1',
      appid: APPID,
      trade_order_id: order_id,
      total_fee: amount.toFixed(2),
      title: title,
      time: nowDate(),
      notify_url: `${BASE_URL}/api/wxnotify`,
      return_url: return_url || `${BASE_URL}/payment/result?order_id=${order_id}`,
      nonce_str: uuid(),
      plugins: 'aiblogtoearn',
      attach: JSON.stringify({ package_type, order_id }),
    };

    // 生成签名
    const hash = getHash(params, APP_SECRET);

    // 发送支付请求
    const requestParams = new URLSearchParams({
      ...params,
      hash,
    });

    console.log('发起支付请求:', { 
      order_id, 
      amount, 
      title,
      notify_url: params.notify_url,
      return_url: params.return_url
    });

    const response = await axios.post(
      'https://api.xunhupay.com/payment/do.html',
      requestParams,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      }
    );

    console.log('虎皮椒响应:', response.data);

    // 检查虎皮椒返回结果
    if (response.data.errcode !== 0) {
      console.error('虎皮椒返回错误:', response.data);
      return res.status(500).json({
        success: false,
        error: response.data.errmsg || '创建支付订单失败',
      });
    }

    // 验证返回签名
    const returnHash = getHash(response.data, APP_SECRET);
    if (returnHash !== response.data.hash) {
      console.error('返回签名验证失败');
      return res.status(500).json({
        success: false,
        error: '支付响应签名验证失败',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        url: response.data.url,
        url_qrcode: response.data.url_qrcode,
        order_id: order_id,
      },
    });

  } catch (error) {
    console.error('支付请求失败:', error.message);
    if (error.response) {
      console.error('错误响应:', error.response.data);
    }
    return res.status(500).json({
      success: false,
      error: '支付服务暂时不可用，请稍后重试',
    });
  }
};
