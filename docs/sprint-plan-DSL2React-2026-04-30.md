# Sprint Plan: DSL2React

**Date:** 2026-04-30
**Scrum Master:** Project Owner
**Project Level:** 2
**Total Stories:** 20
**Total Points:** 91
**Planned Sprints:** 2
**Team Size:** 2-3 developers
**Sprint Length:** 2 weeks
**Sprint Capacity:** 68 points

---

## Executive Summary

This sprint plan breaks down the DSL2React MVP into 20 implementable user stories across 2 sprints (4 weeks). The plan focuses on delivering a complete DSL → HTML conversion pipeline with 85%+ fidelity through automated quality evaluation and optimization.

**Key Metrics:**
- Total Stories: 20
- Total Points: 91
- Sprints: 2
- Team Capacity: 68 points per sprint
- Target Completion: 2026-05-30 (1 month)

**Sprint Goals:**
- Sprint 1: Build complete DSL → HTML conversion pipeline
- Sprint 2: Add quality evaluation and auto-optimization

---

## Story Inventory

### STORY-000: 项目基础设施搭建

**Epic:** Infrastructure
**Priority:** Must Have
**Points:** 3

**User Story:**
作为开发者
我需要搭建项目基础结构
以便开始开发

**Acceptance Criteria:**
- [ ] 初始化 TypeScript + Node.js 项目
- [ ] 配置 ESLint + Prettier
- [ ] 配置 Jest 测试框架
- [ ] 设置 .env 配置管理（dotenv）
- [ ] 创建基本目录结构（src/modules/, tests/, output/）
- [ ] 配置 tsconfig.json
- [ ] 添加 package.json scripts（build, test, lint）

**Technical Notes:**
- 使用 TypeScript 4.9+
- Jest 配置支持 TypeScript
- ESLint + Prettier 集成

**Dependencies:** 无

---

### STORY-001: MasterGo API 客户端

**Epic:** EPIC-001
**Priority:** Must Have
**Points:** 5

**User Story:**
作为用户
我想通过 MasterGo URL 或 File ID + Layer ID 获取设计稿数据
以便开始转换

**Acceptance Criteria:**
- [ ] 从 .env 读取 MASTERGO_API_KEY
- [ ] 解析 MasterGo URL 提取 File ID 和 Layer ID
- [ ] 或直接接受 File ID + Layer ID 输入
- [ ] 调用 MasterGo API 获取 DSL JSON
- [ ] 实现错误处理（网络错误、401、404）
- [ ] 实现重试机制（最多 3 次，指数退避）
- [ ] 返回 DSLData 对象

**Technical Notes:**
- 使用 axios 作为 HTTP 客户端
- API endpoint: `https://api.mastergo.com/v1/files/{fileId}/layers/{layerId}`
- 错误类型：DSLFetchError (NETWORK | AUTH | NOT_FOUND)

**Dependencies:** STORY-000

---

### STORY-002: DSL Schema 验证

**Epic:** EPIC-001
**Priority:** Must Have
**Points:** 3

**User Story:**
作为系统
我需要验证 DSL 数据格式正确性
以便避免后续处理错误

**Acceptance Criteria:**
- [ ] 使用 Zod 定义 DSL Schema
- [ ] 验证 JSON 结构（必需字段、类型）
- [ ] 返回详细的验证错误（字段路径、错误类型）
- [ ] 自动生成 TypeScript 类型（z.infer）

**Technical Notes:**
- Schema 定义在 src/types/dsl-schema.ts
- 验证失败抛出 DSLValidationError

**Dependencies:** STORY-001

---

### STORY-003: DSL 树解析器

**Epic:** EPIC-001
**Priority:** Must Have
**Points:** 5

**User Story:**
作为系统
我需要将 DSL JSON 解析为内部树结构
以便后续转换

**Acceptance Criteria:**
- [ ] 递归遍历 DSL 节点树
- [ ] 提取布局信息（position, size, positioning, display）
- [ ] 提取样式信息（colors, typography, borders, shadows）
- [ ] 提取文本内容和属性
- [ ] 提取图片、图标资源引用
- [ ] 提取动画和交互状态信息
- [ ] 构建 ParsedTree 数据结构（ElementNode[]）

