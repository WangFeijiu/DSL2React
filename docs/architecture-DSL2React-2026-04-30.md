# System Architecture: DSL2React

**Date:** 2026-04-30
**Architect:** Project Owner
**Version:** 1.0
**Project Type:** library
**Project Level:** 2
**Status:** Draft

---

## Document Overview

This document defines the system architecture for DSL2React. It provides the technical blueprint for implementation, addressing all functional and non-functional requirements from the PRD.

**Related Documents:**
- Product Requirements Document: `docs/prd-DSL2React-2026-04-30.md`
- Product Brief: `docs/product-brief-DSL2React-2026-04-30.md`

---

## Executive Summary

DSL2React 是一个基于**纯脚本、确定性转换**原则的设计到代码自动化工具。系统采用模块化单体架构 + 管道模式，将 MasterGo 设计稿（DSL.json）通过规则引擎转换为高还原度的 HTML/CSS 代码。

**核心架构原则**：
1. **零 LLM 依赖**：所有转换都是确定性的规则映射，无需 AI 推理
2. **规则驱动**：基于完整的规则库进行 DSL → HTML 转换
3. **自动优化**：通��图像对比和迭代优化确保 85%+ 还原度
4. **模块化设计**：8 个核心模块，职责清晰，易于测试和维护

**技术栈**：TypeScript + Node.js + Playwright + pixelmatch

**MVP 目标**：1 个月内验证 DSL → HTML 转换能否达到 85% 还原度

---

## Architectural Drivers

These requirements heavily influence architectural decisions:

1. **确定性转换原则（最重要）**
   - DSL → HTML 是结构化数据转换，不是生成式任务
   - 每一步都是规则明确、结果唯一的
   - **影响**：核心引擎必须是纯脚本，无 LLM API 依赖

2. **NFR-001: 还原度标准 85%+（Must Have）**
   - MVP 成败的关键指标
   - **影响**：需要精确的规则引擎、图像对比评估、自动优化循环

3. **NFR-005: 代码质量和可维护性（Must Have）**
   - 生成的代码必须能被工程师理解和修改
   - **影响**：需要语义化命名、代码格式化、注释生成

4. **NFR-003: Chrome 浏览器兼容性（Must Have）**
   - 只需支持 Chrome
   - **影响**：简化兼容性处理，使用现代 CSS 特性

5. **NFR-006: 错误处理和可靠性（Must Have）**
   - 优雅的错误处理
   - **影响**：需要完善的错误处理和日志系统

---

## System Overview

### High-Level Architecture

**Pattern:** 模块化单体（Modular Monolith）+ 管道模式（Pipeline Pattern）

**Rationale:**
- ✓ Level 2 项目规模适合单体架构
- ✓ 数据流是线性的管道处理
- ✓ 简单部署，易于本地运行和 CI/CD 集成
- ✓ 清晰的模块边界，便于测试和维护
- ✓ 开发速度快，适合 1 个月 MVP 时间线

**Trade-offs:**
- ✗ 无法独立扩展单个模块（但 MVP 不需要）
- ✗ 模块间耦合度略高（但通过接口隔离可控）
- ✓ 开发速度快，适合快速验证

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      DSL2React 架构                          │
└─────────────────────────────────────────────────────────────┘

用户输入 (MasterGo URL / File ID + Layer ID)
    ↓
┌──────────────────────────────────────────────────────────────┐
│ 1. DSL Fetcher Module                                        │
│    - MasterGo API 客户端                                      │
│    - 认证管理（.env / UI 输入）                               │
└──────┬───────────────────────────────────────────────────────┘
       ↓ DSL JSON
┌──────────────────────────────────────────────────────────────┐
│ 2. DSL Parser Module                                         │
│    - JSON 验证 + 树结构解析                                   │
└──────┬───────────────────────────────────────────────────────┘
       ↓ Parsed Tree
┌──────────────────────────────────────────────────────────────┐
│ 3. Rule Engine Module (核心)                                 │
│    - 布局/样式/响应式/动画规则库                              │
└──────┬───────────────────────────────────────────────────────┘
       ↓ Transformation Rules
┌──────────────────────────────────────────────────────────────┐
│ 4. Pattern Recognizer Module                                 │
│    - UI 模式识别（基于规则）                                  │
└──────┬───────────────────────────────────────────────────────┘
       ↓ Recognized Patterns
┌──────────────────────────────────────────────────────────────┐
│ 5. HTML Generator Module                                     │
│    - HTML/CSS/JS 生成 + 格式化                                │
└──────┬───────────────────────────────────────────────────────┘
       ↓ Generated Code
