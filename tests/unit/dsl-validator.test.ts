import { describe, it, expect } from '@jest/globals';
import { DSLValidator, DSLValidationError } from '../../src/modules/parser/dsl-validator';

describe('DSLValidator', () => {
  let validator: DSLValidator;

  beforeEach(() => {
    validator = new DSLValidator();
  });

  describe('validate', () => {
    it('should validate correct DSL data', () => {
      const validData = {
        id: 'layer-123',
        name: 'Hero Section',
        type: 'FRAME',
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        visible: true,
        locked: false,
      };

      const result = validator.validate(validData);
      expect(result.id).toBe('layer-123');
      expect(result.name).toBe('Hero Section');
      expect(result.type).toBe('FRAME');
    });

    it('should throw error for missing required fields', () => {
      const invalidData = {
        name: 'Test',
        // missing id and type
      };

      expect(() => validator.validate(invalidData)).toThrow(DSLValidationError);
    });

    it('should throw error for invalid field types', () => {
      const invalidData = {
        id: 'layer-123',
        name: 'Test',
        type: 'FRAME',
        x: 'invalid', // should be number
      };

      expect(() => validator.validate(invalidData)).toThrow(DSLValidationError);
    });

    it('should validate nested children', () => {
      const validData = {
        id: 'parent',
        name: 'Parent',
        type: 'FRAME',
        children: [
          {
            id: 'child-1',
            name: 'Child 1',
            type: 'TEXT',
          },
          {
            id: 'child-2',
            name: 'Child 2',
            type: 'RECTANGLE',
          },
        ],
      };

      const result = validator.validate(validData);
      expect(result.children).toHaveLength(2);
      expect(result.children![0].id).toBe('child-1');
    });

    it('should validate optional fields', () => {
      const validData = {
        id: 'layer-123',
        name: 'Test',
        type: 'FRAME',
        version: '1.0.0',
        fills: [],
        strokes: [],
        effects: [],
      };

      const result = validator.validate(validData);
      expect(result.version).toBe('1.0.0');
      expect(result.fills).toEqual([]);
    });
  });

  describe('safeParse', () => {
    it('should return success for valid data', () => {
      const validData = {
        id: 'layer-123',
        name: 'Test',
        type: 'FRAME',
      };

      const result = validator.safeParse(validData);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should return error for invalid data', () => {
      const invalidData = {
        name: 'Test',
        // missing id and type
      };

      const result = validator.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBeInstanceOf(DSLValidationError);
    });
  });

  describe('validateRequired', () => {
    it('should pass for data with all required fields', () => {
      const validData = {
        id: 'layer-123',
        name: 'Test',
        type: 'FRAME',
      };

      expect(() => validator.validateRequired(validData)).not.toThrow();
    });

    it('should throw for missing required fields', () => {
      const invalidData = {
        id: 'layer-123',
        // missing name and type
      };

      expect(() => validator.validateRequired(invalidData)).toThrow(
        'Missing required fields: name, type'
      );
    });
  });

  describe('DSLValidationError', () => {
    it('should format error messages', () => {
      const invalidData = {
        name: 'Test',
      };

      try {
        validator.validate(invalidData);
      } catch (error) {
        if (error instanceof DSLValidationError) {
          const formatted = error.getFormattedErrors();
          expect(formatted.length).toBeGreaterThan(0);
          expect(formatted[0]).toContain('id');
        }
      }
    });
  });
});