**Technical Notes:**
- 使用递归算法遍历树
- ElementNode 接口定义在 src/types/parsed-tree.ts
- 处理嵌套层级（最多 20 层）

**Dependencies:** STORY-002

---

### STORY-004: 基础 HTML 生成器

**Epic:** EPIC-002
**Priority:** Must Have
**Points:** 5

**User Story:**
作为系统
我需要将 ParsedTree 转换为基础 HTML 结构
以便生成页面骨架

**Acceptance Criteria:**
- [ ] 遍历 ParsedTree 生成 HTML 元素
- [ ] 使用语义化标签（header, nav, main, section, footer）
- [ ] 生成完整的 HTML 文档结构（DOCTYPE, html, head, body）
- [ ] 设置 meta 标签（viewport, charset）
- [ ] 使用 Prettier 格式化 HTML
- [ ] 添加基本注释（标注主要区块）

**Technical Notes:**
- 使用模板字符串生成 HTML
- Prettier 配置：2 空格缩进，单引号

**Dependencies:** STORY-003

---

### STORY-005: Flexbox 布局规则引擎

**Epic:** EPIC-002
**Priority:** Must Have
**Points:** 5

**User Story:**
作为系统
我需要将 DSL 布局转换为 Flexbox CSS
以便实现灵活布局

**Acceptance Criteria:**
- [ ] 识别 Flex 容器和子元素（根据 DSL 布局类型）
- [ ] 生成 display: flex 相关属性
- [ ] 处理 flex-direction (row, column)
- [ ] 处理 justify-content, align-items
- [ ] 处理 flex-wrap 和 gap
- [ ] 处理 flex-grow, flex-shrink, flex-basis

**Technical Notes:**
- 规则库在 src/modules/rule-engine/layout-rules.ts
- 使用查找表（Map）存储规则

**Dependencies:** STORY-004

---

### STORY-006: Grid 布局规则引擎

**Epic:** EPIC-002
**Priority:** Must Have
**Points:** 5

**User Story:**
作为系统
我需要将 DSL 布局转换为 Grid CSS
以便实现复杂网格布局

**Acceptance Criteria:**
- [ ] 识别 Grid 容器和子元素
- [ ] 生成 display: grid 相关属性
- [ ] 处理 grid-template-columns/rows
- [ ] 处理 grid-gap (row-gap, column-gap)
- [ ] 处理 grid-area 和对齐

**Technical Notes:**
- 支持 fr 单位和 repeat()
- 处理隐式网格

**Dependencies:** STORY-004

---

### STORY-007: 响应式断点生成

**Epic:** EPIC-002
**Priority:** Must Have
**Points:** 5

**User Story:**
作为系统
我需要生成响应式 Media Queries
以便支持多种屏幕尺寸

**Acceptance Criteria:**
- [ ] 定义断点（mobile: 375px, tablet: 768px, desktop: 1920px）
- [ ] 生成 @media 查询
- [ ] 为不同断点生成不同的布局规则
- [ ] 测试多断点还原度（3 个断点）

**Technical Notes:**
- 使用 min-width 策略（mobile-first）
- 断点配置可调整

**Dependencies:** STORY-005, STORY-006

---

### STORY-008: 定位规则引擎

**Epic:** EPIC-002
**Priority:** Must Have
**Points:** 3

**User Story:**
作为系统
我需要处理绝对定位和相对定位
以便精确还原元素位置

**Acceptance Criteria:**
- [ ] 处理 absolute, relative, fixed, sticky 定位
- [ ] 生成 top, left, right, bottom 属性
- [ ] 处理 z-index 层级
- [ ] 处理定位上下文（containing block）

**Technical Notes:**
- 优先使用 Flex/Grid，必要时使用 absolute

**Dependencies:** STORY-004

---

### STORY-009: UI 模式识别引擎

**Epic:** EPIC-002
**Priority:** Must Have
**Points:** 8

**User Story:**
作为系统
我需要识别常见 UI 模式
以便生成交互组件

**Acceptance Criteria:**
- [ ] 识别手风琴模式（多个可折叠面板）
- [ ] 识别标签页模式（多个可切换内容区）
- [ ] 识别轮播图模式（横向滚动容器）
- [ ] 识别下拉菜单模式（悬停展开）
- [ ] 为识别的模式生成 JavaScript 交互代码
- [ ] 组件在响应式布局下正常工作
- [ ] 无法识别的模式降级为静态 HTML

