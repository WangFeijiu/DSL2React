/**
 * Premium Converter - Full Version with Two-Phase Conversion
 * Phase 1: Extract all data from DSL tree
 * Phase 2: Render semantic HTML
 */

import { DataExtractor } from './data-extractor';
import { PremiumRenderer } from './premium-renderer';

export function convertToPremiumHTML(dslInput: any): string {
  const { styles, nodes } = dslInput.dsl;
  const rootNode = nodes[0];

  // Phase 1: Extract data
  const extractor = new DataExtractor(styles);
  const data = extractor.extract(rootNode);

  // Phase 2: Render HTML
  const renderer = new PremiumRenderer();
  const html = renderer.render(data);

  return html;
}
