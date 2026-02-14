# Shopify AI 文章生成器

生产级 Shopify AI 文章生成器，支持 AI 文章生成、编辑、发布到 Shopify 博客，以及社媒分享功能。

## 功能特性

- ✨ **AI 文章生成**：基于 DeepSeek API 智能生成营销文章
- 🛍️ **Shopify 集成**：OAuth 授权，支持产品选择和文章发布
- 📝 **富文本编辑**：功能强大的富文本编辑器，支持图片上传、格式化等
- 💳 **支付鉴权**：集成虎皮椒支付，支持多种套餐选择
- 📱 **社媒分享**：支持 Facebook、Twitter、Instagram、LinkedIn 分享（需配置）
- 🎨 **现代化 UI**：基于 Tailwind CSS 的响应式设计

## 技术栈

- **前端框架**：React 18（函数式组件 + Hook）
- **路由**：React Router v6
- **样式**：Tailwind CSS v3
- **网络请求**：Axios
- **状态管理**：React Context + useReducer
- **富文本编辑**：react-quill
- **构建工具**：Vite
- **部署平台**：Vercel

## 环境变量配置

在项目根目录创建 `.env` 文件（参考 `.env.example`），配置以下环境变量：

```env
# Shopify 配置
VITE_SHOPIFY_CLIENT_ID=your_shopify_client_id

# DeepSeek API 配置
VITE_DEEPSEEK_DEFAULT_KEY=your_deepseek_api_key

# 虎皮椒支付配置
VITE_HUPIJIAO_MERCHANT_ID=your_merchant_id
VITE_HUPIJIAO_API_KEY=your_api_key

# API 基础地址（后端代理接口，可选）
VITE_API_BASE_URL=https://api.example.com

# 第三方编辑工具 URL（可选）
VITE_THIRD_PARTY_EDITOR_URL=https://editor.example.com

# 支付方式选择（可选，默认: hupijiao）
# 可选值: hupijiao | stripe | alipay | wechat | paypal | custom
VITE_PAYMENT_PROVIDER=hupijiao
```

### 环境变量说明

- `VITE_SHOPIFY_CLIENT_ID`：Shopify App 的 Client ID（在 Shopify Partners 后台创建 App 后获取）
- `VITE_DEEPSEEK_DEFAULT_KEY`：DeepSeek API Key（系统默认使用，用户也可配置自定义 Key）
- `VITE_HUPIJIAO_MERCHANT_ID`：虎皮椒商户 ID
- `VITE_HUPIJIAO_API_KEY`：虎皮椒 API Key
- `VITE_API_BASE_URL`：后端代理接口地址（如无后端可留空，代码中已包含模拟数据）
- `VITE_THIRD_PARTY_EDITOR_URL`：第三方编辑工具 URL（可选）

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填入相应的配置值。

### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动。

### 4. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

## Vercel 部署

### 1. 准备工作

- 确保项目已推送到 Git 仓库（GitHub、GitLab 或 Bitbucket）
- 在 Vercel 官网注册账号并连接 Git 仓库

### 2. 部署步骤

1. 登录 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 选择你的 Git 仓库
4. 配置项目：
   - **Framework Preset**：选择 "Vite"
   - **Root Directory**：`./`（默认）
   - **Build Command**：`npm run build`
   - **Output Directory**：`dist`
5. 配置环境变量：
   - 在项目设置中添加所有必需的环境变量（见上方环境变量配置）
   - **注意**：Vercel 中环境变量名需以 `VITE_` 开头
6. 点击 "Deploy" 开始部署

### 3. 自定义域名

1. 在 Vercel 项目设置中进入 "Domains"
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录
4. 等待 DNS 生效（通常几分钟到几小时）

### 4. vercel.json 配置

项目已包含 `vercel.json` 配置文件，用于处理 React Router 的刷新 404 问题：

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## Shopify App 创建与授权配置

### 1. 创建 Shopify App

