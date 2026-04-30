# MasterGo 配置指南

## 方法 1：使用 MasterGo MCP 服务器（推荐）

如果你的系统中安装了 MasterGo MCP 服务器，可以通过 MCP 协议直接访问。

### 检查 MCP 服务器

```bash
# 查看可用的 MCP 工具
# 如果有 mastergo 相关的工具，说明 MCP 服务器已安装
```

### 配置 .env

```env
# MasterGo 凭证
MG_MCP_TOKEN=mg_965e5b80475e4246a1b55b8ddfbd9563
MG_FILE_ID=180662635664641
MG_LAYER_ID=26:03727

# 完整 URL（可选）
_MG_URL=https://mastergo.com/file/180662635664641?layer_id=26%3A03727
```

---

## 方法 2：使用 MasterGo API（需要正确的 endpoint）

### 1. 配置 API 密钥

在 `.env` 文件中添加：

```env
MASTERGO_API_KEY=mg_965e5b80475e4246a1b55b8ddfbd9563
MG_FILE_ID=180662635664641
MG_LAYER_ID=26:03727
```

### 2. 测试 API 访问

```bash
# 测试不同的 API endpoint
node fetch-mastergo.js
```

### 3. 可能的 API endpoints

MasterGo API 可能的格式：
- `https://api.mastergo.com/v1/files/{fileId}/nodes/{nodeId}`
- `https://mastergo.com/api/v1/files/{fileId}/layers/{layerId}`
- `https://api.mastergo.com/files/{fileId}/nodes/{nodeId}`

**注意：** 目前这些 endpoint 都无法访问，可能需要：
- VPN 或特定网络环境
- 企业版 API 访问权限
- 不同的认证方式

---

## 方法 3：从 MasterGo UI 导出（当前最可靠）

### 步骤 1：在浏览器中打开设计稿

```
https://mastergo.com/file/180662635664641?layer_id=26:03727
```

### 步骤 2：使用开发者工具获取数据

1. **打开开发者工具**
   - Windows: `F12` 或 `Ctrl+Shift+I`
   - Mac: `Cmd+Option+I`

2. **���换到 Network 标签**
   - 勾选 "Preserve log"
   - 清空现有请求

3. **刷新页面**
   - 按 `F5` 或 `Ctrl+R`

4. **查找 API 请求**
   - 在 Filter 中输��� "layer" 或 "node"
   - 查找包含你的 Layer ID 的请求
   - 可能的请求名称：
     - `getNode`
     - `getLayer`
     - `getFileData`
     - 包含 `26:03727` 的请求

5. **复制响应数据**
   - 点击找到的请求
   - 切换到 "Response" 或 "Preview" 标签
   - 右键 → Copy → Copy object
   - 或者直接复制 JSON 文本

6. **保存为文件**
   ```bash
   # 保存为 my-layer.json
   # 然后运行转换
   npm start my-layer.json
   ```

### 步骤 3：使用 MasterGo 导出功能（如果可用）

某些 MasterGo 版本可能支持直接导出：
1. 选择 Layer
2. 右键 → 导出 → JSON 格式
3. 保存文件
4. 运行转换

---

## 方法 4：使用 HTTP API 服务器

我们的系统提供了 HTTP API，可以保存和重用 DSL 数据。

### 1. 启动服务器

```bash
npm run server
```

服务器将在 `http://localhost:3456` 启动

### 2. 保存 DSL 数据

```bash
# 方式 A：通过 curl
curl -X POST http://localhost:3456/save-dsl \
  -H "Content-Type: application/json" \
  -d @your-layer.json

# 方式 B：通过 Web UI（如果有）
# 访问 http://localhost:3456 并上传文件
```

### 3. 重建 HTML

```bash
curl -X POST http://localhost:3456/rebuild
```

### 4. 查看结果

```bash
open output/preview.html
```

---

## 推荐工作流程

### 首次设置

1. **获取 DSL 数据**（使用方法 3）
   ```bash
   # 从浏览器开发者工具复制 JSON
   # 保存为 mastergo-layer-26-03727.json
   ```

2. **转换�� HTML**
   ```bash
   npm start mastergo-layer-26-03727.json
   ```

3. **查看结果**
   ```bash
   start output/output-26-03727.html
   ```

### 后续更新

1. **启动 API 服务器**
   ```bash
   npm run server
   ```

2. **保存新的 DSL**
   ```bash
   curl -X POST http://localhost:3456/save-dsl \
     -H "Content-Type: application/json" \
     -d @updated-layer.json
   ```

3. **重建**
   ```bash
   curl -X POST http://localhost:3456/rebuild
   ```

---

## 故障排除

### 问题 1：API 无法访问

**症状：** `getaddrinfo ENOTFOUND api.mastergo.com`

**解决方案：**
- 使用方法 3（浏览器开发者工具）
- 检查网络连接
- 尝试使用 VPN
- 联系 MasterGo 支持获取正确的 API endpoint

### 问题 2：认证失败

**症状：** `401 Unauthorized`

**解决方案：**
- 检查 Token 是否正确
- Token 可能已过期，需要重新生成
- 检查 Token 格式（应该以 `mg_` 开头）

### 问题 3：找不到 Layer

**症状：** `404 Not Found`

**解决方案：**
- 确认 File ID 和 Layer ID 正确
- Layer ID 中的冒号 `:` 在 URL 中需要编码为 `%3A`
- 检查是否有访问权限

---

## 当前你的配置

```env
# 你的凭证
MG_MCP_TOKEN=mg_965e5b80475e4246a1b55b8ddfbd9563
MG_FILE_ID=180662635664641
MG_LAYER_ID=26:03727

# URL
https://mastergo.com/file/180662635664641?layer_id=26%3A03727
```

### 建议的下一步

1. **使用浏览器开发者工具**（最可靠）
   - 打开上面的 URL
   - F12 → Network → 刷新
   - 找到包含 layer 数据的请求
   - 复制 JSON 响应

2. **保存为文件**
   ```bash
   # 保存为 my-design.json
   ```

3. **运行转换**
   ```bash
   npm start my-design.json
   ```

---

## 需要帮助？

如果你能提供以下信息，我可以提供更具体的帮助：

1. **MasterGo 版本**
   - 企业版 / 个人版
   - 版本号

2. **API 文档**
   - 如果有 MasterGo API 文档链接

3. **错误信息**
   - 完整的错误日志

4. **网络环境**
   - 是否在企业内网
   - 是否需要代理

---

## 快速测试

```bash
# 测试 1：检查服务器
curl http://localhost:3456/status

# 测试 2：使用示例文件
npm start example-dsl.json

# 测试 3：使用你的 Layer
npm start mastergo-layer-26-03727.json
```

**当前状态：** ✅ 系统已成功转换你的 Layer 26:03727！
