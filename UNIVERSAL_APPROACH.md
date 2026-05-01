# Premium 转换器通用化改进方案

## 🎯 目标

创建一个**完全通用**的 DSL to HTML 转换器，不依赖任何硬编码的坐标、尺寸或结构假设。

## ❌ 当前问题

### 硬编码的部分

1. **y 坐标范围**
   ```typescript
   if (y < 150) regions.header = child;  // 假设 Header 总在 y<150
   if (y >= 1100 && y < 1800) regions.cases = child;  // 假设 Cases 在这个范围
   ```

2. **节点结构假设**
   ```typescript
   if (children.length === 4) {  // 假设产品卡片总是 4 个子节点
   ```

3. **尺寸假设**
   ```typescript
   if (w < 150 && h < 60) {  // 假设 Tag 是这个尺寸
   ```

## ✅ 通用化策略

### 策略 1: 基于相对位置，而不是绝对坐标

**原则**: 使用相对关系而不是绝对数值

```typescript
// ❌ 硬编码
if (y < 150) return 'HEADER';

// ✅ 通用
function isHeader(node, siblings, parent) {
  // Header 特征：
  // 1. 在所有兄弟节点的最上方
  // 2. 宽度接近父容器宽度
  // 3. 高度相对较小
  const isTopmost = siblings.every(s => s === node || node.y < s.y);
  const isFullWidth = node.width / parent.width > 0.9;
  const isShort = node.height / parent.height < 0.1;
  
  return isTopmost && isFullWidth && isShort;
}
```

### 策略 2: 基于模式识别，而不是结构假设

**原则**: 识别重复模式，而不是假设固定结构

```typescript
// ❌ 硬编码
if (children.length === 4) {
  // 假设是产品卡片
}

// ✅ 通用：识别重复模式
function findRepeatingPatterns(nodes) {
  // 1. 按相似度聚类
  const clusters = clusterBySimilarity(nodes);
  
  // 2. 识别重复出现的模式
  const patterns = clusters.filter(c => c.length >= 3);
  
  // 3. 分析模式的结构
  return patterns.map(pattern => ({
    type: inferPatternType(pattern),  // Card, List, Grid, etc.
    items: pattern
  }));
}

function clusterBySimilarity(nodes) {
  // 基于以下特征聚类：
  // - 尺寸相似度
  // - 子节点数量
  // - 子节点类型分布
  // - 布局相似度
}
```

### 策略 3: 基于语义特征，而不是尺寸

**原则**: 使用多个特征组合判断，而不是单一尺寸

```typescript
// ❌ 硬编码
if (w < 150 && h < 60) return 'TAG';

// ✅ 通用：多特征判断
function inferNodeType(node, context) {
  const features = extractFeatures(node, context);
  
  // Tag 的特征：
  // - 小尺寸（相对于父容器）
  // - 圆角
  // - 短文本
  // - 与其他相似节点水平排列
  if (features.isSmallRelative &&
      features.hasRoundedCorners &&
      features.hasShortText &&
      features.isHorizontallyAligned) {
    return 'TAG';
  }
  
  // Card 的特征：
  // - 包含图片
  // - 包含标题和价格
  // - 与其他相似节点形成网格
  if (features.hasImage &&
      features.hasTitleAndPrice &&
      features.isInGrid) {
    return 'CARD';
  }
  
  return 'GENERIC';
}
```

### 策略 4: 基于关系分析

**原则**: 分析节点之间的关系，而不是孤立判断

```typescript
// 分析节点关系
function analyzeRelationships(nodes) {
  return {
    // 空间关系
    spatial: {
      horizontalGroups: findHorizontallyAlignedGroups(nodes),
      verticalGroups: findVerticallyAlignedGroups(nodes),
      grids: findGridPatterns(nodes)
    },
    
    // 层级关系
    hierarchy: {
      containers: findContainerNodes(nodes),
      leafNodes: findLeafNodes(nodes)
    },
    
    // 相似性关系
    similarity: {
      clusters: clusterBySimilarity(nodes),
      repeatingPatterns: findRepeatingPatterns(nodes)
    }
  };
}
```

## 🔧 实现步骤

### Step 1: 特征提取器

```typescript
class FeatureExtractor {
  extract(node, context) {
    return {
      // 相对特征（不是绝对值）
      relativeSize: {
        widthRatio: node.width / context.containerWidth,
        heightRatio: node.height / context.containerHeight
      },
      
      // 位置特征（相对位置）
      relativePosition: {
        isTop: this.isInTopRegion(node, context),
        isBottom: this.isInBottomRegion(node, context),
        isLeft: this.isInLeftRegion(node, context),
        isRight: this.isInRightRegion(node, context)
      },
      
      // 内容特征
      content: {
        hasImage: this.hasImage(node),
        hasText: this.hasText(node),
        textLength: this.getTextLength(node),
        hasPrice: this.hasPrice(node)
      },
      
      // 样式特征
      style: {
        hasRoundedCorners: this.hasRoundedCorners(node),
        hasShadow: this.hasShadow(node),
        backgroundColor: this.getBackgroundColor(node)
      },
      
      // 关系特征
      relationships: {
        siblingCount: context.siblings.length,
        childCount: node.children.length,
        isAlignedWithSiblings: this.isAligned(node, context.siblings)
      }
    };
  }
}
```