**Technical Notes:**
- 基于规则的模式匹配（不使用 AI）
- 生成原生 JavaScript（无框架依赖）
- 模式识别规则在 src/modules/pattern-recognizer/patterns.ts

**Dependencies:** STORY-004, STORY-005

---

### STORY-010: 语义化类名生成器

**Epic:** EPIC-002
**Priority:** Must Have
**Points:** 3

**User Story:**
作为工程师
我需要生成的 CSS 类名语义化
以便理解和修改代码

**Acceptance Criteria:**
- [ ] 根据元素类型生成类名（.hero-section, .cta-button）
- [ ] 避免无意义的类名（.div-1, .container-2）
- [ ] 处理类名冲突（添加后缀）
- [ ] 支持 BEM 风格类名（可选）

**Technical Notes:**
- 类名生成规则：{type}-{semantic-name}
- 例如：hero-section, product-card, cta-button

**Dependencies:** STORY-004

---

### STORY-011: CSS 样式规则引擎

**Epic:** EPIC-003
**Priority:** Must Have
**Points:** 8

**User Story:**
作为系统
我需要将 DSL 样式转换为 CSS
以便还原视觉效果

**Acceptance Criteria:**
- [ ] 颜色转换（background, color, border-color, rgba/hex）
- [ ] 字体转换（font-family, size, weight, line-height, letter-spacing）
- [ ] 边框转换（border, border-radius）
- [ ] 阴影转换（box-shadow, text-shadow, 多层阴影）
- [ ] 渐变转换（linear-gradient, radial-gradient）
- [ ] 透明度和混合模式（opacity, mix-blend-mode）
- [ ] 间距转换（margin, padding）

**Technical Notes:**
- 样式规则库在 src/modules/rule-engine/style-rules.ts
- 支持 CSS 变量（--primary-color）

**Dependencies:** STORY-004

---

### STORY-012: CSS 动画转换

**Epic:** EPIC-003
**Priority:** Must Have
**Points:** 5

**User Story:**
作为系统
我需要将 DSL 动画转换为 CSS 动画
以便还原动态效果

**Acceptance Criteria:**
- [ ] 过渡效果（transition: property duration timing-function）
- [ ] CSS 动画（@keyframes, animation）
- [ ] 缓动函数转换（ease, ease-in, ease-out, cubic-bezier）
- [ ] 动画时长和延迟（duration, delay）
- [ ] 复杂动画降级为简单效果

**Technical Notes:**
- 支持常见动画：fade, slide, scale
- 生成 @keyframes 规则

**Dependencies:** STORY-011

---

### STORY-013: 图片资源处理

**Epic:** EPIC-003
**Priority:** Must Have
**Points:** 3

**User Story:**
作为系统
我需要处理图片资源
以便正确显示图片

**Acceptance Criteria:**
- [ ] 从 MasterGo 获取图片 URL
- [ ] 生成 `<img>` 标签（src, alt, width, height）
- [ ] 处理图片尺寸和裁剪（object-fit）
- [ ] 支持背景图片（background-image, background-size）
- [ ] 生成有意义的 alt 属性

**Technical Notes:**
- 图片 URL 可能是 MasterGo CDN 或外部链接
- 支持 lazy loading（loading="lazy"）

**Dependencies:** STORY-004

---

### STORY-014: 图标处理

**Epic:** EPIC-003
**Priority:** Should Have
**Points:** 3

**User Story:**
作为系统
我需要处理图标
以便显示 UI 图标

**Acceptance Criteria:**
- [ ] 支持 SVG 图标（inline SVG）
- [ ] 支持图标字体（可选，如 Font Awesome）
- [ ] 处理图标尺寸和颜色

**Technical Notes:**
- 优先使用 SVG（更灵活）
- 图标可以是 MasterGo 导出的 SVG

**Dependencies:** STORY-013

---

### STORY-015: 外部 CSS 文件生成

**Epic:** EPIC-003
**Priority:** Must Have
**Points:** 2

**User Story:**
作为工程师
我需要生成外部 CSS 文件
以便代码可维护

