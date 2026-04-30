# Product Requirements Document: DSL2React

**Date:** 2026-04-30
**Author:** Project Owner
**Version:** 1.0
**Project Type:** library
**Project Level:** 2
**Status:** Draft

---

## Document Overview

This Product Requirements Document (PRD) defines the functional and non-functional requirements for DSL2React. It serves as the source of truth for what will be built and provides traceability from requirements through implementation.

**Related Documents:**
- Product Brief: `docs/product-brief-DSL2React-2026-04-30.md`

---

## Executive Summary

DSL2React 是一个从设计到代码的自动化转换工具，将 MasterGo 设计稿（通过 DSL.json）转换为高还原度的 HTML 和 React 代码。

**MVP 目标**：验证 DSL → HTML 转换能否达到 85% 还原度，这是项目可行性的关键指标。

**核心价值**：将落地页开发时间从 1-2 天缩短到 2-3 小时，实现 80-90% 的效率提升。

**时间线**：1 个月内完成 MVP 验证（2026-05-30 前）。

---

## Product Goals

### Business Objectives

1. **验证技术可行性**：MVP 阶段验证 DSL → HTML 转换能否达到 85% 还原度
2. **提升开发效率**：将落地页开发时间从 1-2 天降低到 2-3 小时
3. **支持业务增长**：为即将到来的流量投放提供快速页面产出能力
4. **提高代码质量**：通过自动化生成保证代码的一致性和可维护性

### Success Metrics

- **还原度**：HTML 还原度达到 85% 以上（核心指标）
- **开发时间**：落地页开发时间从 1-2 天降至 2-3 小时
- **页面产出量**：支持每月快速生成大量落地页
- **代码质量**：生成代码的可读性和可维护性达标
- **团队采用率**：前端团队满意度和工具使用率

---

## Functional Requirements

Functional Requirements (FRs) define **what** the system does - specific features and behaviors.

Each requirement includes:
- **ID**: Unique identifier (FR-001, FR-002, etc.)
- **Priority**: Must Have / Should Have / Could Have (MoSCoW)
- **Description**: What the system should do
- **Acceptance Criteria**: How to verify it's complete

---

### FR-001: 通过 MasterGo API 获取设计稿数据

**Priority:** Must Have

**Description:**
系统通过 MasterGo API 自动获取单个 Layer 的 DSL 数据。支持通过 MasterGo 链接或 File ID + Layer ID 输入，使用 API 密钥认证。

**Acceptance Criteria:**
- [ ] 从 `.env` 文件读取 MasterGo API 密钥
- [ ] 支持 UI 界面输入并覆盖 `.env` 配置
- [ ] 一次只处理一个 Layer 的数据
- [ ] 解析 MasterGo 链接提取 File ID 和 Layer ID
- [ ] 或直接接受 File ID + Layer ID 输入
- [ ] 成功拉取 DSL 数据
- [ ] API 失败时返回清晰错误（网络、认证、文件不存在等）

**Dependencies:** MasterGo API 可用

---

### FR-002: 解析 DSL 数据结构

**Priority:** Must Have

**Description:**
系统解析从 MasterGo 获取的 DSL 数据，提取所有必需的设计元素信息。

**Acceptance Criteria:**
- [ ] 验证 DSL 数据格式正确性
- [ ] 提取布局信息（容器、定位、尺寸）
- [ ] 提取样式信息（颜色、字体、边框、阴影等）
- [ ] 提取文本内容和属性
- [ ] 提取图片、图标资源引用
- [ ] 提取动画和交互状态信息
- [ ] 对无效或不完整的 DSL 数据返回详细错误

**Dependencies:** FR-001

---

### FR-003: 输出产物管理

**Priority:** Must Have

**Description:**
当 Layer ID 或配置信息更新时，系统自动清理之前生成的输出产物，避免混淆。

**Acceptance Criteria:**
- [ ] 检测 Layer ID 变化
- [ ] 检测配置文件关键参数变化
- [ ] 自动删除旧的输出文件（HTML、资源等）
- [ ] 提示用户输出已清理
- [ ] 提供手动清理输出的命令/按钮

