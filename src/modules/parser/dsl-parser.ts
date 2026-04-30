import { RawDSL, ElementNode, ParsedTree, LayoutInfo, StyleInfo } from '../../types/dsl-schema';
import { DSLValidator } from './dsl-validator';

export class DSLParser {
  private validator: DSLValidator;
  private maxDepth = 20;

  constructor() {
    this.validator = new DSLValidator();
  }

  /**
   * Parse raw DSL data into structured tree
   */
  parse(rawData: any, fileId: string, layerId: string): ParsedTree {
    // Validate first
    const validatedData = this.validator.validate(rawData);

    // Build tree
    const root = this.parseNode(validatedData, 0);

    return {
      root,
      metadata: {
        fileId,
        layerId,
        parsedAt: new Date(),
        version: validatedData.version,
      },
    };
  }

  /**
   * Recursively parse a node and its children
   */
  private parseNode(node: RawDSL, depth: number): ElementNode {
    if (depth > this.maxDepth) {
      throw new Error(`Maximum nesting depth (${this.maxDepth}) exceeded`);
    }

    const elementNode: ElementNode = {
      id: node.id,
      type: this.inferElementType(node),
      name: node.name,
      layout: this.extractLayout(node),
      styles: this.extractStyles(node),
      children: [],
    };

    // Extract content for text and image nodes
    if (node.characters) {
      elementNode.content = {
        type: 'text',
        value: node.characters,
      };
    }

    // Parse children recursively
    if (node.children && node.children.length > 0) {
      elementNode.children = node.children.map((child: any) =>
        this.parseNode(child, depth + 1)
      );
    }

    return elementNode;
  }

  /**
   * Infer element type from DSL node
   */
  private inferElementType(
    node: RawDSL
  ): 'container' | 'text' | 'image' | 'button' | 'icon' | 'input' | 'group' {
    const type = node.type.toUpperCase();

    if (type === 'TEXT') return 'text';
    if (type === 'RECTANGLE' && node.fills?.length) {
      // Check if it's an image fill
      const hasImageFill = node.fills.some((fill: any) => fill.type === 'IMAGE');
      if (hasImageFill) return 'image';
    }
    if (type === 'FRAME' || type === 'GROUP') {
      // Check if it looks like a button (has text + background)
      if (this.looksLikeButton(node)) return 'button';
      return node.type === 'FRAME' ? 'container' : 'group';
    }
    if (type === 'VECTOR' || type === 'BOOLEAN_OPERATION') return 'icon';
    if (type === 'INSTANCE') return 'container';

    return 'container'; // Default
  }

  /**
   * Check if node looks like a button
   */
  private looksLikeButton(node: RawDSL): boolean {
    if (!node.children) return false;

    const hasText = node.children.some((child: any) => child.type === 'TEXT');
    const hasBackground = node.fills && node.fills.length > 0;

    return hasText && hasBackground;
  }

  /**
   * Extract layout information
   */
  private extractLayout(node: RawDSL): LayoutInfo {
    const layout: LayoutInfo = {
      position: {
        x: node.x ?? 0,
        y: node.y ?? 0,
      },
      size: {
        width: node.width ?? 0,
        height: node.height ?? 0,
      },
    };

    // Infer positioning (simplified for now)
    if (node.x !== undefined && node.y !== undefined) {
      layout.positioning = 'absolute';
    }

    // Infer display type based on children
    if (node.children && node.children.length > 0) {
      layout.display = 'flex'; // Default to flex for containers
    } else {
      layout.display = 'block';
    }

    return layout;
  }

  /**
   * Extract style information
   */
  private extractStyles(node: RawDSL): StyleInfo {
    const styles: StyleInfo = {};

    // Extract colors from fills
    if (node.fills && node.fills.length > 0) {
      styles.colors = {
        background: this.extractColor(node.fills[0]),
      };
    }

    // Extract borders from strokes
    if (node.strokes && node.strokes.length > 0) {
      styles.borders = node.strokes.map((stroke: any) => ({
        width: stroke.strokeWeight || 1,
        style: 'solid',
        color: this.extractColor(stroke),
      }));

      if (styles.colors) {
        styles.colors.border = this.extractColor(node.strokes[0]);
      }
    }

    // Extract shadows from effects
    if (node.effects && node.effects.length > 0) {
      styles.shadows = node.effects
        .filter((effect: any) => effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW')
        .map((effect: any) => ({
          x: effect.offset?.x || 0,
          y: effect.offset?.y || 0,
          blur: effect.radius || 0,
          spread: effect.spread || 0,
          color: this.extractColor(effect),
        }));
    }

    // Extract typography from style
    if (node.style) {
      styles.typography = {
        fontFamily: node.style.fontFamily || 'sans-serif',
        fontSize: node.style.fontSize || 16,
        fontWeight: node.style.fontWeight || 400,
        lineHeight: node.style.lineHeightPx || node.style.fontSize || 16,
        letterSpacing: node.style.letterSpacing,
      };

      if (styles.colors && node.style.fills?.[0]) {
        styles.colors.text = this.extractColor(node.style.fills[0]);
      }
    }

    // Extract opacity
    if (node.style?.opacity !== undefined) {
      styles.opacity = node.style.opacity;
    }

    return styles;
  }

  /**
   * Extract color from fill/stroke object
   */
  private extractColor(colorObj: any): string {
    if (!colorObj || !colorObj.color) return '#000000';

    const { r, g, b, a } = colorObj.color;

    // Convert to hex or rgba
    if (a !== undefined && a < 1) {
      return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${a})`;
    }

    const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}
