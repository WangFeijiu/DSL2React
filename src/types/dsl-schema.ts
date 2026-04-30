import { z } from 'zod';

// Layout information schema
export const LayoutInfoSchema = z.object({
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  size: z.object({
    width: z.number(),
    height: z.number(),
  }),
  positioning: z.enum(['static', 'relative', 'absolute', 'fixed', 'sticky']).optional(),
  display: z.enum(['flex', 'grid', 'block', 'inline-block', 'none']).optional(),
  flexProps: z
    .object({
      direction: z.enum(['row', 'column', 'row-reverse', 'column-reverse']).optional(),
      justifyContent: z.string().optional(),
      alignItems: z.string().optional(),
      gap: z.number().optional(),
    })
    .optional(),
  gridProps: z
    .object({
      templateColumns: z.string().optional(),
      templateRows: z.string().optional(),
      gap: z.number().optional(),
    })
    .optional(),
});

// Style information schema
export const StyleInfoSchema = z.object({
  colors: z
    .object({
      background: z.string().optional(),
      text: z.string().optional(),
      border: z.string().optional(),
    })
    .optional(),
  typography: z
    .object({
      fontFamily: z.string(),
      fontSize: z.number(),
      fontWeight: z.number(),
      lineHeight: z.number(),
      letterSpacing: z.number().optional(),
    })
    .optional(),
  borders: z
    .array(
      z.object({
        width: z.number(),
        style: z.string(),
        color: z.string(),
        radius: z.number().optional(),
      })
    )
    .optional(),
  shadows: z
    .array(
      z.object({
        x: z.number(),
        y: z.number(),
        blur: z.number(),
        spread: z.number().optional(),
        color: z.string(),
      })
    )
    .optional(),
  opacity: z.number().min(0).max(1).optional(),
});

// Element node schema (recursive)
export const ElementNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: z.enum(['container', 'text', 'image', 'button', 'icon', 'input', 'group']),
    name: z.string(),
    layout: LayoutInfoSchema,
    styles: StyleInfoSchema,
    content: z
      .union([
        z.object({
          type: z.literal('text'),
          value: z.string(),
        }),
        z.object({
          type: z.literal('image'),
          url: z.string(),
          alt: z.string().optional(),
        }),
      ])
      .optional(),
    children: z.array(ElementNodeSchema).optional(),
  })
);

// Parsed tree schema
export const ParsedTreeSchema = z.object({
  root: ElementNodeSchema,
  metadata: z.object({
    fileId: z.string(),
    layerId: z.string(),
    parsedAt: z.date(),
    version: z.string().optional(),
  }),
});

// Raw DSL schema (MasterGo format)
const RawDSLSchemaBase = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  visible: z.boolean().optional(),
  locked: z.boolean().optional(),
  // Layout properties
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  // Style properties
  fills: z.array(z.any()).optional(),
  strokes: z.array(z.any()).optional(),
  effects: z.array(z.any()).optional(),
  // Typography
  style: z.any().optional(),
  characters: z.string().optional(),
  // Version
  version: z.string().optional(),
});

export const RawDSLSchema: z.ZodType<any> = RawDSLSchemaBase.extend({
  children: z.array(z.lazy(() => RawDSLSchema)).optional(),
});

// Type inference
export type LayoutInfo = z.infer<typeof LayoutInfoSchema>;
export type StyleInfo = z.infer<typeof StyleInfoSchema>;
export type ElementNode = z.infer<typeof ElementNodeSchema>;
export type ParsedTree = z.infer<typeof ParsedTreeSchema>;
export type RawDSL = z.infer<typeof RawDSLSchema>;
