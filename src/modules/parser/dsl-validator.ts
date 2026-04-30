import { z } from 'zod';
import { RawDSLSchema } from '../../types/dsl-schema';

export class DSLValidationError extends Error {
  constructor(
    message: string,
    public errors: z.ZodError
  ) {
    super(message);
    this.name = 'DSLValidationError';
  }

  /**
   * Get formatted error messages
   */
  getFormattedErrors(): string[] {
    return this.errors.issues.map((err) => {
      const path = err.path.join('.');
      return `${path}: ${err.message}`;
    });
  }
}

export class DSLValidator {
  /**
   * Validate raw DSL data from MasterGo API
   */
  validate(data: unknown): z.infer<typeof RawDSLSchema> {
    try {
      return RawDSLSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new DSLValidationError(
          'DSL validation failed: Invalid data structure',
          error
        );
      }
      throw error;
    }
  }

  /**
   * Safe validation that returns result object
   */
  safeParse(data: unknown): {
    success: boolean;
    data?: z.infer<typeof RawDSLSchema>;
    error?: DSLValidationError;
  } {
    const result = RawDSLSchema.safeParse(data);

    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        error: new DSLValidationError('DSL validation failed', result.error),
      };
    }
  }

  /**
   * Validate specific fields
   */
  validateRequired(data: any): void {
    const requiredFields = ['id', 'name', 'type'];
    const missing = requiredFields.filter((field) => !(field in data));

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
  }
}