**Dependencies:** FR-001

---

### FR-004: 生成语义化 HTML 结构

**Priority:** Must Have

**Description:**
将 DSL 元素转换为语义化 HTML，使用合适的 HTML5 标签。

**Acceptance Criteria:**
- [ ] 基础元素映射（容器、文本、图片、按钮）
- [ ] 使用语义标签（`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`）
- [ ] HTML 结构清晰、符合 W3C 标准
- [ ] 生成的代码可读性好

**Dependencies:** FR-002

---

### FR-005: 响应式布局转换

**Priority:** Must Have (核心功能)

**Description:**
将 MasterGo 中的响应式设计转换为 HTML/CSS 响应式布局，这直接影响还原度和用户体验。

**Acceptance Criteria:**
- [ ] 支持 Flexbox 布局转换
- [ ] 支持 Grid 布局转换
- [ ] 支持多断点响应式（移动端、平板、桌面）
- [ ] 正确转换元素的定位（absolute, relative, fixed, sticky）
- [ ] 处理元素的对齐、间距��换行
- [ ] 生成 CSS Media Queries
- [ ] 在不同屏幕尺寸下保持设计意图
- [ ] 响应式布局还原度达到 85%+

**Dependencies:** FR-002, FR-004

---

### FR-006: UI 模式识别和组件化

**Priority:** Must Have

**Description:**
智能识别常见的 UI 模式（手风琴、标签页、轮播图、下拉菜单、模态框等），生成对应的交互组件而不是静态 HTML。

**Acceptance Criteria:**
- [ ] 识别手风琴模式并生成可交互组件
- [ ] 识别标签页模式并生成切换逻辑
- [ ] 识别轮播图模式并生成滑动组件
- [ ] 识别下拉菜单并生成交互逻辑
- [ ] 生成的组件包含必要的 JavaScript 交互
- [ ] 组件在响应式布局下正常工作
- [ ] 无法识别的模式降级为静态 HTML

**Dependencies:** FR-002, FR-004, FR-005

---

### FR-007: CSS 样式生成

**Priority:** Must Have

**Description:**
将 MasterGo 的视觉样式转换为 CSS，确保高还原度。

**Acceptance Criteria:**
- [ ] 颜色（背景色、文字色、边框色、渐变）
- [ ] 字体（字体族、大小、粗细、行高、字间距、字体样式）
- [ ] 边框（宽度、样式、颜色、圆角）
- [ ] 阴影（box-shadow、text-shadow、多层阴影）
- [ ] 透明度和混合模式
- [ ] 间距（margin、padding）
- [ ] 生成外部 CSS 文件，类名语义化
- [ ] 样式还原度贡献到整体 85% 目标

**Dependencies:** FR-002, FR-004

---

### FR-008: 动画效果转换

**Priority:** Must Have

**Description:**
将 MasterGo 中的动画效果转换为 CSS 动画或过渡效果。

**Acceptance Criteria:**
- [ ] 支持基础过渡效果（hover、active 状态）
- [ ] 支持 CSS 动画（淡入淡出、滑动、缩放）
- [ ] 支持关键帧动画
- [ ] 动画时长、缓动函数正确转换
- [ ] 复杂动画降级为静态或简单效果

**Dependencies:** FR-002, FR-007

---

### FR-009: 图片和图标处理

**Priority:** Must Have

**Description:**
正确处理设计稿中���图片和图标资源。

**Acceptance Criteria:**
- [ ] 从 MasterGo 获取图片资源 URL
- [ ] 生成正确的 `<img>` 标签，包含 src、alt 属性
- [ ] 支持图标（SVG 或图标字体）
- [ ] 处理图片的尺寸、位置、裁剪
- [ ] 支持背景图片（background-image）
- [ ] 图片路径正确，能够正常加载

**Dependencies:** FR-001, FR-002, FR-004

---

### FR-010: 生成完整的 HTML 文件

**Priority:** Must Have

**Description:**
输出完整、可独立运行的 HTML 文件。

