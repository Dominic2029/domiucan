# 后端 API 文档

## 📋 概述

项目现在包含 **Node.js 后端 API**（使用 Vercel Serverless Functions），用于安全处理支付相关操作。

## 🗂️ 文件结构

```
api/
├── payment/
│   ├── create.js    # 创建支付订单接口
│   └── notify.js    # 支付回调通知接口
```

## 🔌 API 接口

### 1. 创建支付订单

**路径**: `POST /api/payment/create`

**请求体**:
```json
{
  "packageType": "monthly",  // daily | weekly | monthly | lifetime
  "returnUrl": "https://yourdomain.com/payment/result"
}
```

**响应**:
```json
{
  "success": true,
  "url": "https://api.xunhupay.com/payment/...",
  "orderId": "ORDER_1234567890_abc123"
}
```

**错误响应**:
```json
{
  "success": false,
  "error": "错误信息"
}
```

---

### 2. 支付回调通知

**路径**: `POST /api/payment/notify`

**说明**: 
- 此接口由虎皮椒支付平台调用（POST 请求，formData 格式）
- 支付成功后会自动调用此接口
- **必须返回 `success` 字符串**，否则虎皮椒会重试（最多6次）

**回调参数**（由虎皮椒提供）:
```
trade_order_id: 订单号
total_fee: 支付金额
transaction_id: 交易号
status: 支付状态（OD=已支付，WP=待支付）
hash: 签名
...其他参数
```

**响应**: 
- 成功: 返回字符串 `"success"`
- 错误: 也返回 `"success"`（避免虎皮椒重试）

---

## 🔐 环境变量配置

在 Vercel 项目设置中配置以下环境变量：

```env
# 虎皮椒支付配置（后端使用，不需要 VITE_ 前缀）
HUPIJIAO_APPID=your_merchant_id
HUPIJIAO_API_KEY=your_api_key

# 或者使用前端环境变量（兼容）
VITE_HUPIJIAO_MERCHANT_ID=your_merchant_id
VITE_HUPIJIAO_API_KEY=your_api_key

# 后端 URL（可选，自动检测）
BACKEND_URL=https://yourdomain.com
```

**注意**: 
- 后端环境变量**不需要** `VITE_` 前缀
- 如果同时配置了 `HUPIJIAO_*` 和 `VITE_HUPIJIAO_*`，优先使用 `HUPIJIAO_*`

---

## 🔄 工作流程

### 支付流程

1. **用户选择套餐** → 前端调用 `/api/payment/create`
2. **后端创建订单** → 调用虎皮椒 API，生成支付链接
3. **返回支付链接** → 前端跳转到虎皮椒支付页面
4. **用户完成支付** → 虎皮椒 POST 到 `/api/payment/notify`
5. **后端处理回调** → 验证签名，更新订单状态
6. **用户跳转回网站** → 跳转到 `returnUrl`（`/payment/result`）

---

## 🛠️ 本地开发

### 使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 在项目目录运行
vercel dev
```

### 直接测试 API

```bash
# 测试创建订单接口
curl -X POST http://localhost:3000/api/payment/create \
  -H "Content-Type: application/json" \
  -d '{"packageType":"monthly","returnUrl":"http://localhost:3000/payment/result"}'
```

---

## 📝 代码说明

### 签名生成

```javascript
function getHash(params, appSecret) {
  const sortedParams = Object.keys(params)
    .filter(key => params[key] && key !== 'hash')
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  const stringSignTemp = sortedParams + appSecret;
  return md5(stringSignTemp);
}
```

### 回调验证

```javascript
// 验证签名
const expectedHash = getHash(data, appSecret);
if (data.hash !== expectedHash) {
  console.error('验签失败');
  return res.status(200).send('success'); // 仍返回 success
}

// 处理支付成功
if (data.status === 'OD') {
  // TODO: 更新订单状态、激活套餐等
}
```

---

## ⚠️ 注意事项

1. **回调接口必须返回 `success`**: 即使验签失败或处理出错，也要返回 `success`，否则虎皮椒会重试
2. **防重复处理**: 在回调处理中应该检查订单是否已处理，避免重复处理
3. **日志记录**: 建议记录所有回调日志，便于排查问题
4. **数据库操作**: 实际项目中应该在回调中更新数据库订单状态

---

## 🚀 部署到 Vercel

1. 推送代码到 Git 仓库
2. 在 Vercel 中导入项目
3. 配置环境变量（见上方）
4. 部署

Vercel 会自动识别 `api/` 目录下的 Serverless Functions。

---

## 📚 相关文件

- `api/payment/create.js` - 创建支付订单接口
- `api/payment/notify.js` - 支付回调接口
- `src/utils/payment.js` - 前端支付工具函数（已改为调用后端 API）
