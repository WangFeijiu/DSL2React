import { ElementNode, StyleInfo } from '../../types/dsl-schema';

export class StyleRuleEngine {
  generateStyleRules(node: ElementNode): Record<string, string> {
    const rules: Record<string, string> = {};
    const { styles } = node;

    // Colors
    if (styles.colors?.background) {
      rules['background-color'] = styles.colors.background;
    }
    if (styles.colors?.text) {
      rules['color'] = styles.colors.text;
    }

    // Typography
    if (styles.typography) {
      const { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing } = styles.typography;
      rules['font-family'] = fontFamily;
      rules['font-size'] = `${fontSize}px`;
      rules['font-weight'] = String(fontWeight);
      rules['line-height'] = `${lineHeight}px`;
      if (letterSpacing) {
        rules['letter-spacing'] = `${letterSpacing}px`;
      }
    }

    // Borders
    if (styles.borders && styles.borders.length > 0) {
      const border = styles.borders[0];
      rules['border'] = `${border.width}px ${border.style} ${border.color}`;
      if (border.radius) {
        rules['border-radius'] = `${border.radius}px`;
      }
    }

    // Shadows
    if (styles.shadows && styles.shadows.length > 0) {
      const shadows = styles.shadows
        .map((s: any) => `${s.x}px ${s.y}px ${s.blur}px ${s.spread || 0}px ${s.color}`)
        .join(', ');
      rules['box-shadow'] = shadows;
    }

    // Opacity
    if (styles.opacity !== undefined) {
      rules['opacity'] = String(styles.opacity);
    }

    return rules;
  }

  rulesToCSS(rules: Record<string, string>): string {
    return Object.entries(rules)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n');
  }
}
