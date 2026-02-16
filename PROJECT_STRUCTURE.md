# 项目结构文档

## 📋 技术栈和语言

### 核心技术
- **前端框架**: React 18.2.0 (函数式组件 + Hooks)
- **路由**: React Router v6.20.0
- **构建工具**: Vite 5.0.8
- **样式**: Tailwind CSS 3.3.6
- **语言**: JavaScript (ES6+)

### 主要依赖
- **网络请求**: axios 1.6.2
- **加密**: crypto-js 4.2.0 (MD5 签名)
- **日期处理**: dayjs 1.11.10
- **Cookie 管理**: js-cookie 3.0.5
- **JWT 解码**: jwt-decode 4.0.0
- **URL 参数**: qs 6.11.2
- **富文本编辑**: react-quill 2.0.0

### 开发工具
- **TypeScript 类型**: @types/react, @types/react-dom
- **CSS 处理**: PostCSS, Autoprefixer
- **Vite 插件**: @vitejs/plugin-react

---

## 📁 文件结构

```
aiblogtoearn/
├── dist/                          # 构建输出目录
│   └── assets/                    # 打包后的静态资源
│
├── node_modules/                  # 依赖包
│
├── src/                           # 源代码目录
│   ├── components/               # 可复用组件
│   │   ├── Button.jsx            # 按钮组件
│   │   ├── Layout.jsx            # 布局组件（导航栏、侧边栏）
│   │   ├── Modal.jsx             # 模态框组件
│   │   ├── ProductSelector.jsx   # 产品选择器组件
│   │   ├── ProtectedRoute.jsx   # 路由保护组件（支付验证）
│   │   └── RichTextEditor.jsx    # 富文本编辑器组件
│   │
│   ├── context/                  # React Context 状态管理
│   │   └── AppContext.jsx        # 全局状态管理（支付、Shopify、AI配置）
│   │
│   ├── pages/                    # 页面组件
│   │   ├── Generator.jsx         # 文章生成页面（主页面）
│   │   ├── Payment.jsx          # 支付页面
│   │   ├── PaymentResult.jsx     # 支付结果页面
│   │   └── Settings.jsx          # 设置页面（Shopify授权、AI配置）
│   │
│   ├── utils/                    # 工具函数
│   │   ├── axios.js              # Axios 实例配置
│   │   ├── deepseek.js           # DeepSeek AI API 调用
│   │   ├── payment.js            # 虎皮椒支付核心实现
│   │   ├── paymentAdapter.js     # 支付适配器（支持多种支付方式）
│   │   ├── paymentAlipay.js     # 支付宝支付实现（示例）
│   │   ├── paymentStripe.js      # Stripe 支付实现（示例）
│   │   ├── paymentWechat.js      # 微信支付实现（示例）
│   │   └── shopify.js            # Shopify API 调用
│   │
│   ├── App.jsx                   # 根组件（路由配置）
│   ├── main.jsx                  # 应用入口文件
│   └── index.css                 # 全局样式
│
├── .env                          # 环境变量（不提交到 Git）
├── .env.example                  # 环境变量模板
├── .gitignore                    # Git 忽略文件
│
├── index.html                    # HTML 入口文件
├── package.json                  # 项目配置和依赖
├── package-lock.json             # 依赖锁定文件
│
├── vite.config.js                # Vite 构建配置
├── tailwind.config.js            # Tailwind CSS 配置
├── postcss.config.js             # PostCSS 配置
│
├── vercel.json                   # Vercel 部署配置
│
├── README.md                      # 项目说明文档
├── QUICKSTART.md                  # 快速开始指南
└── PAYMENT_INTEGRATION.md         # 支付集成文档
```

---

## 🎨 前端页面对应文件

### 1. **文章生成页面** (`/generator`)
**文件**: `src/pages/Generator.jsx`

**主要功能**:
- AI 文章生成（基于 DeepSeek API）
- 产品选择（从 Shopify 获取产品列表）
- 富文本编辑（使用 react-quill）
- 文章发布到 Shopify 博客
- 自动保存草稿

**关键代码**:
```javascript
// 状态管理
const [prompt, setPrompt] = useState('')              // 提示词输入
const [selectedProducts, setSelectedProducts] = useState([])  // 选中的产品
const [generatedContent, setGeneratedContent] = useState('')  // 生成的文章
const [isGenerating, setIsGenerating] = useState(false)       // 生成中状态
const [isEditing, setIsEditing] = useState(false)             // 编辑模式
const [isPublishing, setIsPublishing] = useState(false)       // 发布中状态

// 核心功能
- handleGenerate()      // 调用 DeepSeek API 生成文章
- handleProductSelect() // 选择产品并追加到提示词
- handlePublish()       // 发布文章到 Shopify
```

**使用的组件**:
- `ProductSelector` - 产品选择器
- `RichTextEditor` - 富文本编辑器
- `Modal` - 模态框
- `Button` - 按钮

**使用的工具函数**:
- `generateArticle()` - 从 `utils/deepseek.js`
- `publishToShopifyBlog()` - 从 `utils/shopify.js`

---

### 2. **支付页面** (`/payment`)
**文件**: `src/pages/Payment.jsx`

**主要功能**:
- 显示套餐列表（单日、周、月、终身）
- 创建支付订单
- 跳转到虎皮椒支付页面
- 环境变量配置检查

**关键代码**:
```javascript
// 状态管理
const [loadingPackage, setLoadingPackage] = useState(null)  // 加载中的套餐
const [configError, setConfigError] = useState(null)          // 配置错误提示

// 核心功能
- handlePurchase()  // 创建支付订单并跳转
- useEffect()        // 检查支付配置（环境变量）
```

**使用的工具函数**:
- `createPaymentOrder()` - 从 `utils/paymentAdapter.js`
- `PACKAGES` - 套餐配置

