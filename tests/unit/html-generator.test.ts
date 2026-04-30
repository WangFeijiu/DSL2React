import { describe, it, expect, beforeEach } from '@jest/globals';
import { HTMLGenerator } from '../../src/modules/generator/html-generator';
import { ParsedTree } from '../../src/types/dsl-schema';

describe('HTMLGenerator', () => {
  let generator: HTMLGenerator;

  beforeEach(() => {
    generator = new HTMLGenerator();
  });

  describe('generate', () => {
    it('should generate basic HTML structure', () => {
      const tree: ParsedTree = {
        root: {
          id: 'root',
          type: 'container',
          name: 'Hero Section',
          layout: {
            position: { x: 0, y: 0 },
            size: { width: 1920, height: 1080 },
          },
          styles: {},
          children: [],
        },
        metadata: {
          fileId: 'file-123',
          layerId: 'layer-456',
          parsedAt: new Date(),
        },
      };

      const result = generator.generate(tree);

      expect(result.html).toContain('<!DOCTYPE html>');
      expect(result.html).toContain('<html lang="en">');
      expect(result.html).toContain('<meta charset="UTF-8">');
      expect(result.html).toContain('<meta name="viewport"');
      expect(result.html).toContain('class="container-hero-section"');
    });

    it('should generate semantic tags', () => {
      const tree: ParsedTree = {
        root: {
          id: 'root',
          type: 'container',
          name: 'Main',
          layout: { position: { x: 0, y: 0 }, size: { width: 100, height: 100 } },
          styles: {},
          children: [
            {
              id: 'text',
              type: 'text',
              name: 'Paragraph',
              layout: { position: { x: 0, y: 0 }, size: { width: 100, height: 20 } },
              styles: {},
              content: { type: 'text', value: 'Hello World' },
            },
            {
              id: 'btn',
              type: 'button',
              name: 'CTA',
              layout: { position: { x: 0, y: 0 }, size: { width: 100, height: 40 } },
              styles: {},
            },
          ],
        },
        metadata: { fileId: 'f', layerId: 'l', parsedAt: new Date() },
      };

      const result = generator.generate(tree);

      expect(result.html).toContain('<p class="text-paragraph">Hello World</p>');
      expect(result.html).toContain('<button class="button-cta" type="button">');
    });

    it('should generate CSS rules', () => {
      const tree: ParsedTree = {
        root: {
          id: 'root',
          type: 'container',
          name: 'Box',
          layout: {
            position: { x: 100, y: 200 },
            size: { width: 300, height: 400 },
            positioning: 'absolute',
          },
          styles: {
            colors: { background: '#ff0000', text: '#ffffff' },
          },
        },
        metadata: { fileId: 'f', layerId: 'l', parsedAt: new Date() },
      };

      const result = generator.generate(tree);

      expect(result.css).toContain('.container-box');
      expect(result.css).toContain('position: absolute');
      expect(result.css).toContain('left: 100px');
      expect(result.css).toContain('top: 200px');
      expect(result.css).toContain('width: 300px');
      expect(result.css).toContain('height: 400px');
      expect(result.css).toContain('background-color: #ff0000');
      expect(result.css).toContain('color: #ffffff');
    });

    it('should generate typography CSS', () => {
      const tree: ParsedTree = {
        root: {
          id: 'text',
          type: 'text',
          name: 'Title',
          layout: { position: { x: 0, y: 0 }, size: { width: 100, height: 50 } },
          styles: {
            typography: {
              fontFamily: 'Arial',
              fontSize: 24,
              fontWeight: 700,
              lineHeight: 32,
            },
          },
          content: { type: 'text', value: 'Hello' },
        },
        metadata: { fileId: 'f', layerId: 'l', parsedAt: new Date() },
      };

      const result = generator.generate(tree);

      expect(result.css).toContain('font-family: Arial');
      expect(result.css).toContain('font-size: 24px');
      expect(result.css).toContain('font-weight: 700');
      expect(result.css).toContain('line-height: 32px');
    });

    it('should escape HTML special characters', () => {
      const tree: ParsedTree = {
        root: {
          id: 'text',
          type: 'text',
          name: 'Text',
          layout: { position: { x: 0, y: 0 }, size: { width: 100, height: 20 } },
          styles: {},
          content: { type: 'text', value: '<script>alert("XSS")</script>' },
        },
        metadata: { fileId: 'f', layerId: 'l', parsedAt: new Date() },
      };

      const result = generator.generate(tree);

      expect(result.html).toContain('&lt;script&gt;');
      expect(result.html).not.toContain('<script>');
    });

    it('should handle nested children', () => {
      const tree: ParsedTree = {
        root: {
          id: 'parent',
          type: 'container',
          name: 'Parent',
          layout: { position: { x: 0, y: 0 }, size: { width: 100, height: 100 } },
          styles: {},
          children: [
            {
              id: 'child',
              type: 'container',
              name: 'Child',
              layout: { position: { x: 0, y: 0 }, size: { width: 50, height: 50 } },
              styles: {},
              children: [
                {
                  id: 'grandchild',
                  type: 'text',
                  name: 'Grandchild',
                  layout: { position: { x: 0, y: 0 }, size: { width: 25, height: 25 } },
                  styles: {},
                  content: { type: 'text', value: 'Nested' },
                },
              ],
            },
          ],
        },
        metadata: { fileId: 'f', layerId: 'l', parsedAt: new Date() },
      };

      const result = generator.generate(tree);

      expect(result.html).toContain('class="container-parent"');
      expect(result.html).toContain('class="container-child"');
      expect(result.html).toContain('class="text-grandchild"');
      expect(result.html).toContain('Nested');
    });
  });
});
