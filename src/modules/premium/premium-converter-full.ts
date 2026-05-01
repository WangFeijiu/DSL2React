/**
 * Premium Converter - Full Version with Two-Phase Conversion
 * Phase 1: Extract all data from DSL tree (deep traversal)
 * Phase 2: Render semantic HTML
 */

import { DataExtractorV2 } from './data-extractor-v2';
import { PremiumRenderer } from './premium-renderer';

export function convertToPremiumHTML(dslInput: any): string {
  const { styles, nodes } = dslInput.dsl;
  const rootNode = nodes[0];

  // Phase 1: Extract data with deep traversal
  const extractor = new DataExtractorV2(styles);
  const data = extractor.extract(rootNode);

  // Phase 2: Render HTML
  const renderer = new PremiumRenderer();
  const html = renderer.render(data);

  return html;
}