┌──────────────────────────────────────────────────────────────┐
│ 6. Quality Evaluator Module                                  │
│    - 截图 + 图像对比 + 还原度计算                             │
└──────┬───────────────────────────────────────────────────────┘
       ↓ Score + Diagnostics
┌──────────────────────────────────────────────────────────────┐
│ 7. Optimization Loop Module                                  │
│    - 问题诊断 + 修复策略 + 迭代控制                           │
└──────┬───────────────────────────────────────────────────────┘
       ↓
  < 85%? → 调整规则 → 重新生成 (最多 3-5 次)
       ↓
  ≥ 85%? → 输出
       ↓
┌──────────────────────────────────────────────────────────────┐
│ 8. Output Manager Module                                     │
│    - 文件写入 + 输出清理 + 预览服务器                         │
└──────────────────────────────────────────────────────────────┘
       ↓
   最终 HTML 文件
```

### Architectural Pattern

**Pattern:** 模块化单体 + 管道模式

**Rationale:** 
数据流是单向的、线性的管道处理，每个模块是管道中的一个阶段。这种模式非常适合确定性转换任务，易于理解、测试和调试。

---

## Technology Stack

### Core Language

**Choice:** TypeScript (Node.js)

**Rationale:**
- ✓ 前端团队熟悉，降低学习成本
- ✓ 强类型系统，减少运行时错误
- ✓ 丰富的 HTML/CSS 处理生态
- ✓ 性能优秀，适合 CLI 工具
- ✓ 易于集成到前端工作流

**Trade-offs:**
- Python 在数据处理方面更成熟，但团队不熟悉
- TypeScript 编译步骤略复杂，但可接受

### DSL Processing

**Choice:** 原生 JSON 解析 + Zod (Schema 验证)

**Rationale:**
- ✓ 无需额外依赖，Node.js 内置 JSON 支持
- ✓ Zod 提供类型安全的 Schema 验证
- ✓ 自动生成 TypeScript 类型

### HTML/CSS Generation

**Choice:** 模板字符串 + Prettier (代码格式化)

**Rationale:**
- ✓ 模板字符串简单直接，无学习成本
- ✓ Prettier 自动格式化，保证代码质量
- ✓ 不需要复杂的模板引擎

### Browser Automation

**Choice:** Playwright

**Rationale:**
- ✓ 比 Puppeteer 更现代，API 更友好
- ✓ 内置等待机制，截图更可靠
- ✓ 性能优秀

### Image Comparison

**Choice:** pixelmatch

**Rationale:**
- ✓ 轻量级，无依赖
- ✓ 性能优秀
- ✓ 输出差异图像，便于调试

### CLI Framework

**Choice:** Commander.js + Inquirer.js + Ora

**Rationale:**
- Commander.js: 命令行参数解析
- Inquirer.js: 交互式提示
- Ora: 进度动画

### Configuration

**Choice:** dotenv

**Rationale:**
- ✓ 标准的 .env 文件管理
- ✓ 简单易用

### Testing

**Choice:** Jest + @playwright/test

**Rationale:**
- Jest: 单元测试和集成测试
- @playwright/test: E2E 测试

### Development Tools

- **TypeScript**: 类型检查
- **ESLint**: 代码规范
- **Prettier**: 代码格式化
- **ts-node**: 开发时直接运行 TS
- **nodemon**: 热重载

---

## System Components

### Component 1: DSL Fetcher Module

**Purpose:** 从 MasterGo API 获取设计稿的 DSL 数据

**Responsibilities:**
- 读取 API 密钥（.env 文件或 UI 输入）
- 解析 MasterGo URL 提取 File ID 和 Layer ID
- 调用 MasterGo API 获取 DSL JSON
- 处理 API 错误（网络、认证、404）
- 实现重试机制（最多 3 次）

**Interfaces:**
```typescript
interface DSLFetcher {
  fetchDSL(input: FetchInput): Promise<DSLData>;
}

type FetchInput = 
  | { type: 'url'; url: string }
  | { type: 'ids'; fileId: string; layerId: string };
