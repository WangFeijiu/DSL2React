import { MasterGoNode } from '../parser/mastergo-dsl-adapter';

export interface NodeFeatures {
  // Position features (relative, 0-1 range)
  relativeX: number;
  relativeY: number;
  relativeCenterX: number;
  relativeCenterY: number;

  // Size features (relative, 0-1 range)
  widthRatio: number;
  heightRatio: number;
  aspectRatio: number;
  areaRatio: number;

  // Boolean spatial features
  isTopRegion: boolean;
  isBottomRegion: boolean;
  isLeftAligned: boolean;
  isRightAligned: boolean;
  isCenterAligned: boolean;
  isFullWidth: boolean;
  isShort: boolean;
  isTall: boolean;

  // Content features
  hasText: boolean;
  hasImage: boolean;
  hasChildren: boolean;
  childCount: number;
  textLength: number;

  // Pattern features
  isInRepeatingPattern: boolean;
  patternGroupId: number | null;
  similarityScore: number;

  // Hierarchy features
  depth: number;
  siblingIndex: number;
  siblingCount: number;

  // Raw data for reference
  node: MasterGoNode;
}

export class FeatureExtractor {
  private containerWidth: number;
  private containerHeight: number;
  private allNodes: MasterGoNode[] = [];
  private styles: Record<string, any>;

  constructor(rootNode: MasterGoNode, styles: Record<string, any>) {
    this.styles = styles;
    this.containerWidth = rootNode.layoutStyle.width;
    this.containerHeight = rootNode.layoutStyle.height;
    this.collectAllNodes(rootNode);
  }

  private collectAllNodes(node: MasterGoNode): void {
    this.allNodes.push(node);
    if (node.children) {
      node.children.forEach((child: MasterGoNode) => this.collectAllNodes(child));
    }
  }

  extractFeatures(node: MasterGoNode, depth: number = 0, siblingIndex: number = 0, siblingCount: number = 1): NodeFeatures {
    const x = node.layoutStyle.relativeX || 0;
    const y = node.layoutStyle.relativeY || 0;
    const w = node.layoutStyle.width;
    const h = node.layoutStyle.height;

    const relX = x / this.containerWidth;
    const relY = y / this.containerHeight;
    const relCenterX = (x + w / 2) / this.containerWidth;
    const relCenterY = (y + h / 2) / this.containerHeight;

    const widthRatio = w / this.containerWidth;
    const heightRatio = h / this.containerHeight;
    const aspectRatio = w / h;
    const areaRatio = (w * h) / (this.containerWidth * this.containerHeight);

    const hasText = this.hasTextContent(node);
    const hasImage = this.hasImageContent(node);
    const textLength = this.getTextLength(node);

    const { isInPattern, groupId, similarity } = this.detectPattern(node);

    return {
      relativeX: relX,
      relativeY: relY,
      relativeCenterX: relCenterX,
      relativeCenterY: relCenterY,
      widthRatio,
      heightRatio,
      aspectRatio,
      areaRatio,
      isTopRegion: relY < 0.15,
      isBottomRegion: relY > 0.85,
      isLeftAligned: relX < 0.1,
      isRightAligned: relX > 0.9,
      isCenterAligned: relCenterX > 0.4 && relCenterX < 0.6,
      isFullWidth: widthRatio > 0.9,
      isShort: heightRatio < 0.1,
      isTall: heightRatio > 0.5,
      hasText,
      hasImage,
      hasChildren: !!node.children && node.children.length > 0,
      childCount: node.children?.length || 0,
      textLength,
      isInRepeatingPattern: isInPattern,
      patternGroupId: groupId,
      similarityScore: similarity,
      depth,
      siblingIndex,
      siblingCount,
      node
    };
  }

  private hasTextContent(node: MasterGoNode): boolean {
    if (node.type === 'TEXT') return true;
    if (node.children) {
      return node.children.some((child: MasterGoNode) => this.hasTextContent(child));
    }
    return false;
  }

  private hasImageContent(node: MasterGoNode): boolean {
    if (node.type === 'IMAGE') return true;
    if (node.fill && this.styles[node.fill]?.type === 'IMAGE') return true;
    if (node.children) {
      return node.children.some((child: MasterGoNode) => this.hasImageContent(child));
    }
    return false;
  }

  private getTextLength(node: MasterGoNode): number {
    let length = 0;

    // MasterGo DSL stores text in node.text array
    if (node.type === 'TEXT' && node.text && Array.isArray(node.text)) {
      node.text.forEach((textSegment: any) => {
        if (textSegment.text) {
          length += textSegment.text.length;
        }
      });
    }

    // Fallback for standard DSL format
    if (node.type === 'TEXT' && (node as any).characters) {
      length += (node as any).characters.length;
    }

    if (node.children) {
      node.children.forEach((child: MasterGoNode) => {
        length += this.getTextLength(child);
      });
    }
    return length;
  }

  private detectPattern(node: MasterGoNode): { isInPattern: boolean; groupId: number | null; similarity: number } {
    const similarNodes = this.findSimilarNodes(node);

    if (similarNodes.length >= 2) {
      const avgSimilarity = similarNodes.reduce((sum, n) => sum + n.score, 0) / similarNodes.length;
      return {
        isInPattern: true,
        groupId: this.getPatternGroupId(node, similarNodes),
        similarity: avgSimilarity
      };
    }

    return { isInPattern: false, groupId: null, similarity: 0 };
  }

  private findSimilarNodes(node: MasterGoNode): Array<{ node: MasterGoNode; score: number }> {
    const similar: Array<{ node: MasterGoNode; score: number }> = [];

    for (const other of this.allNodes) {
      if (other.id === node.id) continue;

      const score = this.calculateSimilarity(node, other);
      if (score > 0.7) {
        similar.push({ node: other, score });
      }
    }

    return similar;
  }

  private calculateSimilarity(node1: MasterGoNode, node2: MasterGoNode): number {
    let score = 0;
    let factors = 0;

    const w1 = node1.layoutStyle.width;
    const h1 = node1.layoutStyle.height;
    const w2 = node2.layoutStyle.width;
    const h2 = node2.layoutStyle.height;

    const sizeDiff = Math.abs(w1 - w2) / Math.max(w1, w2) + Math.abs(h1 - h2) / Math.max(h1, h2);
    score += (1 - sizeDiff / 2) * 0.3;
    factors += 0.3;

    if (node1.type === node2.type) {
      score += 0.2;
    }
    factors += 0.2;

    const childDiff = Math.abs((node1.children?.length || 0) - (node2.children?.length || 0));
    score += (1 - Math.min(childDiff / 5, 1)) * 0.2;
    factors += 0.2;

    if (node1.fill && node2.fill) {
      const style1 = this.styles[node1.fill];
      const style2 = this.styles[node2.fill];
      if (style1?.type === style2?.type) {
        score += 0.15;
      }
    }
    factors += 0.15;

    const y1 = node1.layoutStyle.relativeY || 0;
    const y2 = node2.layoutStyle.relativeY || 0;
    const yDiff = Math.abs(y1 - y2) / this.containerHeight;
    if (yDiff < 0.05) {
      score += 0.15;
    }
    factors += 0.15;

    return score / factors;
  }

  private getPatternGroupId(node: MasterGoNode, similarNodes: Array<{ node: MasterGoNode; score: number }>): number {
    const allNodesInGroup = [node, ...similarNodes.map(n => n.node)];
    const minId = Math.min(...allNodesInGroup.map(n => parseInt(n.id.split(':')[1] || '0')));
    return minId;
  }
}

