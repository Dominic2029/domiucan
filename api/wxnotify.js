const { getHash } = require('../utils/tools');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  try {
    const data = req.body;
    const APP_SECRET = process.env.XUNHU_APP_SECRET;

    console.log('收到支付回调:', {
      trade_order_id: data.trade_order_id,
      status: data.status,
      total_fee: data.total_fee,
      transaction_id: data.transaction_id,
      time: new Date().toISOString()
    });

    // 验签
    const calculatedHash = getHash(data, APP_SECRET);
    if (data.hash !== calculatedHash) {
      console.error('验签失败:', {
        received: data.hash,
        calculated: calculatedHash,
        order_id: data.trade_order_id
      });
      return res.status(200).send('success'); // 仍返回success避免重复通知
    }

    console.log('验签成功:', data.trade_order_id);

    // 处理支付结果
    if (data.status === 'OD') {
      // OD = 已支付
      console.log('支付成功:', {
        trade_order_id: data.trade_order_id,
        total_fee: data.total_fee,
        transaction_id: data.transaction_id
      });
      
      // 解析备注信息
      let attach = {};
      try {
        if (data.attach) {
          attach = JSON.parse(data.attach);
        }
      } catch (e) {
        console.error('解析attach失败:', e);
      }

      // TODO: 处理业务逻辑
      // 1. 查询数据库确认订单状态
      // 2. 更新订单为已支付
      // 3. 激活用户套餐
      // await db.updateOrder(data.trade_order_id, {
      //   status: 'paid',
      //   paid_at: new Date(),
      //   transaction_id: data.transaction_id,
      //   total_fee: data.total_fee
      // });
      // await db.activateUserPackage({
      //   order_id: data.trade_order_id,
      //   package_type: attach.package_type
      // });
      
    } else if (data.status === 'CD') {
      // CD = 已退款
      console.log('订单已退款:', data.trade_order_id);
      // TODO: 处理退款逻辑
      
    } else if (data.status === 'RD') {
      // RD = 退款中
      console.log('订单退款中:', data.trade_order_id);
      
    } else if (data.status === 'UD') {
      // UD = 退款失败
      console.log('订单退款失败:', data.trade_order_id);
      
    } else {
      console.log('未知订单状态:', data);
    }

    // 必须返回 'success' 让虎皮椒知道已收到通知
    return res.status(200).send('success');

  } catch (error) {
    console.error('处理回调失败:', error);
    // 即使出错也返回success，避免虎皮椒重复通知
    return res.status(200).send('success');
  }
}
