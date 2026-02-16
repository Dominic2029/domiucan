// const db = require('../utils/database');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { order_id } = req.query;

    if (!order_id) {
      return res.status(400).json({ 
        error: '缺少订单号' 
      });
    }

    // TODO: 从数据库查询订单
    // const order = await db.getOrder(order_id);
    // 
    // if (!order) {
    //   return res.status(404).json({
    //     success: false,
    //     error: '订单不存在'
    //   });
    // }
    //
    // return res.status(200).json({
    //   success: true,
    //   data: {
    //     order_id: order.order_id,
    //     status: order.status,
    //     amount: order.amount,
    //     package_type: order.package_type,
    //     created_at: order.created_at,
    //     paid_at: order.paid_at
    //   }
    // });

    // 临时返回示例数据
    return res.status(200).json({
      success: true,
      data: {
        order_id,
        status: 'pending',
        message: '数据库功能待实现'
      }
    });

  } catch (error) {
    console.error('查询订单失败:', error);
    return res.status(500).json({
      success: false,
      error: '查询订单失败'
    });
  }
}