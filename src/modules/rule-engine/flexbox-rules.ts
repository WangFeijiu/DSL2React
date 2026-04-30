import { ElementNode, LayoutInfo } from '../../types/dsl-schema';

export interface FlexRules {
  display?: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  flexWrap?: string;
  gap?: string;
  flex?: string;
}

export class FlexboxRuleEngine {
  /**
   * Generate Flexbox CSS rules for a container
   */
  generateFlexContainer(node: ElementNode): FlexRules {
    const rules: FlexRules = {
      display: 'flex',
    };

    const { layout } = node;

    // Infer flex direction from children layout
    if (layout.flexProps?.direction) {
      rules.flexDirection = layout.flexProps.direction;
    } else if (node.children && node.children.length > 0) {
      rules.flexDirection = this.inferFlexDirection(node.children);
    }

    // Justify content
    if (layout.flexProps?.justifyContent) {
      rules.justifyContent = layout.flexProps.justifyContent;
    }

    // Align items
    if (layout.flexProps?.alignItems) {
      rules.alignItems = layout.flexProps.alignItems;
    }

    // Gap
    if (layout.flexProps?.gap !== undefined) {
      rules.gap = `${layout.flexProps.gap}px`;
    }

    return rules;
  }

  /**
   * Generate Flexbox CSS rules for a flex item
   */
  generateFlexItem(node: ElementNode, parent?: ElementNode): FlexRules {
    const rules: FlexRules = {};

    // Flex grow/shrink/basis
    rules.flex = '0 0 auto'; // Default: don't grow or shrink

    return rules;
  }

  /**
   * Infer flex direction from children positions
   */
  private inferFlexDirection(children: ElementNode[]): string {
    if (children.length < 2) return 'row';

    const first = children[0].layout.position;
    const second = children[1].layout.position;

    // If second child is below first, it's column
    if (second.y > first.y + children[0].layout.size.height) {
      return 'column';
    }

    // If second child is to the right, it's row
    if (second.x > first.x + children[0].layout.size.width) {
      return 'row';
    }

    return 'row'; // Default
  }

  /**
   * Convert flex rules to CSS string
   */
  rulesToCSS(rules: FlexRules): string {
    const lines: string[] = [];

    for (const [key, value] of Object.entries(rules)) {
      if (value !== undefined) {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        lines.push(`  ${cssKey}: ${value};`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Check if node should use Flexbox
   */
  shouldUseFlex(node: ElementNode): boolean {
    // Use flex if explicitly specified
    if (node.layout.display === 'flex') return true;

    // Use flex for containers with multiple children
    if (node.children && node.children.length > 1) return true;

    return false;
  }
}
