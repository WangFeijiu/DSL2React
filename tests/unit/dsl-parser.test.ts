import { describe, it, expect, beforeEach } from '@jest/globals';
import { DSLParser } from '../../src/modules/parser/dsl-parser';

describe('DSLParser', () => {
  let parser: DSLParser;

  beforeEach(() => {
    parser = new DSLParser();
  });

  describe('parse', () => {
    it('should parse simple DSL node', () => {
      const rawData = {
        id: 'node-1',
        name: 'Hero Section',
        type: 'FRAME',
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
      };

      const result = parser.parse(rawData, 'file-123', 'layer-456');

      expect(result.root.id).toBe('node-1');
      expect(result.root.name).toBe('Hero Section');
      expect(result.root.type).toBe('container');
      expect(result.metadata.fileId).toBe('file-123');
      expect(result.metadata.layerId).toBe('layer-456');
    });

    it('should extract layout information', () => {
      const rawData = {
        id: 'node-1',
        name: 'Box',
        type: 'RECTANGLE',
        x: 100,
        y: 200,
        width: 300,
        height: 400,
      };

      const result = parser.parse(rawData, 'file-123', 'layer-456');

      expect(result.root.layout.position).toEqual({ x: 100, y: 200 });
      expect(result.root.layout.size).toEqual({ width: 300, height: 400 });
      expect(result.root.layout.positioning).toBe('absolute');
    });

    it('should extract color styles', () => {
      const rawData = {
        id: 'node-1',
        name: 'Colored Box',
        type: 'RECTANGLE',
        fills: [
          {
            type: 'SOLID',
            color: { r: 1, g: 0, b: 0, a: 1 }, // Red
          },
        ],
      };

      const result = parser.parse(rawData, 'file-123', 'layer-456');

      expect(result.root.styles.colors?.background).toBe('#ff0000');
    });

    it('should extract typography styles', () => {
      const rawData = {
        id: 'node-1',
        name: 'Text',
        type: 'TEXT',
        characters: 'Hello World',
        style: {
          fontFamily: 'Arial',
          fontSize: 24,
          fontWeight: 700,
          lineHeightPx: 32,
          fills: [
            {
              color: { r: 0, g: 0, b: 0, a: 1 },
            },
          ],
        },
      };

      const result = parser.parse(rawData, 'file-123', 'layer-456');

      expect(result.root.type).toBe('text');
      expect(result.root.content).toEqual({
        type: 'text',
        value: 'Hello World',
      });
      expect(result.root.styles.typography).toEqual({
        fontFamily: 'Arial',
        fontSize: 24,
        fontWeight: 700,
        lineHeight: 32,
        letterSpacing: undefined,
      });
    });

    it('should parse nested children recursively', () => {
      const rawData = {
        id: 'parent',
        name: 'Parent',
        type: 'FRAME',
        children: [
          {
            id: 'child-1',
            name: 'Child 1',
            type: 'TEXT',
            characters: 'Text 1',
          },
          {
            id: 'child-2',
            name: 'Child 2',
            type: 'RECTANGLE',
            children: [
              {
                id: 'grandchild',
                name: 'Grandchild',
                type: 'TEXT',
                characters: 'Nested text',
              },
            ],
          },
        ],
      };

      const result = parser.parse(rawData, 'file-123', 'layer-456');

      expect(result.root.children).toHaveLength(2);
      expect(result.root.children![0].id).toBe('child-1');
      expect(result.root.children![1].children).toHaveLength(1);
      expect(result.root.children![1].children![0].id).toBe('grandchild');
    });

    it('should extract shadows from effects', () => {
      const rawData = {
        id: 'node-1',
        name: 'Shadow Box',
        type: 'RECTANGLE',
        effects: [
          {
            type: 'DROP_SHADOW',
            offset: { x: 2, y: 4 },
            radius: 8,
            color: { r: 0, g: 0, b: 0, a: 0.25 },
          },
        ],
      };

      const result = parser.parse(rawData, 'file-123', 'layer-456');

      expect(result.root.styles.shadows).toHaveLength(1);
      expect(result.root.styles.shadows![0]).toEqual({
        x: 2,
        y: 4,
        blur: 8,
        spread: 0,
        color: 'rgba(0, 0, 0, 0.25)',
      });
    });

    it('should extract borders from strokes', () => {
      const rawData = {
        id: 'node-1',
        name: 'Bordered Box',
        type: 'RECTANGLE',
        strokes: [
          {
            strokeWeight: 2,
            color: { r: 0, g: 0, b: 1, a: 1 }, // Blue
          },
        ],
      };

      const result = parser.parse(rawData, 'file-123', 'layer-456');

      expect(result.root.styles.borders).toHaveLength(1);
      expect(result.root.styles.borders![0]).toEqual({
        width: 2,
        style: 'solid',
        color: '#0000ff',
      });
    });

    it('should infer button type', () => {
      const rawData = {
        id: 'button',
        name: 'CTA Button',
        type: 'FRAME',
        fills: [{ type: 'SOLID', color: { r: 0, g: 0.5, b: 1, a: 1 } }],
        children: [
          {
            id: 'button-text',
            name: 'Button Text',
            type: 'TEXT',
            characters: 'Click Me',
          },
        ],
      };

      const result = parser.parse(rawData, 'file-123', 'layer-456');

      expect(result.root.type).toBe('button');
    });

    it('should throw error on excessive nesting', () => {
      // Create deeply nested structure
      let deepNode: any = {
        id: 'leaf',
        name: 'Leaf',
        type: 'TEXT',
      };

      for (let i = 0; i < 25; i++) {
        deepNode = {
          id: `node-${i}`,
          name: `Node ${i}`,
          type: 'FRAME',
          children: [deepNode],
        };
      }

      expect(() => parser.parse(deepNode, 'file-123', 'layer-456')).toThrow(
        'Maximum nesting depth'
      );
    });
  });
});
