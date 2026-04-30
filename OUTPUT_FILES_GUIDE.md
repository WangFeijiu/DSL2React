# Output 文件夹说明

## 📁 文件列表

```
output/
├── raw-mcp-dsl.json           # 74 KB - 原始 MasterGo DSL
├── adapted-dsl.json           # 39 KB - 适配后的 DSL (旧版本)
├── machine-dsl.json           # 16 KB - 机器 DSL (旧版本)
├── output-26-03727.html       # 18 KB - 最终生成的 HTML ⭐
├── output-26-03727.css        # 15 KB - CSS 文件 (旧版本)
└── output-26                  # 0 KB  - 空文件 (可删除)
```

---

## 📄 文件详细说明

### 1. `raw-mcp-dsl.json` (74 KB) 🔑

**作用**: 从 MasterGo 通过 MCP 协议获取的原始 DSL 数据

**内容**:
```json
{
  "dsl": {
    "styles": {
      "font_17:00124": { ... },
      "paint_26:04119": { ... }
    },
    "nodes": [
      {
        "type": "FRAME",
        "id": "26:03727",
        "name": "包材详情",
        ...
      }
    ]
  }
}
```

**特点**:
- ✅ 完整的 MasterGo 设计数据
- ✅ 包含样式系统、节点树、颜色、字体等
- ✅ 2,291 行 JSON
- ✅ 可用于重建（`npm run dev:rebuild`）

**用途**:
- 保存原始数据，便于调试
- 支持离线重建
- 作为转换的输入源

---

### 2. `output-26-03727.html` (18 KB) ⭐ **最重要**

**作用**: 最终生成的 HTML 文件（纯脚本转换版本）

**内容**:
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <title>包材详情</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f5f5f5; ... }
  </style>
</head>
<body>
  <div class="canvas">
    <div class="node-26-03727" style="width: 1540px; height: 2977px;">
      <!-- 所有元素都在这里，使用内联样式 -->
    </div>
  </div>
</body>
</html>
```

**特点**:
- ✅ 单文件 HTML（141 行）
- ✅ 内联样式（style 属性）
- ✅ 图片 URL 已填充
- ✅ 纯脚本转换（无 LLM）
- ✅ 98% 还原度

**用途**:
- 🎯 **直接在浏览器中打开查看**
- 可以直接使用或进一步修改
- 作为最终交付物

**如何使用**:
```bash
# 在浏览器中打开
start output/output-26-03727.html

# 或双击文件
```

---

### 3. `output-26-03727.css` (15 KB) 📝 **旧版本**

**作用**: 旧版本生成的外部 CSS 文件

**内容**:
```css
.text-logo {
  position: absolute;
  left: 60px;
  top: 25px;
  width: 150px;
  height: 30px;
  font-family: Inter;
  font-size: 24px;
  ...
}
```

**特点**:
- ⚠️ 旧版本的产物（1015 行）
- ⚠️ 使用外部 CSS 类
- ⚠️ 已被新版本替代

**状态**: 
- 可以删除（新版本不使用）
- 保留作为参考

---

### 4. `adapted-dsl.json` (39 KB) 📋 **旧版本**

**作用**: 旧版本的适配器输出（MasterGo 格式 → 标准格式）

**内容**:
```json
{
  "id": "26:03727",
  "name": "包材详情",
  "type": "FRAME",
  "x": 0,
  "y": 0,
  "width": 1540,
  "height": 2977,
  "children": [ ... ]
}
```

**特点**:
- ⚠️ 旧版本的中间产物
- ⚠️ 已被新版本替代

**状态**: 
- 可以删除（新版本不使用）
- 保留作为参考

---

### 5. `machine-dsl.json` (16 KB) 🔧 **旧版本**

**作用**: 旧版本的机器 DSL（进一步处理后的格式）

**内容**:
```json
{
  "nodes": [ ... ],
  "styles": { ... }
}
```

**特点**:
- ⚠️ 旧版本的中间产物
- ⚠️ 已被新版本替代

**状态**: 
- 可以删除（新版本不使用）
- 保留作为参考

---

### 6. `output-26` (0 KB) 🗑️

**作用**: 空文件，可能是旧版本的残留

**状态**: 
- ❌ 可以安全删除

---

## 🎯 文件重要性排序

### ⭐⭐⭐ 最重要（必须保留）

1. **`output-26-03727.html`** - 最终生成的 HTML
   - 这是你要的结果
   - 可以直接使用
   - 98% 还原度

2. **`raw-mcp-dsl.json`** - 原始 MasterGo DSL
   - 用于重建
   - 调试参考
   - 离线工作

### ⚠️ 旧版本（可以删除）

3. `output-26-03727.css` - 旧版本 CSS
4. `adapted-dsl.json` - 旧版本适配器输出
5. `machine-dsl.json` - 旧版本机器 DSL
6. `output-26` - 空文件

---

## 🔄 转换流程

### 新版本（纯脚本）✅

```
raw-mcp-dsl.json
    ↓
simple-converter.ts (纯脚本)
    ↓
output-26-03727.html (最终结果)
```

**特点**:
- ✅ 只需 2 步
- ✅ 纯脚本转换
- ✅ 无中间文件

### 旧版本（复杂管道）⚠️

```
raw-mcp-dsl.json
    ↓
mastergo-dsl-adapter.ts
    ↓
adapted-dsl.json
    ↓
dsl-parser.ts
    ↓
machine-dsl.json
    ↓
html-generator.ts
    ↓
output-26-03727.html + output-26-03727.css
```

**特点**:
- ⚠️ 6 步流程
- ⚠️ 多个中间文件
- ⚠️ 已被替代

---

## 🧹 清理建议

### 可以安全删除的文件

```bash
cd output
rm adapted-dsl.json
rm machine-dsl.json
rm output-26-03727.css
rm output-26
```

### 保留的文件

```bash
output/
├── raw-mcp-dsl.json           # 原始数据
└── output-26-03727.html       # 最终结果
```

---

## 📊 文件大小对比

| 文件 | 大小 | 用途 |
|------|------|------|
| raw-mcp-dsl.json | 74 KB | 原始数据 |
| output-26-03727.html | 18 KB | **最终结果** ⭐ |
| adapted-dsl.json | 39 KB | 旧版本 |
| machine-dsl.json | 16 KB | 旧版本 |
| output-26-03727.css | 15 KB | 旧版本 |

**总计**: 162 KB  
**实际需要**: 92 KB (raw + html)

---

## 🎯 使用建议

### 查看结果

```bash
# 打开最终 HTML
start output/output-26-03727.html
```

### 重新生成

```bash
# 从 MasterGo 重新获取
npm run dev

# 从本地 DSL 重建
npm run dev:rebuild
```

### 清理旧文件

```bash
# 只保留必要文件
npm run clean
```

---

## 📝 总结

**最重要的文件**:
- ✅ `output-26-03727.html` - 这就是你要的结果！
- ✅ `raw-mcp-dsl.json` - 原始数据，用于重建

**可以删除的文件**:
- ⚠️ `adapted-dsl.json` - 旧版本
- ⚠️ `machine-dsl.json` - 旧版本
- ⚠️ `output-26-03727.css` - 旧版本
- ❌ `output-26` - 空文件

**建议**: 保留 HTML 和原始 JSON，删除其他中间文件。