1. 登录 [Shopify Partners](https://partners.shopify.com)
2. 进入 "Apps" → "Create app"
3. 选择 "Create app manually"
4. 填写 App 信息：
   - App name：你的应用名称
   - App URL：`https://your-domain.com`（部署后的域名）
   - Allowed redirection URL(s)：`https://your-domain.com/settings?shopify_callback=1`
5. 创建完成后，记录 **Client ID**（用于环境变量）

### 2. 配置 OAuth Scopes

在 App 设置中，确保以下 Scopes 已启用：
- `read_products`：读取产品信息
- `write_blogs`：写入博客文章

### 3. 授权流程

1. 用户在设置页面输入 Shopify 店铺域名
2. 点击"授权 Shopify"按钮
3. 跳转到 Shopify 授权页面
4. 用户确认授权后，回调到应用
5. 应用获取 Access Token 并保存

**注意**：当前代码中的 Shopify OAuth 流程为模拟实现，实际使用时需替换为真实的 OAuth Token 交换接口。

## 支付方式配置

项目支持多种支付方式，可以通过环境变量 `VITE_PAYMENT_PROVIDER` 切换。

### 支持的支付方式

- **虎皮椒支付** (hupijiao) - 默认，适合中国用户
- **Stripe** (stripe) - 国际支付，支持信用卡
- **支付宝** (alipay) - 中国用户常用
- **微信支付** (wechat) - 中国用户常用
- **PayPal** (paypal) - 国际支付
- **自定义支付** (custom) - 自定义接口

详细集成说明请参考 [PAYMENT_INTEGRATION.md](./PAYMENT_INTEGRATION.md)

### 虎皮椒支付对接说明

### 1. 注册虎皮椒账号

1. 访问 [虎皮椒官网](https://www.xunhupay.com)
2. 注册商户账号
3. 完成实名认证
4. 获取 **商户 ID** 和 **API Key**

### 2. 配置环境变量

将获取的商户 ID 和 API Key 配置到环境变量中。

### 3. 支付流程

1. 用户选择套餐并点击"立即购买"
2. 调用虎皮椒创建订单接口
3. 跳转到虎皮椒支付页面
4. 用户完成支付后，回调到支付结果页
5. 前端轮询查询支付状态
6. 支付成功后，存储支付 Token 并激活套餐

**注意**：当前代码中的支付接口为模拟实现，实际使用时需替换为真实的虎皮椒 API 调用。

### 4. 支付回调配置

在虎皮椒商户后台配置支付回调 URL：
- **Notify URL**：`https://your-domain.com/api/payment/notify`（需后端支持）
- **Return URL**：`https://your-domain.com/payment/result`

## 套餐配置

系统支持以下套餐类型：

- **单日套餐**：3 元，有效期 24 小时
- **周套餐**：7 元，有效期 7 天
- **月套餐**：30 元，有效期 30 天
- **终身套餐**：100 元，有效期永久

套餐配置位于 `src/utils/payment.js` 中的 `PACKAGES` 对象，可根据需要修改。

## 代码结构

```
src/
├── components/          # 通用组件
│   ├── Button.jsx       # 按钮组件
│   ├── Layout.jsx      # 布局组件
│   ├── Modal.jsx       # 模态框组件
│   ├── ProductSelector.jsx  # 产品选择器
│   ├── ProtectedRoute.jsx   # 路由保护
│   └── RichTextEditor.jsx   # 富文本编辑器
├── context/            # 全局状态管理
│   └── AppContext.jsx  # App 上下文
├── pages/              # 页面组件
│   ├── Generator.jsx   # 文章生成器首页
│   ├── Payment.jsx     # 支付页面
│   ├── PaymentResult.jsx  # 支付结果页
│   └── Settings.jsx    # 设置页面
├── utils/              # 工具函数
│   ├── axios.js        # Axios 配置
│   ├── deepseek.js     # DeepSeek API
│   ├── payment.js      # 支付相关
│   └── shopify.js      # Shopify API
├── App.jsx             # 根组件
├── main.jsx            # 入口文件
└── index.css           # 全局样式
```

## 接口替换说明

代码中包含多处 `TODO` 注释，标注了需要替换为真实接口的位置：

1. **Shopify OAuth Token 交换**：`src/pages/Settings.jsx` 中的 `handleShopifyCallback` 函数
2. **Shopify 产品列表获取**：`src/utils/shopify.js` 中的 `fetchShopifyProducts` 函数
3. **Shopify 文章发布**：`src/utils/shopify.js` 中的 `publishToShopifyBlog` 函数
4. **虎皮椒支付接口**：`src/utils/payment.js` 中的 `createPaymentOrder` 和 `queryPaymentStatus` 函数
5. **社媒授权接口**：`src/pages/Settings.jsx` 中的 `handleSocialMediaAuth` 函数

所有模拟数据均已标注，替换时请参考注释说明。

## 常见问题

### 1. 环境变量不生效

- 确保环境变量名以 `VITE_` 开头
- 修改环境变量后需重启开发服务器
- Vercel 部署时需在项目设置中配置环境变量

### 2. 路由刷新 404

- 确保 `vercel.json` 配置正确
- Vercel 会自动处理，无需额外配置

### 3. 支付回调失败

- 检查虎皮椒回调 URL 配置
- 确保后端接口正常（如使用模拟数据可忽略）

### 4. Shopify 授权失败

- 检查 Client ID 是否正确
- 确认回调 URL 与 Shopify App 配置一致
- 检查 OAuth Scopes 是否已启用

## 开发注意事项

1. **API Key 安全**：不要将 API Key 提交到 Git 仓库，使用环境变量管理
2. **支付安全**：支付相关接口需在后端实现，前端仅做展示和状态查询
3. **Token 存储**：敏感信息使用 Cookie 存储，非敏感信息使用 localStorage
4. **错误处理**：所有接口调用都需包含错误处理逻辑
5. **用户体验**：所有异步操作需显示加载状态，避免用户重复操作

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue 或联系开发者。
