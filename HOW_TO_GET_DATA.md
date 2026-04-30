# 如何获取你的 MasterGo 设计数据

由于 MasterGo API 访问需要特定的认证方式，这里提供几种方法来获取你的设计数据：

## 方法 1：使用 MasterGo 开发者工具（推荐）

1. 在浏览器中打开你的设计：
   https://mastergo.com/file/180662635664641?layer_id=26:03727

2. 打开浏览器开发者工具（F12）

3. 切换到 Network 标签

4. 刷新页面

5. 查找包含 layer 数据的 API 请求

6. 复制响应的 JSON 数据

7. 保存为 `my-design.json`

8. 运行转换：
   ```bash
   cd E:\Codes\DSL2React
   npm start my-design.json
   ```

## 方法 2：使用 MasterGo 导出功能

1. 在 MasterGo 中选择 Layer ID: 26:03727

2. 右键 → 导出 → JSON 格式

3. 保存文件

4. 运行转换：
   ```bash
   npm start exported-layer.json
   ```

## 方法 3：使用示例数据测试

我已经创建了一个示例 DSL 文件，你可以先测试系统功能：

```bash
cd E:\Codes\DSL2React
npm start example-dsl.json
```

这会生成：
- `output/output-26:03727.html`
- `output/output-26:03727.css`

## 你的凭证信息

```
File ID: 180662635664641
Layer ID: 26:03727
Token: mg_965e5b80475e4246a1b55b8ddfbd9563
```

## MasterGo API 文档

如果你有 MasterGo API 文档，可以查看正确的 endpoint 格式。
常见的可能格式：
- `https://api.mastergo.com/v1/files/{fileId}/nodes/{nodeId}`
- `https://mastergo.com/api/v1/files/{fileId}/layers/{layerId}`

## 需要帮助？

如果你能提供：
1. MasterGo API 文档链接
2. 或者直接导出的 JSON 文件

我可以立即帮你转换！