```

**Dependencies:** axios, dotenv

**FRs Addressed:** FR-001

---

### Component 2: DSL Parser Module

**Purpose:** 解析 DSL JSON 为结构化的内部表示

**Responsibilities:**
- 验证 DSL JSON Schema
- 递归遍历节点树
- 提取布局、样式、文本、资源信息
- 构建内部 AST

**Interfaces:**
```typescript
interface DSLParser {
  parse(dslData: DSLData): ParsedTree;
  validate(dslData: DSLData): ValidationResult;
}
```

**Dependencies:** Zod

**FRs Addressed:** FR-002

---

### Component 3: Rule Engine Module (核心)

**Purpose:** 核心转换规则库，将 DSL 元素映射为 HTML/CSS

**Responsibilities:**
- 布局规则：Flex/Grid/Absolute 定位映射
- 样式规则：CSS 属性映射
- 响应式规则：断点计算、Media Query 生成
- 动画规则：CSS Animation/Transition 映射
- 命名规则：生成语义化 CSS 类名

**Interfaces:**
```typescript
interface RuleEngine {
  applyLayoutRules(node: ElementNode): LayoutRules;
  applyStyleRules(node: ElementNode): StyleRules;
  applyResponsiveRules(node: ElementNode): ResponsiveRules;
  applyAnimationRules(node: ElementNode): AnimationRules;
}
```

**Dependencies:** 无（纯规则库）

**FRs Addressed:** FR-004, FR-005, FR-007, FR-008

---

### Component 4: Pattern Recognizer Module

**Purpose:** 基于规则识别常见 UI 模式

**Responsibilities:**
- 手风琴/标签页/轮播图/下拉菜单/模态框模式识别
- 为识别的模式生成交互 JavaScript

**Interfaces:**
```typescript
interface PatternRecognizer {
  recognize(tree: ParsedTree): RecognizedPattern[];
}
```

**Dependencies:** 无（纯规则匹配）

**FRs Addressed:** FR-006

---

### Component 5: HTML Generator Module

**Purpose:** 生成最终的 HTML/CSS/JS 代码

**Responsibilities:**
- 生成语义化 HTML 结构
- 生成外部 CSS 样式表
- 生成交互 JavaScript
- 代码格式化和注释

**Interfaces:**
```typescript
interface HTMLGenerator {
  generate(tree: ParsedTree, patterns: RecognizedPattern[]): GeneratedCode;
}
```

**Dependencies:** Prettier

**FRs Addressed:** FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010

---

### Component 6: Quality Evaluator Module

**Purpose:** 评估生成的 HTML 与原设计稿的还原度

**Responsibilities:**
- 获取设计稿截图
- 使用 Playwright 对 HTML 截图
- 使用 pixelmatch 计算像素差异
- 计算还原度百分比
- 分析差异区域

**Interfaces:**
```typescript
interface QualityEvaluator {
  evaluate(html: string, designScreenshot: Buffer): Promise<EvaluationResult>;
}
```

**Dependencies:** Playwright, pixelmatch

**FRs Addressed:** FR-012

---

### Component 7: Optimization Loop Module

**Purpose:** 自动优化循环，迭代提升还原度

**Responsibilities:**
- 分析诊断结果
- 选择修复策略
- 调整规则参数
- 控制迭代次数
- 选择最佳版本

**Interfaces:**
```typescript
interface OptimizationLoop {
  optimize(initialResult: EvaluationResult, tree: ParsedTree): Promise<OptimizationResult>;
}
```

**Dependencies:** Quality Evaluator, HTML Generator

**FRs Addressed:** FR-013

---

### Component 8: Output Manager Module

**Purpose:** 管理输出文件和预览

**Responsibilities:**
- 检测 Layer ID 变化
- 清理旧输出文件
- 写入最终文件
- 启动预览服务器

**Interfaces:**
```typescript
interface OutputManager {
  cleanOldOutput(layerId: string): Promise<void>;
  writeOutput(code: GeneratedCode, layerId: string): Promise<OutputPaths>;
  startPreviewServer(htmlPath: string): Promise<PreviewServer>;
}
```

**Dependencies:** fs, http-server

**FRs Addressed:** FR-003, FR-010, FR-011

---

## Data Architecture

### Data Model

**Core Data Structures:**

1. **DSLData** (输入)
```typescript
interface DSLData {
  raw: any;  // MasterGo 原始 JSON
  metadata: { fileId: string; layerId: string; fetchedAt: Date };
}
```

2. **ParsedTree** (内部表示)
```typescript
interface ParsedTree {
  root: ElementNode;
  metadata: TreeMetadata;
}

interface ElementNode {
  id: string;
  type: 'container' | 'text' | 'image' | 'button' | 'icon';
  layout: LayoutInfo;
  styles: StyleInfo;
  children: ElementNode[];
}
```

3. **GeneratedCode** (输出)
```typescript
interface GeneratedCode {
  html: string;
  css: string;
  js?: string;
  assets: Asset[];
}
```

4. **EvaluationResult** (质量评估)
```typescript
interface EvaluationResult {
  score: number;  // 0-100
  passed: boolean;  // >= 85%
  diagnostics: Diagnostic[];
  diffImage: Buffer;
}
```

### Data Flow

```
用户输入 → DSL Fetcher → DSLData
    ↓
