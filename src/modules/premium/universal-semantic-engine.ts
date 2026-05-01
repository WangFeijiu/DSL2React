import { MasterGoNode } from '../parser/mastergo-dsl-adapter';
import { FeatureExtractor, NodeFeatures } from './feature-extractor';
import { SemanticInferencer, SemanticType } from './semantic-inferencer';

export interface SemanticNode {
  id: string;
  type: SemanticType;
  confidence: number;
  features: NodeFeatures;
  children: SemanticNode[];
  originalNode: MasterGoNode;
}

export interface UniversalSemanticData {
  root: SemanticNode;
  byType: Record<SemanticType, SemanticNode[]>;
  patterns: Map<number, SemanticNode[]>;
}

export class UniversalSemanticEngine {
  private featureExtractor: FeatureExtractor;
  private semanticInferencer: SemanticInferencer;
  private styles: Record<string, any>;

  constructor(rootNode: MasterGoNode, styles: Record<string, any>) {
    this.styles = styles;
    this.featureExtractor = new FeatureExtractor(rootNode, styles);
    this.semanticInferencer = new SemanticInferencer();
  }

  analyze(rootNode: MasterGoNode): UniversalSemanticData {
    const root = this.analyzeNode(rootNode, 0, 0, 1);
    const byType = this.groupByType(root);
    const patterns = this.groupByPattern(root);

    return { root, byType, patterns };
  }

  private analyzeNode(
    node: MasterGoNode,
    depth: number,
    siblingIndex: number,
    siblingCount: number
  ): SemanticNode {
    const features = this.featureExtractor.extractFeatures(node, depth, siblingIndex, siblingCount);
    const inference = this.semanticInferencer.infer(features);

    const children: SemanticNode[] = [];
    if (node.children) {
      node.children.forEach((child: MasterGoNode, index: number) => {
        children.push(
          this.analyzeNode(child, depth + 1, index, node.children!.length)
        );
      });
    }

    return {
      id: node.id,
      type: inference.type,
      confidence: inference.confidence,
      features,
      children,
      originalNode: node
    };
  }

  private groupByType(root: SemanticNode): Record<SemanticType, SemanticNode[]> {
    const groups: Record<SemanticType, SemanticNode[]> = {} as Record<SemanticType, SemanticNode[]>;

    const traverse = (node: SemanticNode) => {
      if (!groups[node.type]) {
        groups[node.type] = [];
      }
      groups[node.type].push(node);

      node.children.forEach(child => traverse(child));
    };

    traverse(root);
    return groups;
  }

  private groupByPattern(root: SemanticNode): Map<number, SemanticNode[]> {
    const patterns = new Map<number, SemanticNode[]>();

    const traverse = (node: SemanticNode) => {
      if (node.features.isInRepeatingPattern && node.features.patternGroupId !== null) {
        const groupId = node.features.patternGroupId;
        if (!patterns.has(groupId)) {
          patterns.set(groupId, []);
        }
        patterns.get(groupId)!.push(node);
      }

      node.children.forEach(child => traverse(child));
    };

    traverse(root);
    return patterns;
  }
}

