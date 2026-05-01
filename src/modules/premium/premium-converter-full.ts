/**
 * Premium Converter - Full Version with Universal Semantic Engine
 * Phase 1: Extract features and infer semantics (NO hardcoding)
 * Phase 2: Render semantic HTML
 */

import { UniversalDataExtractor } from './universal-data-extractor';
import { PremiumRenderer } from './premium-renderer';

export function convertToPremiumHTML(dslInput: any): string {
  // Phase 1: Universal semantic extraction
  const extractor = new UniversalDataExtractor(dslInput);
  const data = extractor.extract();

  // Phase 2: Render HTML
  const renderer = new PremiumRenderer(dslInput.dsl.styles);
  const html = renderer.render(data, extractor);

  return html;
}