**Acceptance Criteria:**
- [ ] 生成包含完整 HTML 结构的文件（`<!DOCTYPE>`, `<html>`, `<head>`, `<body>`）
- [ ] 引入必要的 CSS 文件
- [ ] 引入必要的 JavaScript（如果有交互组件）
- [ ] 设置正确的 meta 标签（viewport、charset）
- [ ] 文件可以直接在浏览器中打开并正常显示
- [ ] 输出文件命名清晰（如 `output-{layer-id}.html`）

**Dependencies:** FR-004, FR-005, FR-006, FR-007, FR-008, FR-009

---

### FR-011: 本地预览

**Priority:** Should Have

**Description:**
提供便捷的方式在浏览器中预览生成的 HTML。

**Acceptance Criteria:**
- [ ] 提供命令或按钮启动本地预览服务器
- [ ] 自动在 Chrome 浏览器中打开预览
- [ ] 支持热刷新（文件更新后自动刷新）
- [ ] 预览 URL 清晰（如 `http://localhost:3000`）

**Dependencies:** FR-010

---

### FR-012: 还原度评估工具

**Priority:** Must Have

**Description:**
提供自动化的还原度评估工具，通过截图像素对比来量化生成的 HTML 与原设计稿的相似度。

**Acceptance Criteria:**
- [ ] 自动获取 MasterGo 设计稿的截图（或从 API 获取预览图）
- [ ] 自动对生成的 HTML 在 Chrome 中截图
- [ ] 使用图像对比算法计算像素差异（如 pixelmatch、resemblejs）
- [ ] 输出相似度百分比（0-100%）
- [ ] 生成可视化对比报告（高亮差异区域）
- [ ] 支持多个断点的响应式对比（移动端、平板、桌面）
- [ ] 相似度 ≥ 85% 视为通过验证

**Dependencies:** FR-010

---

### FR-013: 自动质量优化循环

**Priority:** Must Have

**Description:**
在最终输出 HTML 之前，系统自动使用还原度评估工具进行自我检查，如果未达到 85% 标准，自动诊断问题并重新生成，形成迭代优化闭环。

**Acceptance Criteria:**
- [ ] 每次生成后自动触发还原度评估
- [ ] 如果还原度 < 85%，分析差异区域（布局、样式、响应式等）
- [ ] 根据诊断结果调整生成参数或策略
- [ ] 自动重新生成并再次评估
- [ ] 支持最多 3-5 次迭代优化
- [ ] 如果达到 85%，输出最终 HTML
- [ ] 如果迭代后仍 < 85%，输出当前最佳版本 + 详细诊断报告
- [ ] 记录优化过程和每次迭代的还原度变化

**Dependencies:** FR-012

---

## Non-Functional Requirements

Non-Functional Requirements (NFRs) define **how** the system performs - quality attributes and constraints.

---

### NFR-001: 还原度标准

**Priority:** Must Have (核心指标)

**Description:**
生成的 HTML 必须达到 85% 以上的视觉还原度，这是项目可行性的关键指标。

**Acceptance Criteria:**
- [ ] 布局还原度 ≥ 85%（位置、尺寸、间距）
- [ ] 样式还原度 ≥ 85%（颜色、字体、边框、阴影）
- [ ] 响应式行为还原度 ≥ 85%（不同屏幕尺寸下的表现）
- [ ] 提供还原度评估工具或方法（视觉对比、像素差异等）
- [ ] 对于无法达到 85% 的设计，给出明确的不支持提示

**Rationale:**
这是 MVP 的核心验证目标，低于 85% 项目无继续价值。

---

### NFR-002: 性能要求

**Priority:** Should Have

**Description:**
系统应该具备基本的性能，但不作为 MVP 的核心验证指标。

**Acceptance Criteria:**
- [ ] 系统能够在合理时间内完成转换（无明显卡顿）
- [ ] 生成的 HTML 页面能够正常加载和显示

**Rationale:**
MVP 阶段专注还原度验证，性能优化在后续版本进行。

---

### NFR-003: 浏览器兼容性

**Priority:** Must Have

