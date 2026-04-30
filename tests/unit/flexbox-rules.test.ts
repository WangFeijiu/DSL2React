import { describe, it, expect, beforeEach } from '@jest/globals';
import { FlexboxRuleEngine } from '../../src/modules/rule-engine/flexbox-rules';
import { ElementNode } from '../../src/types/dsl-schema';

describe('FlexboxRuleEngine', () => {
  let engine: FlexboxRuleEngine;

  beforeEach(() => {
    engine = new FlexboxRuleEngine();
  });

  describe('generateFlexContainer', () => {
    it('should generate basic flex container rules', () => {
      const node: ElementNode = {
        id: 'container',
        type: 'container',
        name: 'Flex Container',
        layout: {
          position: { x: 0, y: 0 },
          size: { width: 1000, height: 500 },
          display: 'flex',
        },
        styles: {},
      };

      const rules = engine.generateFlexContainer(node);

      expect(rules.display).toBe('flex');
    });

    it('should use explicit flex direction', () => {
      const node: ElementNode = {
        id: 'container',
        type: 'container',
        name: 'Column Container',
        layout: {
          position: { x: 0, y: 0 },
          size: { width: 1000, height: 500 },
          flexProps: {
            direction: 'column',
          },
        },
        styles: {},
      };

      const rules = engine.generateFlexContainer(node);

      expect(rules.flexDirection).toBe('column');
    });

    it('should infer row direction from horizontal children', () => {
      const node: ElementNode = {
        id: 'container',
        type: 'container',
        name: 'Container',
        layout: {
          position: { x: 0, y: 0 },
          size: { width: 1000, height: 100 },
        },
        styles: {},
        children: [
          {
            id: 'child1',
            type: 'container',
            name: 'Child 1',
            layout: {
              position: { x: 0, y: 0 },
              size: { width: 100, height: 100 },
            },
            styles: {},
          },
          {
            id: 'child2',
            type: 'container',
            name: 'Child 2',
            layout: {
              position: { x: 150, y: 0 },
              size: { width: 100, height: 100 },
            },
            styles: {},
          },
        ],
      };

      const rules = engine.generateFlexContainer(node);

      expect(rules.flexDirection).toBe('row');
    });

    it('should infer column direction from vertical children', () => {
      const node: ElementNode = {
        id: 'container',
        type: 'container',
        name: 'Container',
        layout: {
          position: { x: 0, y: 0 },
          size: { width: 100, height: 1000 },
        },
        styles: {},
        children: [
          {
            id: 'child1',
            type: 'container',
            name: 'Child 1',
            layout: {
              position: { x: 0, y: 0 },
              size: { width: 100, height: 100 },
            },
            styles: {},
          },
          {
            id: 'child2',
            type: 'container',
            name: 'Child 2',
            layout: {
              position: { x: 0, y: 150 },
              size: { width: 100, height: 100 },
            },
            styles: {},
          },
        ],
      };

      const rules = engine.generateFlexContainer(node);

      expect(rules.flexDirection).toBe('column');
    });

    it('should include gap', () => {
      const node: ElementNode = {
        id: 'container',
        type: 'container',
        name: 'Container',
        layout: {
          position: { x: 0, y: 0 },
          size: { width: 1000, height: 500 },
          flexProps: {
            gap: 16,
          },
        },
        styles: {},
      };

      const rules = engine.generateFlexContainer(node);

      expect(rules.gap).toBe('16px');
    });
  });

  describe('rulesToCSS', () => {
    it('should convert rules to CSS string', () => {
      const rules = {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
      };

      const css = engine.rulesToCSS(rules);

      expect(css).toContain('display: flex');
      expect(css).toContain('flex-direction: row');
      expect(css).toContain('justify-content: center');
      expect(css).toContain('align-items: center');
      expect(css).toContain('gap: 16px');
    });
  });

  describe('shouldUseFlex', () => {
    it('should return true for explicit flex display', () => {
      const node: ElementNode = {
        id: 'node',
        type: 'container',
        name: 'Node',
        layout: {
          position: { x: 0, y: 0 },
          size: { width: 100, height: 100 },
          display: 'flex',
        },
        styles: {},
      };

      expect(engine.shouldUseFlex(node)).toBe(true);
    });

    it('should return true for containers with multiple children', () => {
      const node: ElementNode = {
        id: 'node',
        type: 'container',
        name: 'Node',
        layout: {
          position: { x: 0, y: 0 },
          size: { width: 100, height: 100 },
        },
        styles: {},
        children: [{} as any, {} as any],
      };

      expect(engine.shouldUseFlex(node)).toBe(true);
    });

    it('should return false for single child', () => {
      const node: ElementNode = {
        id: 'node',
        type: 'container',
        name: 'Node',
        layout: {
          position: { x: 0, y: 0 },
          size: { width: 100, height: 100 },
        },
        styles: {},
        children: [{} as any],
      };

      expect(engine.shouldUseFlex(node)).toBe(false);
    });
  });
});