**Acceptance Criteria:**
- [ ] 将所有 CSS 规则写入外部文件（output.css）
- [ ] 不使用内联样式（style 属性）
- [ ] CSS 文件使用 Prettier 格式化
- [ ] 添加必要的注释（/* Hero Section */）
- [ ] HTML 中正确引用 CSS 文件（<link rel="stylesheet">）

**Technical Notes:**
- CSS 文件命名：output-{layerId}.css
- 按模块组织 CSS（布局、样式、动画）

**Dependencies:** STORY-011

---

### STORY-016: 输出文件管理

**Epic:** EPIC-004
**Priority:** Must Have
**Points:** 3

**User Story:**
作为用户
我需要系统管理输出文件
以便避免混淆

**Acceptance Criteria:**
- [ ] 检测 Layer ID 变化（对比上次输入）
- [ ] 自动删除旧输出文件（HTML, CSS, JS, 报告）
- [ ] 写入最终 HTML/CSS/JS 文件到 output/ 目录
- [ ] 生成输出报告（JSON 格式，包含元数据）
- [ ] 提供手动清理命令（--clean）

**Technical Notes:**
- 输出文件命名：output-{layerId}.html
- 报告文件：report-{layerId}.json

**Dependencies:** STORY-015

---

### STORY-017: 还原度评估引擎

**Epic:** EPIC-004
**Priority:** Must Have
**Points:** 8

**User Story:**
作为系统
我需要评估生成的 HTML 还原度
以便验证质量

**Acceptance Criteria:**
- [ ] 使用 Playwright 对生成的 HTML 截图（Chromium）
- [ ] 获取 MasterGo 设计稿截图（从 API 或本地）
- [ ] 使用 pixelmatch 计算像素差异
- [ ] 计算还原度百分比（0-100%，100% = 完全一致）
- [ ] 生成差异热力图（PNG 图片）
- [ ] 支持多断点评估（mobile, tablet, desktop）
- [ ] 分析差异区域（布局、样式、响应式）

**Technical Notes:**
- Playwright 配置：headless mode, viewport 设置
- pixelmatch 阈值：0.1（允许轻微差异）
- 评分算法：score = (1 - mismatchedPixels / totalPixels) × 100

**Dependencies:** STORY-016

---

### STORY-018: 自动优化循环

**Epic:** EPIC-004
**Priority:** Must Have
**Points:** 8

**User Story:**
作为系统
我需要自动优化生成结果
以便达到 85% 还原度

**Acceptance Criteria:**
- [ ] 分析评估诊断结果（Diagnostic[]）
- [ ] 根据问题类型选择修复策略（FixStrategy[]）
- [ ] 调整规则引擎参数（如增加间距、调整定位）
- [ ] 触发重新生成（回到 HTML Generator）
- [ ] 控制迭代次数（最多 3-5 次）
- [ ] 如果达到 85%，输出最终 HTML
- [ ] 如果迭代后仍 < 85%，输出当前最佳版本 + 诊断报告
- [ ] 记录优化历史（每次迭代的 score 和调整）

**Technical Notes:**
- 修复策略库：layoutFixStrategies, styleFixStrategies
- 策略示例：adjustFlexGap(+2px), adjustPadding(+4px)
- 选择最佳版本：max(scores)

**Dependencies:** STORY-017

---

### STORY-019: 本地预览服务器

**Epic:** EPIC-004
**Priority:** Should Have
**Points:** 3

**User Story:**
作为用户
我想在浏览器中预览生成的 HTML
以便验证效果

**Acceptance Criteria:**
- [ ] 启动本地 HTTP 服务器（http-server 或 express）
- [ ] 自动在 Chrome 中打开预览（使用 open 包）
- [ ] 支持热刷新（可选，使用 chokidar 监听文件变化）
- [ ] 预览 URL：http://localhost:3000

**Technical Notes:**
- 使用 http-server 包（简单）
- 或使用 express（更灵活）

**Dependencies:** STORY-016

---

## Sprint Allocation

### Sprint 1 (Weeks 1-2) - 63/68 points

**Goal:** 建立完整的 DSL → HTML 转换管道，实现基础布局和样式生成

