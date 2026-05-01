"""
DSL → Premium HTML 转换器（完全通用版）
核心原则：不使用任何硬编码的坐标、尺寸、文本列表
策略：基于相对特征 + 模式识别 + 关系分析
"""

from dataclasses import dataclass
from typing import List, Dict, Optional, Callable
import math


# ============================================================
# 特征提取器
# ============================================================
@dataclass
class NodeFeatures:
    """节点特征（全部是相对的，不是绝对的）"""
    # 相对位置（0-1）
    relative_x: float  # 相对于父容器的 x 位置比例
    relative_y: float  # 相对于父容器的 y 位置比例

    # 相对尺寸（0-1）
    width_ratio: float   # 宽度占父容器的比例
    height_ratio: float  # 高度占父容器的比例

    # 位置特征（布尔值）
    is_top_region: bool     # 是否在顶部区域（y < 0.15）
    is_bottom_region: bool  # 是否在底部区域（y > 0.85）
    is_full_width: bool     # 是否全宽（width_ratio > 0.9）
    is_narrow: bool         # 是否窄（width_ratio < 0.15）
    is_short: bool          # 是否矮（height_ratio < 0.1）
    is_tall: bool           # 是否高（height_ratio > 0.5）

    # 内容特征
    has_text: bool
    has_image: bool
    has_price: bool      # 文本包含 $ 符号
    has_number: bool     # 文本包含数字
    text_length: int

    # 样式特征
    has_rounded_corners: bool
    has_shadow: bool

    # 关系特征
    sibling_count: int
    child_count: int
    is_aligned_horizontally: bool  # 与兄弟节点水平对齐
    is_aligned_vertically: bool    # 与兄弟节点垂直对齐
    is_in_grid: bool               # 是否在网格中
    is_in_repeating_pattern: bool  # 是否��重复模式中
    similarity_score: float        # 与兄弟节点的相似度（0-1）


class FeatureExtractor:
    """特征提取器 - 提取节点的相对特征"""

    def extract(self, node: dict, context: dict) -> NodeFeatures:
        """
        提取节点特征
        context 包含：parent, siblings, container_size 等
        """
        layout = node.get('layoutStyle', {})
        x = layout.get('relativeX', 0) or 0
        y = layout.get('relativeY', 0) or 0
        w = layout.get('width', 0) or 0
        h = layout.get('height', 0) or 0

        # 获取容器尺寸
        container_w = context.get('container_width', 1540)
        container_h = context.get('container_height', 3000)

        # 计算相对特征
        rel_x = x / container_w if container_w > 0 else 0
        rel_y = y / container_h if container_h > 0 else 0
        w_ratio = w / container_w if container_w > 0 else 0
        h_ratio = h / container_h if container_h > 0 else 0

        # 位置特征
        is_top = rel_y < 0.15
        is_bottom = rel_y > 0.85
        is_full_width = w_ratio > 0.9
        is_narrow = w_ratio < 0.15
        is_short = h_ratio < 0.1
        is_tall = h_ratio > 0.5

        # 内容特征
        name = node.get('name', '')
        node_type = node.get('type', '')
        has_text = node_type == 'TEXT'
        has_image = bool(node.get('fill'))
        has_price = '$' in name
        has_number = any(c.isdigit() for c in name)
        text_length = len(name) if has_text else 0

        # 样式特征（简化版）
        has_rounded = 'radius' in str(node.get('style', {})).lower()
        has_shadow = 'shadow' in str(node.get('effects', {})).lower()

        # 关系特征
        siblings = context.get('siblings', [])
        children = node.get('children', [])

        sibling_count = len(siblings)
        child_count = len(children)

        # 对齐检测
        is_h_aligned = self._check_horizontal_alignment(node, siblings)
        is_v_aligned = self._check_vertical_alignment(node, siblings)

        # 网格检测
        is_in_grid = self._check_grid_pattern(node, siblings)

        # 重复模式检测
        is_repeating = self._check_repeating_pattern(node, siblings)

        # 相似度计算
        similarity = self._calculate_similarity(node, siblings)

        return NodeFeatures(
            relative_x=rel_x,
            relative_y=rel_y,
            width_ratio=w_ratio,
            height_ratio=h_ratio,
            is_top_region=is_top,
            is_bottom_region=is_bottom,
            is_full_width=is_full_width,
            is_narrow=is_narrow,
            is_short=is_short,
            is_tall=is_tall,
            has_text=has_text,
            has_image=has_image,
            has_price=has_price,
            has_number=has_number,
            text_length=text_length,
            has_rounded_corners=has_rounded,
            has_shadow=has_shadow,
            sibling_count=sibling_count,
            child_count=child_count,
            is_aligned_horizontally=is_h_aligned,
            is_aligned_vertically=is_v_aligned,
            is_in_grid=is_in_grid,
            is_in_repeating_pattern=is_repeating,
            similarity_score=similarity
        )

    def _check_horizontal_alignment(self, node: dict, siblings: List[dict]) -> bool:
        """检查是否与兄弟节点水平对齐"""
        if not siblings:
            return False

        y = node.get('layoutStyle', {}).get('relativeY', 0) or 0
        threshold = 10  # 10px 容差

        aligned_count = sum(
            1 for s in siblings
            if abs((s.get('layoutStyle', {}).get('relativeY', 0) or 0) - y) < threshold
        )

        return aligned_count >= 2  # 至少 2 个节点对齐

    def _check_vertical_alignment(self, node: dict, siblings: List[dict]) -> bool:
        """检查是否与兄弟节点垂直对齐"""
        if not siblings:
            return False

        x = node.get('layoutStyle', {}).get('relativeX', 0) or 0
        threshold = 10

        aligned_count = sum(
            1 for s in siblings
            if abs((s.get('layoutStyle', {}).get('relativeX', 0) or 0) - x) < threshold
        )

        return aligned_count >= 2

    def _check_grid_pattern(self, node: dict, siblings: List[dict]) -> bool:
        """检查是否在网格模式中"""
        if len(siblings) < 4:
            return False

        # 简化版：检查是否有多行多列
        # 实际实现需要更复杂的算法
        return len(siblings) >= 4

    def _check_repeating_pattern(self, node: dict, siblings: List[dict]) -> bool:
        """检查是否在重复模式中"""
        if len(siblings) < 3:
            return False

        # 检查是否有至少 3 个相似的兄弟节点
        similar_count = sum(
            1 for s in siblings
            if self._are_similar(node, s)
        )

        return similar_count >= 2  # 至少 2 个相似节点（加上自己就是 3 个）

    def _are_similar(self, node1: dict, node2: dict) -> bool:
        """判断两个节点是否相似"""
        if node1.get('id') == node2.get('id'):
            return False

        # 比较尺寸
        l1 = node1.get('layoutStyle', {})
        l2 = node2.get('layoutStyle', {})

        w1 = l1.get('width', 0) or 0
        h1 = l1.get('height', 0) or 0
        w2 = l2.get('width', 0) or 0
        h2 = l2.get('height', 0) or 0

        if w1 == 0 or w2 == 0:
            return False

        w_diff = abs(w1 - w2) / max(w1, w2)
        h_diff = abs(h1 - h2) / max(h1, h2)

        # 尺寸差异小于 20%
        if w_diff > 0.2 or h_diff > 0.2:
            return False

        # 比较子节点数量
        c1 = len(node1.get('children', []))
        c2 = len(node2.get('children', []))

        if c1 != c2:
            return False

        return True

    def _calculate_similarity(self, node: dict, siblings: List[dict]) -> float:
        """计算与兄弟节点的平均相似度"""
        if not siblings:
            return 0.0

        similarities = [
            1.0 if self._are_similar(node, s) else 0.0
            for s in siblings
        ]

        return sum(similarities) / len(similarities) if similarities else 0.0