DSL Parser → ParsedTree
    ↓
Rule Engine + Pattern Recognizer → EnrichedTree
    ↓
HTML Generator → GeneratedCode
    ↓
Quality Evaluator → EvaluationResult
    ↓
< 85%? → Optimization Loop → 调整 → 重新生成
    ↓
≥ 85%? → Output Manager → 文件系统
```

### Data Persistence

**MVP 阶段：最小化持久化**
- 配置文件：`.env` (API 密钥)
- 输出文件：`output/` 目录（HTML/CSS/JS）
- 临时文件：截图缓存（使用后清理）
- **不需要数据库**

---

## Non-Functional Requirements Coverage

### NFR-001: 还原度标准 85%+

**Requirement:** 生成的 HTML 必须达到 85% 以上的视觉还原度

**Architecture Solution:**
1. 精确的规则引擎（完���的 CSS 属性映射）
2. Quality Evaluator Module（Playwright 截图 + pixelmatch 对比）
3. Optimization Loop Module（自动迭代优化，最多 3-5 次）

**Validation:** 每次生成自动评估，输出评估报告

---

### NFR-002: 性能要求

**Requirement:** 系统能够在合理时间内完成转换

**Architecture Solution:**
1. 纯脚本引擎，无 LLM 延迟
2. 高效的数据结构（树遍历优化）
3. 并行处理（多断点截图可并行）

**Validation:** 性能测试，目标 < 30 秒（中等复杂页面）

---

### NFR-003: 浏览器兼容性

**Requirement:** 生成的 HTML 必须在 Chrome 浏览器中正确显示

**Architecture Solution:**
1. Chrome-first CSS 生成（使用现代特性）
2. Playwright with Chromium（评估环境与目标一致）

**Validation:** 在 Chrome 中测试所有生成的���面

---

### NFR-005: 代码质量和可维护性

**Requirement:** 生成的代码必须能被工程师理解和修改

**Architecture Solution:**
1. 语义化 HTML（使用 `<header>`, `<section>` 等）
2. 外部 CSS 文件（不使用内联样式）
3. Prettier 格式化（自动格式化）
4. 代码注释（标注主要区块）

**Validation:** 前端工程师可读性测试（30 分钟理解并修改）

---

### NFR-006: 错误处理和可靠性

**Requirement:** 系统能够优雅地处理错误

**Architecture Solution:**
1. 分层错误处理（自定义错误类）
2. 友好的错误信息（包含建议）
3. 部分失败容错（单个元素失败不中断）
4. 重试机制（API 调用失败自动重试）

**Validation:** 错误场景测试

---

### NFR-007: 易用性

**Requirement:** 工具易于使用，降低学习成本

**Architecture Solution:**
1. CLI 界面（Commander.js）
2. 交互式配置（Inquirer.js）
3. 清晰的输出（进度动画、成功提示）
4. 文档和示例

**Validation:** 新用户上手测试（< 5 分钟完成首次转换）

---

## Development Architecture

### Code Organization

```
dsl2react/
├── src/
│   ├── modules/
│   │   ├── fetcher/          # DSL Fetcher Module
│   │   ├── parser/           # DSL Parser Module
│   │   ├── rule-engine/      # Rule Engine Module
│   │   ├── pattern-recognizer/  # Pattern Recognizer
│   │   ├── generator/        # HTML Generator Module
│   │   ├── evaluator/        # Quality Evaluator Module
│   │   ├── optimizer/        # Optimization Loop Module
│   │   └── output/           # Output Manager Module
│   ├── types/                # TypeScript 类型定义
│   ├── utils/                # 工具函数
│   ├── cli.ts                # CLI 入口
│   └── index.ts              # 主入口
├── tests/
│   ├── unit/                 # 单元测试
│   ├── integration/          # 集成测试
│   └── e2e/                  # E2E 测试
├── output/                   # 输出目录
├── .env.example              # 环境变量示例
├── package.json
├── tsconfig.json
└── README.md
```

### Testing Strategy

**Unit Testing (80%+ coverage):**
- 每个模块独立测试
- Mock 外部依赖
- 使用 Jest

**Integration Testing:**
- 模块间交互测试
- 完整管道测试

**E2E Testing:**
- 使用 @playwright/test
- 真实场景测试

### CI/CD Pipeline

```
1. Code Push → GitHub
2. CI Trigger (GitHub Actions)
3. Install Dependencies
4. Lint (ESLint)
5. Type Check (TypeScript)
6. Unit Tests (Jest)
7. Integration Tests
8. Build (tsc)
9. E2E Tests (Playwright)
10. Publish (npm) - 如果是 release
```

---

## Requirements Traceability

### Functional Requirements Coverage

| FR ID | FR Name | Components | Status |
|-------|---------|------------|--------|
| FR-001 | MasterGo API 获取 | DSL Fetcher | ✓ |
| FR-002 | DSL 解析 | DSL Parser | ✓ |
| FR-003 | 输出管理 | Output Manager | ✓ |
| FR-004 | HTML 生成 | HTML Generator | ✓ |
| FR-005 | 响应式布局 | Rule Engine, HTML Generator | ✓ |
| FR-006 | UI 模式识别 | Pattern Recognizer | ✓ |
| FR-007 | CSS 样式 | Rule Engine, HTML Generator | ✓ |
| FR-008 | 动画转换 | Rule Engine, HTML Generator | ✓ |
| FR-009 | 资源处理 | HTML Generator | ✓ |
| FR-010 | 完整 HTML 输出 | HTML Generator | ✓ |
| FR-011 | 本地预览 | Output Manager | ✓ |
| FR-012 | 还原度评估 | Quality Evaluator | ✓ |
| FR-013 | 自动优化循环 | Optimization Loop | ✓ |

**Coverage:** 13/13 FRs (100%)

### Non-Functional Requirements Coverage

| NFR ID | NFR Name | Solution | Status |
|--------|----------|----------|--------|
| NFR-001 | 还原度 85%+ | Rule Engine + Evaluator + Optimizer | ✓ |
| NFR-002 | 性能 | 纯脚本引擎，无 LLM 延迟 | ✓ |
| NFR-003 | Chrome 兼容 | Chrome-first CSS | ✓ |
| NFR-004 | 安全性 | .env + 日志脱敏 | ✓ |
| NFR-005 | 代码质量 | 语义化 + Prettier + 注释 | ✓ |
| NFR-006 | 错误处理 | 分层错误 + 重试机制 | ✓ |
| NFR-007 | 易用性 | CLI + 交互式 + 文档 | ✓ |

**Coverage:** 7/7 NFRs (100%)

---

## Trade-offs & Decision Log

### Decision 1: TypeScript vs Python

**Decision:** TypeScript

**Trade-off:**
- ✓ Gain: 团队熟悉，前端生态丰富
- ✗ Lose: Python 数据处理更成熟

**Rationale:** 团队技能匹配更重要

---

### Decision 2: 模块化单体 vs 微服务

**Decision:** 模块化单体

**Trade-off:**
- ✓ Gain: 简单部署，开发速度快
- ✗ Lose: 无法独立扩展模块

**Rationale:** Level 2 项目不需要微服务复杂度

---

### Decision 3: 纯脚本 vs LLM 辅助

**Decision:** 纯脚本（零 LLM 依赖）

**Trade-off:**
- ✓ Gain: 确定性输出，高性能，无 API 成本
- ✗ Lose: 无法处理模糊或非结构化输入

**Rationale:** DSL 是结构化数据，不需要 AI 推理

---

## Assumptions & Constraints

**Assumptions:**
- MasterGo API 稳定且文档完善
- DSL 格式是结构化的、精确的、无歧义的
- 前端团队熟悉 TypeScript 和 Node.js
- 85% 还原度足以满足业务需求

**Constraints:**
- MVP 必须在 1 个月内完成
- 只支持 Chrome 浏览器
- 不支持复杂的 JavaScript 交互（MVP 阶段）

---

## Future Considerations

**Phase 2 (Post-MVP):**
1. HTML → React 代码转换
2. 浏览器插件可视化微调
3. 外部组件库集成
4. 更广泛的浏览器支持（Safari、Firefox）
5. 批量转换多个设计稿
6. 性能优化（缓存、增量更新）

---

## Next Steps

### Phase 4: Sprint Planning & Implementation

Run `/sprint-planning` to:
- Break epics into detailed user stories
- Estimate story complexity
- Plan sprint iterations (4 周，每周 1 个 sprint)
- Begin implementation following this architectural blueprint

**Key Implementation Principles:**
1. 遵循模块边界，保持职责单一
2. 实现所有 NFR 解决方案
3. 使用定义的技术栈
4. 编写测试（80%+ 覆盖率）
5. 遵循代码规范（ESLint + Prettier）

---

**This document was created using BMAD Method v6 - Phase 3 (Solutioning)**

*To continue: Run `/workflow-status` to see your progress and next recommended workflow.*