**Stories:**
1. STORY-000: 项目基础设施搭建 (3 点)
2. STORY-001: MasterGo API 客户端 (5 点)
3. STORY-002: DSL Schema 验证 (3 点)
4. STORY-003: DSL 树解析器 (5 点)
5. STORY-004: 基础 HTML 生成器 (5 点)
6. STORY-005: Flexbox 布局规则引擎 (5 点)
7. STORY-006: Grid 布局规则引擎 (5 点)
8. STORY-007: 响应式断点生成 (5 点)
9. STORY-008: 定位规则引擎 (3 点)
10. STORY-010: 语义化类名生成器 (3 点)
11. STORY-011: CSS 样式规则引擎 (8 点)
12. STORY-012: CSS 动画转换 (5 点)
13. STORY-013: 图片资源处理 (3 点)
14. STORY-015: 外部 CSS 文件生成 (2 点)
15. STORY-016: 输出文件管理 (3 点)

**Total:** 63 点 / 68 容量 (93% 利用率)

**Deliverables:**
- 完整的 DSL → HTML 转换工具
- 支持 Flex/Grid 布局
- 支持响应式设计
- 生成语义化、可维护的代码

**Risks:**
- 规则引擎复杂度可能超出预期
- MasterGo API 文档可能不完整
- 响应式布局还原度可能需要调优

**Dependencies:**
- MasterGo API 访问权限
- 测试用的设计稿样本（至少 3 个不同复杂度）

---

### Sprint 2 (Weeks 3-4) - 30/68 points

**Goal:** 完成 UI 模式识别、质量评估和自动优化循环，达到 MVP 目标（85% 还原度）

**Stories:**
1. STORY-009: UI 模式识别引擎 (8 点)
2. STORY-014: 图标处理 (3 点)
3. STORY-017: 还原度评估引擎 (8 点)
4. STORY-018: 自动优化循环 (8 点)
5. STORY-019: 本地预览服务器 (3 点)

**Total:** 30 点 / 68 容量 (44% 利用率)

**Deliverables:**
- UI 模式识别和交互组件生成
- 自动化质量评估（截图对比）
- 自动优化循环（迭代提升还原度）
- 本地预览功能
- **MVP 完成，验证 85% 还原度目标**

**Risks:**
- 还原度评估算法可能需要调优
- 自动优化策略可能需要多次迭代
- UI 模式识别规则可能不完整

**Dependencies:**
- Sprint 1 的所有功能完成
- Playwright 和 pixelmatch 库集成
- 多个测试设计稿用于验证

**Sprint 2 额外时间用途：**
- 完善测试覆盖率（目标 80%+）
- 性能优化
- 文档完善（README, API 文档）
- Bug 修复和代码审查
- 准备 MVP 演示

---

## Epic Traceability

| Epic ID | Epic Name | Stories | Total Points | Sprint |
|---------|-----------|---------|--------------|--------|
| Infrastructure | 项目基础设施 | STORY-000 | 3 | 1 |
| EPIC-001 | DSL 数据获取和解析 | STORY-001, 002, 003 | 13 | 1 |
| EPIC-002 | HTML 结构和布局生成 | STORY-004, 005, 006, 007, 008, 009, 010 | 39 | 1-2 |
| EPIC-003 | 样式和视觉效果 | STORY-011, 012, 013, 014, 015 | 21 | 1-2 |
| EPIC-004 | 输出管理和质量验证 | STORY-016, 017, 018, 019 | 22 | 1-2 |

**Total:** 5 Epics, 20 Stories, 98 Points (adjusted)

---

## Functional Requirements Coverage

| FR ID | FR Name | Story | Sprint |
|-------|---------|-------|--------|
| FR-001 | MasterGo API 获取 | STORY-001 | 1 |
| FR-002 | DSL 解析 | STORY-002, 003 | 1 |
| FR-003 | 输出管理 | STORY-016 | 1 |
| FR-004 | HTML 生成 | STORY-004 | 1 |
| FR-005 | 响应式布局 | STORY-005, 006, 007, 008 | 1 |
| FR-006 | UI 模式识别 | STORY-009 | 2 |
| FR-007 | CSS 样式 | STORY-011 | 1 |
| FR-008 | 动画转换 | STORY-012 | 1 |
| FR-009 | 资源处理 | STORY-013, 014 | 1-2 |
| FR-010 | 完整 HTML 输出 | STORY-015 | 1 |
| FR-011 | 本地预览 | STORY-019 | 2 |
| FR-012 | 还原度评估 | STORY-017 | 2 |
| FR-013 | 自动优化循环 | STORY-018 | 2 |

