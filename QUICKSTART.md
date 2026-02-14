# 快速启动指南

## 1. 安装依赖

```bash
npm install
```

## 2. 配置环境变量

创建 `.env` 文件并配置以下变量（至少配置前 4 个）：

```env
VITE_SHOPIFY_CLIENT_ID=your_shopify_client_id
VITE_DEEPSEEK_DEFAULT_KEY=your_deepseek_api_key
VITE_HUPIJIAO_MERCHANT_ID=your_merchant_id
VITE_HUPIJIAO_API_KEY=your_api_key
```

## 3. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000`

## 4. 测试流程

1. **首次访问**：会自动跳转到支付页面（因为未支付）
2. **支付测试**：选择任意套餐，点击"立即购买"（当前为模拟支付）
3. **设置页面**：完成 Shopify 授权和 AI 配置
4. **生成文章**：在生成器页面输入提示词，生成文章
5. **编辑发布**：使用富文本编辑器编辑，然后发布到 Shopify

## 注意事项

- 当前所有接口均为模拟实现，实际使用时需替换为真实接口
- 代码中已标注所有需要替换的位置（搜索 `TODO` 注释）
- 支付功能需配置真实的虎皮椒接口才能正常使用
- Shopify 授权需配置真实的 OAuth 流程

## 构建生产版本

```bash
npm run build
```

构建产物在 `dist` 目录，可直接部署到 Vercel。