**Description:**
生成的 HTML 必须在 Chrome 浏览器中正确显示。

**Acceptance Criteria:**
- [ ] 在最新版 Chrome 浏览器中完美显示
- [ ] 支持 Chrome 最近 2 个主要版本
- [ ] 不要求支持其他浏览器（Safari、Firefox、Edge）

**Rationale:**
MVP 只支持 Chrome，降低开发复杂度。

---

### NFR-004: 安全性

**Priority:** Could Have

**Description:**
API 密钥的安全存储在 MVP 阶段不作为重点。

**Acceptance Criteria:**
- [ ] 基本的密钥存储（.env 文件）
- [ ] 不在日志中打印密钥

**Rationale:**
MVP 阶段专注核心功能验证，安全加固在后续版本。

---

### NFR-005: 代码质量和可维护性

**Priority:** Must Have

**Description:**
生成的 HTML/CSS 代码必须能够被前端工程师理解和修改，这是实际使用的前提。

**Acceptance Criteria:**
- [ ] HTML 结构清晰，有适当的缩进和格式化
- [ ] CSS 类名语义化且易懂（如 `.hero-section`, `.cta-button`）
- [ ] 避免过度复杂的嵌套结构
- [ ] 使用外部 CSS 文件，不使用内联样式
- [ ] 代码注释标注主要区块和复杂逻辑
- [ ] 前端工程师能够在 30 分钟内理解代码结构并进行修改

**Rationale:**
如果生成的代码无法被理解和修改，工具就失去了实用价值。

---

### NFR-006: 错误处理和可靠性

**Priority:** Must Have

**Description:**
系统应该能够优雅地处理错误，给出清晰的提示。

**Acceptance Criteria:**
- [ ] API 调用失败时给出明确错误信息（网络错误、认证失败、文件不存在）
- [ ] DSL 解析失败时指出具体问题位置
- [ ] 不支持的设计元素给出警告，但不中断整个转换
- [ ] 错误信息对用户友好，包含可能的解决方案
- [ ] 系统不会因为单个元素转换失败而崩溃

**Rationale:**
良好的错误处理提升开发体验，帮助快速定位问题。

---

### NFR-007: 易用性

**Priority:** Should Have

**Description:**
工具应该易于使用，降低学习成本。

**Acceptance Criteria:**
- [ ] 提供清晰的配置说明文档
- [ ] 命令行界面（如果有）提供帮助信息
- [ ] UI 界面（如果有）直观易懂
- [ ] 输入验证，防止常见错误（如无效的 URL 格式）
- [ ] 转换过程有进度提示

**Rationale:**
降低使用门槛，提高团队采用率。

---

## Epics

Epics are logical groupings of related functionality that will be broken down into user stories during sprint planning (Phase 4).

Each epic maps to multiple functional requirements and will generate 2-10 stories.

---

### EPIC-001: DSL 数据获取和解析

**Description:**
建立从 MasterGo 获取设计稿数据并解析为可用结构的能力。这是整个转换流程的基础。

**Functional Requirements:**
- FR-001: 通过 MasterGo API 获取设计稿数据
- FR-002: 解析 DSL 数据结构

**Story Count Estimate:** 3-5 stories

**Priority:** Must Have

**Business Value:**
没有这个 Epic，无法获取设计数据，整个工具无法运行。这是第一个必须完成的模块。

---

### EPIC-002: HTML 结构和布局生成

**Description:**
将解析后的 DSL 数据转换为语义化的 HTML 结构，支持响应式布局和常见 UI 模式识别。这是还原度的核心。

**Functional Requirements:**
- FR-004: 生成语义化 HTML 结构
- FR-005: 响应式布局转换
- FR-006: UI 模式识别和组件化

**Story Count Estimate:** 6-8 stories

**Priority:** Must Have

**Business Value:**
这是还原度的最大贡献者，直接影响 85% 目标能否达成。布局和结构的准确性是视觉还原的基础。

---

### EPIC-003: 样式和视觉效果

**Description:**
实现视觉样式的精确转换，包括 CSS 样式、动画效果和资源处理，确保视觉还原度。

