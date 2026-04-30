import { ElementNode } from '../../types/dsl-schema';

export interface PositioningRules {
  position?: string;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  zIndex?: number;
}

export class PositioningRuleEngine {
  generatePositioningRules(node: ElementNode): PositioningRules {
    const rules: PositioningRules = {};
    const { layout } = node;

    if (layout.positioning) {
      rules.position = layout.positioning;

      if (layout.positioning === 'absolute' || layout.positioning === 'fixed') {
        rules.left = `${layout.position.x}px`;
        rules.top = `${layout.position.y}px`;
      }
    }

    return rules;
  }

  rulesToCSS(rules: PositioningRules): string {
    const lines: string[] = [];
    for (const [key, value] of Object.entries(rules)) {
      if (value !== undefined) {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        lines.push(`  ${cssKey}: ${value};`);
      }
    }
    return lines.join('\n');
  }
}