# ============================================================
# 语义推断器（基于特征，不是硬编码）
# ============================================================
class SemanticInferencer:
    """
    语义推断器 - 基于特征推断语义类型
    不使用硬编码的坐标、尺寸、文本列表
    """

    # 语义规则：每个规则是一个函数，接收 NodeFeatures 返回置信度（0-1）
    SEMANTIC_RULES = {
        'HEADER': lambda f: (
            f.is_top_region * 0.4 +
            f.is_full_width * 0.3 +
            f.is_short * 0.3
        ),

        'BREADCRUMB': lambda f: (
            (1.0 if f.has_text and f.text_length < 50 else 0.0) * 0.5 +
            f.is_top_region * 0.3 +
            (1.0 if f.relative_y < 0.2 else 0.0) * 0.2
        ),

        'HERO_IMAGE': lambda f: (
            f.has_image * 0.4 +
            (1.0 if f.width_ratio > 0.3 and f.height_ratio > 0.3 else 0.0) * 0.3 +
            (1.0 if f.relative_y < 0.4 else 0.0) * 0.3
        ),

        'PRICE': lambda f: (
            f.has_price * 0.6 +
            f.has_text * 0.2 +
            (1.0 if f.text_length < 20 else 0.0) * 0.2
        ),

        'TAG': lambda f: (
            f.is_narrow * 0.3 +
            (1.0 if f.has_text and f.text_length < 20 else 0.0) * 0.3 +
            f.has_rounded_corners * 0.2 +
            f.is_aligned_horizontally * 0.2
        ),

        'CARD': lambda f: (
            f.is_in_repeating_pattern * 0.4 +
            (1.0 if f.child_count >= 3 else 0.0) * 0.3 +
            (1.0 if f.similarity_score > 0.5 else 0.0) * 0.3
        ),

        'GRID_ITEM': lambda f: (
            f.is_in_grid * 0.5 +
            f.is_in_repeating_pattern * 0.3 +
            (1.0 if f.similarity_score > 0.6 else 0.0) * 0.2
        ),
    }

    def infer(self, features: NodeFeatures, threshold: float = 0.5) -> str:
        """
        推断语义类型
        返回置信度最高且超过阈值的语义类型
        """
        scores = {}
        for semantic, rule_fn in self.SEMANTIC_RULES.items():
            score = rule_fn(features)
            if score >= threshold:
                scores[semantic] = score

        if not scores:
            return 'GENERIC'

        # 返回得分最高的语义类型
        return max(scores.items(), key=lambda x: x[1])[0]


# ============================================================
# 使用示例
# ============================================================
"""
使用方式：

1. 提取特征
extractor = FeatureExtractor()
features = extractor.extract(node, context={
    'container_width': 1540,
    'container_height': 3000,
    'siblings': siblings,
    'parent': parent
})

2. 推断语义
inferencer = SemanticInferencer()
semantic = inferencer.infer(features)

3. 根据语义渲染
if semantic == 'HEADER':
    render_header(node)
elif semantic == 'CARD':
    render_card(node)
"""
