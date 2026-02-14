# 支付 API 集成指南

本项目支持多种支付方式，可以通过环境变量 `VITE_PAYMENT_PROVIDER` 切换。

## 支持的支付方式

1. **虎皮椒支付** (hupijiao) - 默认
2. **Stripe** (stripe) - 国际支付
3. **支付宝** (alipay) - 中国支付
4. **微信支付** (wechat) - 中国支付
5. **PayPal** (paypal) - 国际支付
6. **自定义支付** (custom) - 自定义接口

## 切换支付方式

在 `.env` 文件中设置：

```env
# 选择支付方式
VITE_PAYMENT_PROVIDER=hupijiao  # 可选: hupijiao | stripe | alipay | wechat | paypal | custom
```

## 各支付方式配置

### 1. 虎皮椒支付（默认）

```env
VITE_PAYMENT_PROVIDER=hupijiao
VITE_HUPIJIAO_MERCHANT_ID=your_merchant_id
VITE_HUPIJIAO_API_KEY=your_api_key
```

**实现文件**: `src/utils/payment.js`

### 2. Stripe 支付

```env
VITE_PAYMENT_PROVIDER=stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
VITE_STRIPE_SECRET_KEY=sk_test_xxx  # 仅后端使用，前端不需要
VITE_API_BASE_URL=https://your-api.com
```

**实现文件**: `src/utils/paymentStripe.js`

**特点**:
- 支持国际信用卡支付
- 需要后端支持（创建 Checkout Session）
- 安全性高，PCI 合规

**集成步骤**:
1. 在 Stripe Dashboard 创建账户
2. 获取 Publishable Key 和 Secret Key
3. 后端实现 `/api/payment/stripe/create-session` 接口
4. 后端实现 `/api/payment/stripe/status` 接口
5. 配置环境变量

### 3. 支付宝支付

```env
VITE_PAYMENT_PROVIDER=alipay
VITE_ALIPAY_APP_ID=your_app_id
VITE_ALIPAY_PRIVATE_KEY=your_private_key
VITE_ALIPAY_PUBLIC_KEY=alipay_public_key
VITE_API_BASE_URL=https://your-api.com
```

**实现文件**: `src/utils/paymentAlipay.js`

**特点**:
- 中国用户常用
- 支持手机网站支付、电脑网站支付
- 需要后端支持（签名和订单创建）

**集成步骤**:
1. 在支付宝开放平台创建应用
2. 获取 App ID、私钥、公钥
3. 后端实现 `/api/payment/alipay/create-order` 接口
4. 后端实现 `/api/payment/alipay/status` 接口
5. 配置环境变量

### 4. 微信支付

```env
VITE_PAYMENT_PROVIDER=wechat
VITE_WECHAT_APP_ID=your_app_id
VITE_WECHAT_MCH_ID=your_merchant_id
VITE_WECHAT_API_KEY=your_api_key
VITE_API_BASE_URL=https://your-api.com
```

**实现文件**: `src/utils/paymentWechat.js`

**特点**:
- 中国用户常用
- 支持 JSAPI 支付（微信内）、H5 支付、扫码支付
- 需要后端支持（统一下单）

**集成步骤**:
1. 在微信支付商户平台注册
2. 获取 App ID、商户号、API Key
3. 后端实现 `/api/payment/wechat/unified-order` 接口
4. 后端实现 `/api/payment/wechat/status` 接口
5. 配置环境变量

### 5. PayPal 支付

```env
VITE_PAYMENT_PROVIDER=paypal
VITE_PAYPAL_CLIENT_ID=your_client_id
VITE_PAYPAL_SECRET=your_secret  # 仅后端使用
VITE_API_BASE_URL=https://your-api.com
```

**实现文件**: `src/utils/paymentPaypal.js` (需创建)

**特点**:
- 国际支付
- 支持 PayPal 账户和信用卡
- 需要后端支持

### 6. 自定义支付

```env
VITE_PAYMENT_PROVIDER=custom
VITE_CUSTOM_PAYMENT_API_URL=https://your-payment-api.com
VITE_API_BASE_URL=https://your-api.com
```

**实现文件**: `src/utils/paymentCustom.js` (需创建)

## 实现新的支付方式

### 步骤 1: 创建支付实现文件

在 `src/utils/` 目录下创建新的支付文件，例如 `paymentCustom.js`:

```javascript
import { PACKAGES } from './payment'

/**
 * 创建支付订单
 */
export async function createPaymentOrder(packageType, returnUrl) {
  const packageInfo = PACKAGES[packageType]
  // 实现创建订单逻辑
  // 返回支付链接或支付参数
}

/**
 * 查询支付状态
 */
export async function queryPaymentStatus(orderId) {
  // 实现查询逻辑
  // 返回 { status: 'paid' | 'pending' | 'failed', ... }
}
```

### 步骤 2: 在适配器中添加

在 `src/utils/paymentAdapter.js` 中导入并添加：

```javascript
import { createPaymentOrder as customCreateOrder, queryPaymentStatus as customQueryStatus } from './paymentCustom'

// 在 createPaymentOrder 函数中添加:
case 'custom':
  return await customCreateOrder(packageType, returnUrl)

// 在 queryPaymentStatus 函数中添加:
case 'custom':
  return await customQueryStatus(orderId)
```

### 步骤 3: 配置环境变量

在 `.env` 文件中添加必要的配置。

## 后端接口要求

如果使用需要后端支持的支付方式（如 Stripe、支付宝、微信支付），需要实现以下接口：

### 通用接口

1. **创建支付订单**
   - 路径: `/api/payment/{provider}/create-order`
   - 方法: POST
   - 请求体: `{ packageType, amount, ... }`
   - 响应: `{ paymentUrl: string }` 或 `{ paymentParams: object }`

2. **查询支付状态**
   - 路径: `/api/payment/{provider}/status`
   - 方法: GET
   - 参数: `orderId` 或 `sessionId`
   - 响应: `{ status: string, ... }`

3. **支付回调通知**（可选，但推荐）
   - 路径: `/api/payment/{provider}/notify`
   - 方法: POST
   - 用途: 支付平台异步通知支付结果

## 安全注意事项

1. **敏感信息**: API Key、Secret Key 等敏感信息应仅在后端使用，不要暴露在前端
2. **签名验证**: 所有支付回调都应验证签名，防止伪造
3. **HTTPS**: 生产环境必须使用 HTTPS
4. **订单验证**: 支付成功后，后端应验证订单金额、状态等信息

## 测试

1. 使用支付平台的沙箱环境进行测试
2. 测试支付成功、失败、取消等场景
3. 测试支付回调通知
4. 测试支付状态查询

## 常见问题

### Q: 如何同时支持多种支付方式？

A: 可以在前端提供支付方式选择，然后动态调用对应的支付接口。

### Q: 支付回调如何处理？

A: 支付回调应在后端处理，验证签名后更新订单状态，前端通过轮询或 WebSocket 获取状态更新。

### Q: 如何实现支付退款？

A: 退款功能应在后端实现，调用支付平台的退款 API。

## 参考文档

- [Stripe 文档](https://stripe.com/docs)
- [支付宝开放平台](https://open.alipay.com/)
- [微信支付文档](https://pay.weixin.qq.com/)
- [PayPal 文档](https://developer.paypal.com/)
- [虎皮椒文档](https://www.xunhupay.com/)
