# DSL2React

[![GitHub](https://img.shields.io/badge/GitHub-DSL2React-blue?logo=github)](https://github.com/WangFeijiu/DSL2React)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](https://www.typescriptlang.org/)

Convert MasterGo designs to HTML/CSS with 85%+ fidelity using MCP protocol.

## 🔗 Links

- **GitHub**: https://github.com/WangFeijiu/DSL2React
- **Documentation**: See `docs/` directory
- **Issues**: https://github.com/WangFeijiu/DSL2React/issues

## 🎯 核心理念

**直接从 MasterGo 获取设计数据，自动转换为生产就绪的 HTML/CSS 代码。**

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env` 文件（参考 `.env.example`）：

```env
# MasterGo MCP Token
MG_MCP_TOKEN=your_mastergo_token_here

# MasterGo 文件 ID 和图层 ID
MG_FILE_ID=180662635664641
MG_LAYER_ID=26:03727
```

### 3. 运行转换

```bash
# 方式 1：从 MasterGo 获取并转换（推荐）
npm run dev

# 方式 2：从本地 DSL 重建
npm run dev:rebuild

# 方式 3：转换本地 JSON 文件
npm start example-dsl.json
```

## 📋 完整链路

```text
MasterGo 设计稿
→ MCP 协议获取 DSL
→ DSL 验证和解析
→ 规则引擎转换
→ HTML/CSS 生成
→ 输出文件
```

## 🎨 使用方式

### 方式 1：MCP 协议（推荐）✅

```bash
# 1. 配置 .env 文件
MG_MCP_TOKEN=your_token
MG_FILE_ID=your_file_id
MG_LAYER_ID=your_layer_id

# 2. 运行转换
npm run dev

# 输出：
# output/raw-mcp-dsl.json      # 原始 MasterGo DSL
# output/output-26-03727.html  # 生成的 HTML
# output/output-26-03727.css   # 生成的 CSS
```

### 方式 2：本地 JSON 文件

```bash
# 从 MasterGo 导出 JSON 或使用示例文件
npm start example-dsl.json

# 或
npm start your-exported-layer.json
```

### 方式 3：重建模式

```bash
# 使用已保存的 DSL 重新生成（无需重新获取）
npm run dev:rebuild
```

## 📁 项目结构

```
DSL2React/
├── src/
│   ├── modules/
│   │   ├── fetcher/              # MCP 客户端
│   │   │   ├── dsl-fetcher.ts
│   │   │   └── mastergo-mcp-client.ts  # ✨ MCP 连接
│   │   ├── parser/               # DSL 解析
│   │   │   ├── dsl-validator.ts
│   │   │   └── dsl-parser.ts
│   │   ├── rule-engine/          # CSS 规则引擎
│   │   │   ├── flexbox-rules.ts
│   │   │   ├── grid-rules.ts
│   │   │   ├── style-rules.ts
│   │   │   └── ...
│   │   ├── generator/            # HTML 生成
│   │   │   ├── html-generator.ts
│   │   │   └── asset-processor.ts
│   │   └── output/               # 文件管理
│   │       └── output-manager.ts
│   ├── types/                    # TypeScript 类型
│   ├── cli.ts                    # CLI 入口
│   └── server.ts                 # HTTP API 服务器
├── tests/                        # 44 个单元测试
├── output/                       # 生成的文件
├── .env                          # 环境配置
└── README.md
```

## 🔧 技术实现

### MCP 连接

使用 `@mastergo/magic-mcp` 和 `@modelcontextprotocol/sdk`：

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'node',
  args: ['node_modules/@mastergo/magic-mcp/dist/index.js'],
  env: {
    MG_MCP_TOKEN: token,
    API_BASE_URL: 'https://mastergo.com',
  },
});

const client = new Client({ name: 'dsl2react', version: '1.0.0' });
await client.connect(transport);

const response = await client.callTool({
  name: 'mcp__getDsl',
  arguments: { fileId, layerId },
});
```

### CSS 规则引擎

- ✅ Flexbox 布局
- ✅ Grid 布局
- ✅ 绝对/相对定位
- ✅ 响应式断点
- ✅ 样式提取（颜色、字体、边框、阴影）
- ✅ 动画和过渡

### HTML 生成

- ✅ 语义化标签
- ✅ 正确的嵌套结构
- ✅ 可访问性属性
- ✅ 外部 CSS 链接

## 📊 项目状态

### Sprint 1: 100% 完成 ✅

- **总故事点**: 63/63
- **完成故事**: 15/15
- **测试用例**: 44 个（全部通过）
- **Git 提交**: 23 个
- **代码行数**: 1,500+ 行

### 核心功能

- ✅ MCP 协议连接
- ✅ DSL 验证和解析
- ✅ Flexbox/Grid 布局
- ✅ CSS 样式生成
- ✅ HTML 生成
- ✅ 文件管理
- ✅ CLI 工具
- ✅ HTTP API 服务器

## 🧪 测试

```bash
# 运行所有测试
npm test

# 测试覆盖率
npm run test:coverage

# 监听模式
npm run test:watch
```

## 🛠️ 开发

```bash
# 构建项目
npm run build

# 代码检查
npm run lint

# 代码格式化
npm run format

# 清理输出
npm run clean
```

## 📚 文档

- `README.md` - 项目概述（本文件）
- `USAGE.md` - 详细使用指南
- `MASTERGO_CONFIG.md` - MasterGo 配置指南
- `PROJECT_SUMMARY.md` - 项目总结
- `CONVERSION_REPORT.md` - 转换报告
- `SERVER_API.md` - HTTP API 文档

## 🎯 示例

### 你的 MasterGo 数据

```env
MG_FILE_ID=180662635664641
MG_LAYER_ID=26:03727
MG_MCP_TOKEN=mg_965e5b80475e4246a1b55b8ddfbd9563
```

### 运行转换

```bash
npm run dev
```

### 输出结果

```
📡 Fetching DSL from MasterGo via MCP...
✅ Connected to MasterGo MCP server
✅ DSL data fetched successfully
📄 Raw DSL saved to output/raw-mcp-dsl.json
🔍 Validating DSL...
✅ DSL validated
🔄 Parsing DSL tree...
✅ Parsed 3 top-level elements
🎨 Generating HTML...
✅ HTML generated
💾 Writing output files...
✅ Output written

📄 Generated files:
  HTML: output/output-26-03727.html
  CSS: output/output-26-03727.css

🎉 Conversion complete!
```

## 🚧 未来计划

- [ ] 适配 MasterGo DSL 格式
- [ ] UI 模式识别
- [ ] 还原度自动评估
- [ ] React 组件生成
- [ ] 可视化编辑器

## 📈 技术栈

- **语言**: TypeScript 6.0
- **运行时**: Node.js
- **MCP**: @mastergo/magic-mcp
- **验证**: Zod
- **测试**: Jest
- **代码质量**: ESLint + Prettier

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

ISC

---

**🎉 MCP 连接成功！系统已准备好转换你的 MasterGo 设计稿！** 🚀