**路由**: 无需支付验证即可访问

---

### 3. **支付结果页面** (`/payment/result`)
**文件**: `src/pages/PaymentResult.jsx`

**主要功能**:
- 接收支付回调参数
- 查询支付状态（轮询）
- 处理支付成功/失败
- 更新全局支付状态

**关键代码**:
```javascript
// 状态管理
const [status, setStatus] = useState('checking')  // checking | success | failed
const [orderId, setOrderId] = useState(null)
const [packageType, setPackageType] = useState(null)

// 核心功能
- checkPaymentStatus()  // 轮询查询支付状态
- useEffect()           // 从 URL 参数获取订单信息
```

**使用的工具函数**:
- `queryPaymentStatus()` - 从 `utils/paymentAdapter.js`
- `handlePaymentSuccess()` - 从 `utils/payment.js`

**路由**: 无需支付验证即可访问

---

### 4. **设置页面** (`/settings`)
**文件**: `src/pages/Settings.jsx`

**主要功能**:
- Shopify OAuth 授权
- 社媒授权（Facebook、Twitter、Instagram、LinkedIn）
- AI API Key 配置和测试
- 产品列表预览

**关键代码**:
```javascript
// 状态管理
const [shopDomain, setShopDomain] = useState('')           // Shopify 店铺域名
const [shopifyLoading, setShopifyLoading] = useState(false) // 授权加载状态
const [customApiKey, setCustomApiKey] = useState('')        // 自定义 API Key
const [apiKeyTestResult, setApiKeyTestResult] = useState(null) // API Key 测试结果

// 核心功能
- handleShopifyAuth()        // 跳转到 Shopify 授权页面
- handleShopifyCallback()     // 处理 Shopify 授权回调
- handleSocialMediaAuth()     // 社媒授权（模拟）
- handleTestApiKey()          // 测试 DeepSeek API Key
```

**使用的工具函数**:
- `generateShopifyAuthUrl()` - 从 `utils/shopify.js`
- `extractShopifyCallback()` - 从 `utils/shopify.js`
- `fetchShopifyProducts()` - 从 `utils/shopify.js`
- `testApiKey()` - 从 `utils/deepseek.js`

**路由**: 需要支付验证（ProtectedRoute）

---

## 🔧 核心组件说明

### 1. **Layout 组件** (`src/components/Layout.jsx`)
- 顶部导航栏
- 侧边栏（显示支付状态）
- 页面布局容器

### 2. **ProtectedRoute 组件** (`src/components/ProtectedRoute.jsx`)
- 路由保护
- 检查支付状态
- 未支付时重定向到支付页面

### 3. **AppContext** (`src/context/AppContext.jsx`)
- 全局状态管理（使用 useReducer）
- 支付状态、Shopify 授权、AI 配置
- 数据持久化（localStorage、Cookies）

---

## 🔌 工具函数说明

### 1. **支付相关** (`src/utils/payment.js`)
- `createPaymentOrder()` - 创建支付订单（虎皮椒）
- `queryPaymentStatus()` - 查询支付状态
- `handlePaymentSuccess()` - 处理支付成功
- `verifyPaymentStatus()` - 验证支付状态
- `generateSign()` - 生成 MD5 签名

### 2. **Shopify 相关** (`src/utils/shopify.js`)
- `generateShopifyAuthUrl()` - 生成 OAuth 授权 URL
- `extractShopifyCallback()` - 提取授权回调信息
- `fetchShopifyProducts()` - 获取产品列表
- `publishToShopifyBlog()` - 发布文章到博客

### 3. **AI 相关** (`src/utils/deepseek.js`)
- `generateArticle()` - 生成文章
- `testApiKey()` - 测试 API Key
- `getApiKey()` - 获取 API Key（系统/自定义）

---

## 🌐 路由配置

**文件**: `src/App.jsx`

```javascript
/                    → 重定向到 /generator
/generator          → 文章生成页面（需支付验证）
/settings           → 设置页面（需支付验证）
/payment            → 支付页面（无需验证）
/payment/result     → 支付结果页面（无需验证）
/*                  → 404，重定向到 /generator
```

---

## 📝 环境变量配置

**文件**: `.env` (不提交到 Git)

```env
# Shopify 配置
VITE_SHOPIFY_CLIENT_ID=your_shopify_client_id

# DeepSeek API 配置
VITE_DEEPSEEK_DEFAULT_KEY=your_deepseek_api_key

# 虎皮椒支付配置
VITE_HUPIJIAO_MERCHANT_ID=your_merchant_id
VITE_HUPIJIAO_API_KEY=your_api_key

# 支付方式选择（可选）
VITE_PAYMENT_PROVIDER=hupijiao
```

---

## 🚀 启动和构建

```bash
# 开发模式
npm run dev        # 启动开发服务器（http://localhost:3000）

# 构建生产版本
npm run build      # 构建到 dist/ 目录

# 预览构建结果
npm run preview    # 预览构建后的应用
```

---

## 📦 部署

- **平台**: Vercel
- **配置文件**: `vercel.json`
- **构建命令**: `npm run build`
- **输出目录**: `dist`

---

## 🔐 安全注意事项

1. **环境变量**: 所有敏感信息（API Key、商户 ID）通过环境变量管理
2. **支付签名**: 使用 MD5 签名验证（前端实现，建议迁移到后端）
3. **路由保护**: 使用 ProtectedRoute 组件保护需要支付的功能
4. **数据存储**: 支付 Token 存储在 Cookie，其他数据存储在 localStorage

---

## 📚 相关文档

- `README.md` - 项目完整说明
- `QUICKSTART.md` - 快速开始指南
- `PAYMENT_INTEGRATION.md` - 支付集成详细文档
