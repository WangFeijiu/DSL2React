/**
 * MasterGo DSL Adapter
 * Converts MasterGo DSL format to our standard DSL format
 */

export interface MasterGoDSL {
  dsl: {
    styles: Record<string, any>;
    nodes: MasterGoNode[];
    [key: string]: any;
  };
}

export interface MasterGoNode {
  type: string;
  id: string;
  name: string;
  layoutStyle: {
    width: number;
    height: number;
    relativeX: number;
    relativeY: number;
  };
  fill?: string;
  strokeColor?: string;
  strokeType?: string;
  strokeAlign?: string;
  strokeWidth?: string;
  text?: any[];
  font?: string;
  children?: MasterGoNode[];
  [key: string]: any;
}

export interface StandardDSL {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  fills?: any[];
  strokes?: any[];
  children?: StandardDSL[];
  characters?: string;
  style?: any;
}

/**
 * Convert MasterGo DSL to Standard DSL format
 */
export function adaptMasterGoDSL(masterGoDSL: MasterGoDSL): StandardDSL {
  const { dsl } = masterGoDSL;
  const { styles, nodes } = dsl;

  if (!nodes || nodes.length === 0) {
    throw new Error('No nodes found in MasterGo DSL');
  }

  // Get the root node (first node)
  const rootNode = nodes[0];

  // Convert root node and its children
  return convertNode(rootNode, styles);
}

/**
 * Convert a single MasterGo node to Standard format
 */
function convertNode(node: MasterGoNode, styles: Record<string, any>): StandardDSL {
  const { id, name, type, layoutStyle, fill, strokeColor, text, font, children } = node;

  // Base node structure
  const standardNode: StandardDSL = {
    id,
    name,
    type: mapNodeType(type),
    x: layoutStyle.relativeX || 0,
    y: layoutStyle.relativeY || 0,
    width: layoutStyle.width || 0,
    height: layoutStyle.height || 0,
    visible: true,
  };

  // Convert fills
  if (fill) {
    const fillStyle = styles[fill];
    if (fillStyle) {
      standardNode.fills = convertFills(fillStyle.value);
    }
  }

  // Convert strokes
  if (strokeColor) {
    const strokeStyle = styles[strokeColor];
    if (strokeStyle) {
      standardNode.strokes = convertStrokes(strokeStyle.value, node);
    }
  }

  // Convert text
  if (type === 'TEXT' && text && text.length > 0) {
    standardNode.characters = extractTextContent(text);

    // Convert font style
    if (font) {
      const fontStyle = styles[font];
      if (fontStyle) {
        standardNode.style = convertFontStyle(fontStyle.value);
      }
    }
  }

  // Convert children recursively
  if (children && children.length > 0) {
    standardNode.children = children.map(child => convertNode(child, styles));
  }

  return standardNode;
}

/**
 * Map MasterGo node type to standard type
 */
function mapNodeType(type: string): string {
  const typeMap: Record<string, string> = {
    'FRAME': 'FRAME',
    'GROUP': 'GROUP',
    'LAYER': 'RECTANGLE',
    'TEXT': 'TEXT',
    'IMAGE': 'RECTANGLE',
  };

  return typeMap[type] || type;
}

/**
 * Convert MasterGo fills to standard format
 */
function convertFills(fillValue: any): any[] {
  if (!fillValue) return [];

  if (Array.isArray(fillValue)) {
    return fillValue.map(fill => {
      if (typeof fill === 'string') {
        // Color string
        return {
          type: 'SOLID',
          color: parseColor(fill),
        };
      } else if (fill.url) {
        // Image fill
        return {
          type: 'IMAGE',
          imageUrl: fill.url,
        };
      }
      return fill;
    });
  }

  return [];
}

/**
 * Convert MasterGo strokes to standard format
 */
function convertStrokes(strokeValue: any, node: MasterGoNode): any[] {
  if (!strokeValue) return [];

  const strokes: any[] = [];

  if (Array.isArray(strokeValue)) {
    strokeValue.forEach(stroke => {
      if (typeof stroke === 'string') {
        strokes.push({
          type: 'SOLID',
          color: parseColor(stroke),
          strokeWeight: parseStrokeWidth(node.strokeWidth),
        });
      }
    });
  }

  return strokes;
}

/**
 * Parse color string to RGBA object
 */
function parseColor(colorStr: string): any {
  // Handle hex colors
  if (colorStr.startsWith('#')) {
    const hex = colorStr.slice(1);
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    return { r, g, b, a: 1 };
  }

  // Handle rgba colors
  if (colorStr.startsWith('rgba')) {
    const match = colorStr.match(/rgba?\(([^)]+)\)/);
    if (match) {
      const parts = match[1].split(',').map(p => parseFloat(p.trim()));
      return {
        r: parts[0] / 255,
        g: parts[1] / 255,
        b: parts[2] / 255,
        a: parts[3] !== undefined ? parts[3] : 1,
      };
    }
  }

  // Default to black
  return { r: 0, g: 0, b: 0, a: 1 };
}

/**
 * Parse stroke width string
 */
function parseStrokeWidth(strokeWidth?: string): number {
  if (!strokeWidth) return 1;

  // Parse "0px 0px 1px" format - take the last value
  const parts = strokeWidth.split(' ');
  const lastPart = parts[parts.length - 1];
  return parseFloat(lastPart) || 1;
}

/**
 * Extract text content from MasterGo text array
 */
function extractTextContent(textArray: any[]): string {
  if (!Array.isArray(textArray)) return '';

  return textArray
    .map(item => {
      if (typeof item === 'string') return item;
      if (item.text) return item.text;
      if (item.content) return item.content;
      return '';
    })
    .join('');
}

/**
 * Convert MasterGo font style to standard format
 */
function convertFontStyle(fontValue: any): any {
  if (!fontValue) return {};

  const style: any = {};

  if (fontValue.family) {
    style.fontFamily = fontValue.family;
  }

  if (fontValue.size) {
    style.fontSize = fontValue.size;
  }

  if (fontValue.style) {
    try {
      const styleObj = JSON.parse(fontValue.style);
      if (styleObj.fontStyle) {
        // Map font style to weight
        const weightMap: Record<string, number> = {
          'Regular': 400,
          'Medium': 500,
          'Bold': 700,
          'Heavy': 800,
        };
        style.fontWeight = weightMap[styleObj.fontStyle] || 400;
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  if (fontValue.lineHeight && fontValue.lineHeight !== 'auto') {
    style.lineHeightPx = parseFloat(fontValue.lineHeight);
  }

  return style;
}