### Step 2: 模式识别器

```typescript
class PatternRecognizer {
  recognize(nodes) {
    // 1. 识别重复模式
    const repeatingPatterns = this.findRepeatingPatterns(nodes);
    
    // 2. 识别布局模式
    const layoutPatterns = this.findLayoutPatterns(nodes);
    
    // 3. 识别组件模式
    const componentPatterns = this.findComponentPatterns(nodes);
    
    return {
      repeatingPatterns,
      layoutPatterns,
      componentPatterns
    };
  }
  
  findRepeatingPatterns(nodes) {
    // 基于相似度聚类
    const clusters = this.clusterBySimilarity(nodes);
    
    // 过滤出重复出现的模式（至少 3 个）
    return clusters.filter(c => c.length >= 3);
  }
  
  clusterBySimilarity(nodes) {
    // 计算节点之间的相似度
    // 基于：尺寸、子节点结构、内容类型等
    // 使用聚类算法（如 DBSCAN）
  }
}
```

### Step 3: 语义推断器

```typescript
class SemanticInferencer {
  infer(node, features, patterns) {
    // 基于特征和模式推断语义类型
    
    // Header: 顶部 + 全宽 + 矮
    if (features.relativePosition.isTop &&
        features.relativeSize.widthRatio > 0.9 &&
        features.relativeSize.heightRatio < 0.1) {
      return 'HEADER';
    }
    
    // Card: 在重复模式中 + 有图片 + 有价格
    if (this.isInRepeatingPattern(node, patterns) &&
        features.content.hasImage &&
        features.content.hasPrice) {
      return 'CARD';
    }
    
    // Tag: 小尺寸 + 圆角 + 短文本 + 水平排列
    if (features.relativeSize.widthRatio < 0.15 &&
        features.style.hasRoundedCorners &&
        features.content.textLength < 20 &&
        features.relationships.isAlignedWithSiblings) {
      return 'TAG';
    }
    
    // Grid: 多个相似元素 + 规则排列
    if (this.isInGridPattern(node, patterns)) {
      return 'GRID_ITEM';
    }
    
    return 'GENERIC';
  }
}
```

### Step 4: 布局推断器

```typescript
class LayoutInferencer {
  inferLayout(nodes, patterns) {
    // 从绝对定位推断出语义化布局
    
    // 识别 Flex 布局
    if (this.isFlexLayout(nodes)) {
      return {
        type: 'flex',
        direction: this.inferFlexDirection(nodes),
        gap: this.inferGap(nodes)
      };
    }
    
    // 识别 Grid 布局
    if (this.isGridLayout(nodes)) {
      return {
        type: 'grid',
        columns: this.inferColumnCount(nodes),
        gap: this.inferGap(nodes)
      };
    }
    
    // 默认���持绝对定位
    return { type: 'absolute' };
  }
  
  isFlexLayout(nodes) {
    // 检查节点是否在一条线上排列
    return this.isHorizontallyAligned(nodes) ||
           this.isVerticallyAligned(nodes);
  }
  
  isGridLayout(nodes) {
    // 检查节点是否形成规则的网格
    const rows = this.groupByRows(nodes);
    const cols = this.groupByColumns(nodes);
    
    // 网格特征：多行多列，每行/列元素数量相近
    return rows.length >= 2 && cols.length >= 2 &&
           this.hasConsistentCounts(rows) &&
           this.hasConsistentCounts(cols);
  }
}
```

## 📊 完整流程

```
MasterGo DSL
    ↓
特征提取
  - 提取每个节点的特征（相对的，不是绝对的）
  - 分析节点之间的关系
    ↓
模式识别
  - 识别重复模式（产品卡片、推荐项等）
  - 识别布局模式（Grid、Flex 等）
  - 识别组件模式（Header、Hero 等）
    ↓
语义推断
  - 基于特征和模式推断语义类型
  - 不依赖硬编码的规则
    ↓
布局推断
  - 从绝对定位推断出语义化布局
  - 选择合适的布局策略（Flex/Grid）
    ↓
语义化渲染
  - 生成语义化 HTML
  - 添加动画和交互
    ↓
Premium HTML
```

## 🎯 关键原则

1. **相对而不是绝对** - 使用比例和相对位置，不用绝对坐标
2. **模式而不是假设** - 识别实际存在的模式，不假设固定结构
3. **特征组合而不是单一条件** - 使用多个特征综合判断
4. **关系而不是孤立** - 分析节点之间的关系
5. **推断而不是硬编码** - 从数据中推断规律

## 📝 示例对比

### ❌ 硬编码方式
```typescript
if (y < 150) return 'HEADER';
if (y >= 1100 && y < 1800) return 'CASES';
if (children.length === 4) return 'CARD';
```

### ✅ 通用方式
```typescript
const features = extractFeatures(node, context);
const patterns = recognizePatterns(allNodes);
const semantic = inferSemantic(node, features, patterns);
```

## 🚀 下一步

1. 实现 FeatureExtractor
2. 实现 PatternRecognizer
3. 实现 SemanticInferencer
4. 实现 LayoutInferencer
5. 集成到 Premium 转换器
6. 测试多个不同的设计稿
