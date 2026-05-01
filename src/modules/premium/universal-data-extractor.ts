import { MasterGoNode, MasterGoDSL } from '../parser/mastergo-dsl-adapter';
import { UniversalSemanticEngine, SemanticNode } from './universal-semantic-engine';
import { SemanticType } from './semantic-inferencer';

export interface UniversalExtractedData {
  header: SemanticNode | null;
  navigation: SemanticNode[];
  hero: SemanticNode | null;
  sections: SemanticNode[];
  cards: SemanticNode[];
  tags: SemanticNode[];
  tabs: SemanticNode[];
  buttons: SemanticNode[];
  footer: SemanticNode | null;
  allNodes: SemanticNode[];
}

export class UniversalDataExtractor {
  private engine: UniversalSemanticEngine;
  private styles: Record<string, any>;
  private rootNode: MasterGoNode;

  constructor(dsl: MasterGoDSL) {
    this.styles = dsl.dsl.styles;
    this.rootNode = dsl.dsl.nodes[0];
    this.engine = new UniversalSemanticEngine(this.rootNode, this.styles);
  }

  extract(): UniversalExtractedData {
    const semanticData = this.engine.analyze(this.rootNode);

    const byType = semanticData.byType;

    // Filter out background layers (LAYER type with no children and no text)
    const filterBackgrounds = (nodes: SemanticNode[]) => {
      return nodes.filter(n => {
        const node = n.originalNode;
        if (node.type === 'LAYER' && (!node.children || node.children.length === 0)) {
          return false;
        }
        return true;
      });
    };

    return {
      header: filterBackgrounds(byType.HEADER || [])[0] || null,
      navigation: filterBackgrounds(byType.NAVIGATION || []),
      hero: filterBackgrounds(byType.HERO || [])[0] || null,
      sections: filterBackgrounds(byType.SECTION || []),
      cards: filterBackgrounds(byType.CARD || []),
      tags: byType.TAG || [],
      tabs: byType.TAB || [],
      buttons: byType.BUTTON || [],
      footer: filterBackgrounds(byType.FOOTER || [])[0] || null,
      allNodes: this.flattenNodes(semanticData.root)
    };
  }

  private flattenNodes(root: SemanticNode): SemanticNode[] {
    const result: SemanticNode[] = [root];
    root.children.forEach((child: SemanticNode) => {
      result.push(...this.flattenNodes(child));
    });
    return result;
  }

  getTextContent(node: SemanticNode): string {
    return this.extractText(node.originalNode);
  }

  private extractText(node: MasterGoNode): string {
    let text = '';

    // MasterGo DSL stores text in node.text array
    if (node.type === 'TEXT' && node.text && Array.isArray(node.text)) {
      node.text.forEach((textSegment: any) => {
        if (textSegment.text) {
          text += textSegment.text;
        }
      });
    }

    // Fallback for standard DSL format
    if (node.type === 'TEXT' && (node as any).characters) {
      text += (node as any).characters;
    }

    if (node.children) {
      node.children.forEach((child: MasterGoNode) => {
        text += this.extractText(child);
      });
    }
    return text;
  }
}
