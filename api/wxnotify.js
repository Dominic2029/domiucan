const { getHash } = require('../utils/tools');
// const db = require('../utils/database');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  try {
    const data = req.body;
    const APP_SECRET = process.env.XUNHU_APP_SECRET;

    console.log('收到支付回调:', {
      order_id: data.trade_order_id,
      status: data.status,
      time: new Date().toISOString()
    });

    // 验签
    const calculatedHash = getHash(data, APP_SECRET);
    if (data.hash !== calculatedHash) {
      console.error('验签失败:', data.trade_order_id);
      return res.status(200).send('success');
    }

    // 处理支付结果
    if (data.status === 'OD') {
      console.log('支付成功:', data.trade_order_id);
      
      // TODO: 更新数据库订单状态
      // const order = await db.getOrder(data.trade_order_id);
      // 
      // if (order && order.status === 'pending') {
      //   // 更新订单状态
      //   await db.updateOrder(data.trade_order_id, {
      //     status: 'paid',
      //     paid_at: new Date(),
      //     transaction_id: data.transaction_id
      //   });
      //   
      //   // 激活用户套餐
      //   await db.activateUserPackage({
      //     user_id: order.user_id,
      //     package_type: order.package_type,
      //     order_id: data.trade_order_id
      //   });
      //   
      //   console.log('订单处理完成:', data.trade_order_id);
      // } else {
      //   console.log('订单已处理，跳过:', data.trade_order_id);
      // }
      
    } else {
      console.log('支付未成功:', data);
      // TODO: 更新订单状态为失败
      // await db.updateOrder(data.trade_order_id, {
      //   status: 'failed',
      //   failed_reason: data.status
      // });
    }

    // 必须返回 success
    return res.status(200).send('success');

  } catch (error) {
    console.error('处理回调失败:', error);
    return res.status(200).send('success');
  }
}