**Functional Requirements:**
- FR-007: CSS 样式生成
- FR-008: 动画效果转换
- FR-009: 图片和图标处理

**Story Count Estimate:** 5-7 stories

**Priority:** Must Have

**Business Value:**
完成视觉还原的最后一环，让生成的 HTML 在外观上与设计稿高度一致。

---

### EPIC-004: 输出管理和质量验证

**Description:**
管理输出产物，提供预览能力，并通过自动化评估和优化循环确保输出的 HTML 达到 85% 还原度标准。

**Functional Requirements:**
- FR-003: 输出产物管理
- FR-010: 生成完整的 HTML 文件
- FR-011: 本地预览
- FR-012: 还原度评估工具
- FR-013: 自动质量优化��环

**Story Count Estimate:** 6-8 stories

**Priority:** Must Have

**Business Value:**
不仅输出 HTML，更确保输出的 HTML 达到质量标准。这是 MVP 成功的关键保障，大大提高了 85% 还原度目标的达成率。

---

## User Stories (High-Level)

User stories follow the format: "As a [user type], I want [goal] so that [benefit]."

Detailed user stories will be created during Phase 4 (Sprint Planning) when epics are broken down into implementable tasks.

**Placeholder:** User stories will be defined in `/sprint-planning` workflow.

---

## User Personas

### Primary Persona: 前端开发工程师

**Profile:**
- 熟悉 React 开发
- 对组件库有丰富经验
- 技术能力强，追求代码质量

**Current Workflow:**
梳理设计稿 → 编写代码 → 调试上线

**Pain Points:**
- 大量时间花在重复性的设计稿还原工作上
- 手工编写代码容易出错，需要反复调试
- 响应式适配耗时

**Goals:**
- 快速将设计稿转换为代码
- 生成的代码质量高、可维护
- 节省时间专注于业务逻辑

### Secondary Persona: 设计师

**Profile:**
- 使用 MasterGo 创建设计稿
- 关注设计还原度和视觉效果
- 可能参与页面微调（未来版本）

**Goals:**
- 设计稿能够高质量还原
- 快速看到设计效果
- 减少与开发的沟通成本

---

## User Flows

### 核心工作流：从设计稿到 HTML

```
1. 配置 MasterGo API 密钥
   ↓
2. 输入 MasterGo 链接或 File ID + Layer ID
   ↓
3. 系统自动拉取 DSL 数据
   ↓
4. 解析 DSL 并生成初版 HTML
   ↓
5. 自动评估还原度
   ↓
6. 如果 < 85%：诊断问题 → 优化 → 重新生成 → 再次评估
   ↓
7. 如果 ≥ 85%：输出最终 HTML
   ↓
8. 本地预览验证
   ↓
9. 工程师审查和微调代码
   ↓
10. 部署到生产环境
```

### 错误处理流程

```
API 调用失败 → 显示错误信息 → 用户检查网络/密钥 → 重试

DSL 解析失败 → 指出问题位置 → 用户检查设计稿 → 修复后重试

还原度未达标 → 输出诊断报告 → 用户决定是否接受或调整设计
```

---

## Dependencies

### Internal Dependencies

- 无内部系统依赖（这是一个独立的工具）

### External Dependencies

- **MasterGo API**：必须可用且稳定，用于获取设计稿数据
- **图像对比库**：如 pixelmatch、resemblejs 或 looks-same，用于还原度评估
- **浏览器自动化工具**：如 Puppeteer 或 Playwright，用于截图和预览
- **Node.js 生态**：依赖 npm 包管理和 Node.js 运行环境

---

## Assumptions

- MasterGo 可以导出标准的 DSL.json 格式
- MasterGo API 稳定且文档完善
- 前端团队熟悉 React 和组件库开发
- 现有基础设施可以支持页面预览和部署
- 使用成熟的技术栈可以降低开发风险
- 85% 的还原度足以满足业务需求
- Chrome 浏览器的市场占有率足够高，暂不需要支持其他浏览器

---

## Out of Scope

**明确不在 MVP 范围内的功能：**

