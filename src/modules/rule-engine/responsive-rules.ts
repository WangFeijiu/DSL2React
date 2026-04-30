import { ElementNode } from '../../types/dsl-schema';

export interface ResponsiveRules {
  mobile: Record<string, string>;
  tablet: Record<string, string>;
  desktop: Record<string, string>;
}

export class ResponsiveRuleEngine {
  private breakpoints = {
    mobile: 375,
    tablet: 768,
    desktop: 1920,
  };

  generateMediaQueries(node: ElementNode): string {
    const queries: string[] = [];

    // Mobile-first approach
    queries.push(`@media (min-width: ${this.breakpoints.tablet}px) {`);
    queries.push(`  /* Tablet styles */`);
    queries.push(`}`);

    queries.push(`@media (min-width: ${this.breakpoints.desktop}px) {`);
    queries.push(`  /* Desktop styles */`);
    queries.push(`}`);

    return queries.join('\n');
  }
}