**Coverage:** 13/13 FRs (100%)

---

## Risks and Mitigation

### High Risks

**Risk 1: 还原度无法达到 85%**
- **Likelihood:** Medium
- **Impact:** High（项目核心目标）
- **Mitigation:**
  - Sprint 1 尽早实现基础转换，快速验证
  - Sprint 2 专注优化和迭代
  - 准备多个测试设计稿，覆盖不同复杂度
  - 与设计团队紧密合作，明确还原度评估标准

**Risk 2: MasterGo API 限制或变化**
- **Likelihood:** Low
- **Impact:** High
- **Mitigation:**
  - 尽早测试 API 访问
  - 设计灵活的 API 客户端，易于适配
  - 与 MasterGo 保持沟通

### Medium Risks

**Risk 3: 规则引擎复杂度超出预期**
- **Likelihood:** Medium
- **Impact:** Medium
- **Mitigation:**
  - 采用迭代方式，先支持常见场景
  - 使用查找表和规则库，易于扩展
  - 充分的单元测试

**Risk 4: 团队资源不足**
- **Likelihood:** Low（2-3 人团队）
- **Impact:** Medium
- **Mitigation:**
  - Sprint 2 容量较低，留有缓冲
  - 优先完成 Must Have 故事
  - Should Have 故事可延后

---

## Dependencies

### External Dependencies
- **MasterGo API**：必须可用且稳定
- **MasterGo API 密钥**：需要申请访问权限
- **测试设计稿**：需要设计团队提供 3-5 个测试样本

### Technical Dependencies
- **Node.js**：v18+ (LTS)
- **TypeScript**：v4.9+
- **Playwright**：浏览器自动化
- **pixelmatch**：图像对比

### Internal Dependencies
- 所有 Sprint 2 故事依赖 Sprint 1 完成
- STORY-017, 018 依赖完整的转换管道

---

## Definition of Done

For a story to be considered complete:

- [ ] **Code implemented** and committed to main branch
- [ ] **Unit tests** written and passing (≥80% coverage for the module)
- [ ] **Integration tests** passing (if applicable)
- [ ] **Code reviewed** and approved by at least 1 team member
- [ ] **Documentation** updated (README, inline comments)
- [ ] **Linting** passed (ESLint)
- [ ] **Type checking** passed (TypeScript)
- [ ] **Acceptance criteria** validated (all checkboxes checked)
- [ ] **No known bugs** or blockers

---

## Team Capacity

**Team Size:** 2-3 developers (avg 2.5)
**Sprint Length:** 2 weeks (10 workdays)
**Experience Level:** Senior (6 productive hours/day, 1 point = 2 hours)

**Capacity Calculation:**
```
Total hours = 2.5 developers × 10 days × 6 hours/day = 150 hours
Sprint capacity = 150 hours ÷ 2 hours/point = 75 points
Buffer (10%) = 75 × 0.9 = 67.5 ≈ 68 points/sprint
```

**Velocity Tracking:**
- Sprint 1 velocity: TBD (will be measured)
- Sprint 2 velocity: TBD
- Rolling average: TBD

---

## Next Steps

**Immediate:** Begin Sprint 1

**Option 1: Create detailed story documents**
```bash
/create-story STORY-000
```

**Option 2: Start implementing immediately**
```bash
/dev-story STORY-000
```

**Recommended:** Start with STORY-000 (项目基础设施搭建) to set up the development environment.

---

**Sprint Cadence:**
- **Sprint Planning:** Monday Week 1 (Sprint start)
- **Daily Standups:** Every morning (15 min)
- **Sprint Review:** Friday Week 2 (Demo to stakeholders)
- **Sprint Retrospective:** Friday Week 2 (Team reflection)
- **Next Sprint Planning:** Monday Week 3

---

**This plan was created using BMAD Method v6 - Phase 4 (Implementation Planning)**

*To continue: Run `/dev-story STORY-000` to begin implementation.*