- ✗ 复杂的 JavaScript 交互逻辑
- ✗ 浏览器插件可视化微调功能
- ✗ 埋点和数据分析功能
- ✗ HTML → React 代码转换
- ✗ 外部组件库集成
- ✗ MasterGo MCP 直接集成（通过 API 即可）
- ✗ 表单验证和数据绑定
- ✗ Safari、Firefox、Edge 浏览器支持
- ✗ 批量转换多个设计稿
- ✗ 设计稿版本管理
- ✗ 团队协作功能

---

## Open Questions

目前无未解决的问题。所有关键决策已在产品简介和需求收集过程中明确。

---

## Approval & Sign-off

### Stakeholders

- **项目负责人** - 高影响力
  - 负责技术决策和项目推进
  
- **前端开发团队** - 高影响力
  - 主要使用者
  
- **设计团队** - 中等影响力
  - 提供设计稿
  
- **产品/运营团队** - 中等影响力
  - 业务需求方
  
- **技术负责人** - 高影响力
  - 审批技术方案

### Approval Status

- [ ] Product Owner
- [ ] Engineering Lead
- [ ] Design Lead
- [ ] QA Lead

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-30 | Project Owner | Initial PRD |

---

## Next Steps

### Phase 3: Architecture

Run `/architecture` to create system architecture based on these requirements.

The architecture will address:
- All functional requirements (FRs)
- All non-functional requirements (NFRs)
- Technical stack decisions
- Data models and APIs
- System components

### Phase 4: Sprint Planning

After architecture is complete, run `/sprint-planning` to:
- Break epics into detailed user stories
- Estimate story complexity
- Plan sprint iterations
- Begin implementation

---

**This document was created using BMAD Method v6 - Phase 2 (Planning)**

*To continue: Run `/workflow-status` to see your progress and next recommended workflow.*

---

## Appendix A: Requirements Traceability Matrix

| Epic ID | Epic Name | Functional Requirements | Story Count (Est.) |
|---------|-----------|-------------------------|-------------------|
| EPIC-001 | DSL 数据获取和解析 | FR-001, FR-002 | 3-5 |
| EPIC-002 | HTML 结构和布局生成 | FR-004, FR-005, FR-006 | 6-8 |
| EPIC-003 | 样式和视觉效果 | FR-007, FR-008, FR-009 | 5-7 |
| EPIC-004 | 输出管理和质量验证 | FR-003, FR-010, FR-011, FR-012, FR-013 | 6-8 |
| **Total** | **4 Epics** | **13 FRs** | **20-28 stories** |

---

## Appendix B: Prioritization Details

### Must Have (12 FRs, 7 NFRs)

**Functional Requirements:**
- FR-001: MasterGo API 获取
- FR-002: DSL 解析
- FR-003: 输出管理
- FR-004: HTML 生成
- FR-005: 响应式布局
- FR-006: UI 模式识别
- FR-007: CSS 样式
- FR-008: 动画转换
- FR-009: 资源处理
- FR-010: 完整 HTML 输出
- FR-012: 还原度评估
- FR-013: 自动优化循环

**Non-Functional Requirements:**
- NFR-001: 还原度标准（85%+）
- NFR-003: 浏览器兼容性（Chrome）
- NFR-005: 代码质量和可维护性
- NFR-006: 错误处理和可靠性

### Should Have (1 FR, 2 NFRs)

**Functional Requirements:**
- FR-011: 本地预览

**Non-Functional Requirements:**
- NFR-002: 性能要求
- NFR-007: 易用性

### Could Have (1 NFR)

**Non-Functional Requirements:**
- NFR-004: 安全性

### Summary

- **Total Requirements**: 13 FRs + 7 NFRs = 20 requirements
- **Must Have**: 12 FRs + 4 NFRs = 16 requirements (80%)
- **Should Have**: 1 FR + 2 NFRs = 3 requirements (15%)
- **Could Have**: 0 FRs + 1 NFR = 1 requirement (5%)

这个优先级分布合理，确保 MVP 专注于核心功能（还原度验证），同时保留了一些重要但非关键的功能。
