import { ElementNode } from '../../types/dsl-schema';

export interface GridRules {
  display?: string;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gap?: string;
  gridGap?: string;
  gridAutoFlow?: string;
}

export class GridRuleEngine {
  generateGridContainer(node: ElementNode): GridRules {
    const rules: GridRules = {
      display: 'grid',
    };

    const { layout } = node;

    if (layout.gridProps?.templateColumns) {
      rules.gridTemplateColumns = layout.gridProps.templateColumns;
    } else if (node.children && node.children.length > 0) {
      rules.gridTemplateColumns = this.inferGridColumns(node.children);
    }

    if (layout.gridProps?.templateRows) {
      rules.gridTemplateRows = layout.gridProps.templateRows;
    }

    if (layout.gridProps?.gap !== undefined) {
      rules.gap = `${layout.gridProps.gap}px`;
    }

    return rules;
  }

  private inferGridColumns(children: ElementNode[]): string {
    const cols = Math.ceil(Math.sqrt(children.length));
    return `repeat(${cols}, 1fr)`;
  }

  rulesToCSS(rules: GridRules): string {
    const lines: string[] = [];
    for (const [key, value] of Object.entries(rules)) {
      if (value !== undefined) {
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        lines.push(`  ${cssKey}: ${value};`);
      }
    }
    return lines.join('\n');
  }

  shouldUseGrid(node: ElementNode): boolean {
    return node.layout.display === 'grid';
  }
}
