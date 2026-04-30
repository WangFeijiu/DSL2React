# DSL2React Server API

## 🚀 启动服务器

```bash
npm run server
```

服务器将在 `http://localhost:3456` 启动

## 📡 API 端点

### GET /status
查看系统状态

**响应：**
```json
{
  "status": "ok",
  "dslReady": true,
  "outputFiles": 2
}
```

### POST /save-dsl
保存 DSL 数据到 `output/machine-dsl.json`

**请求体：**
```json
{
  "id": "layer-123",
  "name": "Hero Section",
  "type": "FRAME",
  ...
}
```

### POST /rebuild
重新构建 HTML（不重新获取 DSL）

**响应：**
```json
{
  "success": true,
  "outputPath": "output/preview.html"
}
```

## 🔄 工作流程

1. **保存 DSL 数据：**
   ```bash
   curl -X POST http://localhost:3456/save-dsl \
     -H "Content-Type: application/json" \
     -d @your-dsl.json
   ```

2. **重建 HTML：**
   ```bash
   curl -X POST http://localhost:3456/rebuild
   ```

3. **查看结果：**
   ```bash
   open output/preview.html
   ```

## 💡 使用场景

- **增量更新**：修改 DSL 后快速重建，无需重新获取
- **批量处理**：处理多个 Layer 的转换
- **CI/CD 集成**：自动化构建流程
- **实时预览**：配合前端实时预览系统

## 🔗 与 MasterGo 集成

你的 MasterGo 凭证：
```
File ID: 180662635664641
Layer ID: 26:03727
Token: mg_965e5b80475e4246a1b55b8ddfbd9563
```

可以通过以下方式获取 DSL：
1. 使用 MasterGo 开发者工具导出 JSON
2. 通过 MasterGo API 获取（需要正确的 endpoint）
3. 使用 MasterGo MCP 服务器（如果可用）
