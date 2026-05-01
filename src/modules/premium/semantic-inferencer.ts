import { NodeFeatures } from './feature-extractor';

export type SemanticType =
  | 'HEADER'
  | 'NAVIGATION'
  | 'HERO'
  | 'SECTION'
  | 'CARD'
  | 'CARD_GRID'
  | 'LIST_ITEM'
  | 'BUTTON'
  | 'TAG'
  | 'TAB'
  | 'FOOTER'
  | 'CONTENT_BLOCK'
  | 'IMAGE_CONTAINER'
  | 'TEXT_BLOCK'
  | 'UNKNOWN';

export interface SemanticInference {
  type: SemanticType;
  confidence: number;
  scores: Record<SemanticType, number>;
}

export class SemanticInferencer {
  private readonly CONFIDENCE_THRESHOLD = 0.3;

  private rules: Record<SemanticType, (f: NodeFeatures) => number> = {
    HEADER: (f) => {
      let score = 0;
      if (f.isTopRegion) score += 0.3;
      if (f.isFullWidth) score += 0.2;
      if (f.isShort) score += 0.2;
      if (f.hasText || f.hasChildren) score += 0.2;
      if (f.childCount >= 2) score += 0.1;
      return score;
    },

    NAVIGATION: (f) => {
      let score = 0;
      if (f.isTopRegion) score += 0.3;
      if (f.childCount >= 3 && f.childCount <= 8) score += 0.3;
      if (f.isFullWidth || f.widthRatio > 0.5) score += 0.2;
      if (f.isShort) score += 0.2;
      return score;
    },

    HERO: (f) => {
      let score = 0;
      if (f.relativeY < 0.3 && f.relativeY > 0.05) score += 0.3;
      if (f.isFullWidth || f.widthRatio > 0.7) score += 0.2;
      if (f.heightRatio > 0.15 && f.heightRatio < 0.5) score += 0.2;
      if (f.hasImage || f.hasText) score += 0.15;
      if (f.hasChildren && f.childCount >= 3) score += 0.15;
      return score;
    },

    SECTION: (f) => {
      let score = 0;
      if (f.widthRatio > 0.8) score += 0.3;
      if (f.hasChildren && f.childCount >= 2) score += 0.3;
      if (f.heightRatio > 0.15) score += 0.2;
      if (!f.isTopRegion && !f.isBottomRegion) score += 0.2;
      return score;
    },

    CARD: (f) => {
      let score = 0;
      if (f.isInRepeatingPattern) score += 0.4;
      if (f.hasImage && f.hasText) score += 0.3;
      if (f.widthRatio > 0.15 && f.widthRatio < 0.35) score += 0.2;
      if (f.childCount >= 2 && f.childCount <= 6) score += 0.1;
      return score;
    },

    CARD_GRID: (f) => {
      let score = 0;
      if (f.hasChildren && f.childCount >= 3) score += 0.4;
      if (f.isInRepeatingPattern) score += 0.3;
      if (f.widthRatio > 0.7) score += 0.2;
      if (f.heightRatio > 0.2) score += 0.1;
      return score;
    },

    LIST_ITEM: (f) => {
      let score = 0;
      if (f.isInRepeatingPattern) score += 0.5;
      if (f.isShort) score += 0.2;
      if (f.hasText) score += 0.2;
      if (f.widthRatio > 0.5) score += 0.1;
      return score;
    },

    BUTTON: (f) => {
      let score = 0;
      if (f.hasText && f.textLength < 20) score += 0.4;
      if (f.widthRatio < 0.2 && f.heightRatio < 0.05) score += 0.3;
      if (f.aspectRatio > 2 && f.aspectRatio < 8) score += 0.2;
      if (!f.hasChildren || f.childCount <= 2) score += 0.1;
      return score;
    },

    TAG: (f) => {
      let score = 0;
      if (f.hasText && f.textLength < 15) score += 0.4;
      if (f.widthRatio < 0.15 && f.heightRatio < 0.03) score += 0.3;
      if (f.isInRepeatingPattern) score += 0.2;
      if (f.aspectRatio > 2) score += 0.1;
      return score;
    },

    TAB: (f) => {
      let score = 0;
      if (f.isInRepeatingPattern && f.siblingCount >= 2) score += 0.4;
      if (f.hasText && f.textLength < 20) score += 0.3;
      if (f.isShort) score += 0.2;
      if (f.widthRatio < 0.2) score += 0.1;
      return score;
    },

    FOOTER: (f) => {
      let score = 0;
      if (f.isBottomRegion) score += 0.5;
      if (f.isFullWidth) score += 0.3;
      if (f.hasText) score += 0.2;
      return score;
    },

    CONTENT_BLOCK: (f) => {
      let score = 0;
      if (f.hasText && f.textLength > 50) score += 0.4;
      if (f.heightRatio > 0.1) score += 0.2;
      if (f.widthRatio > 0.4) score += 0.2;
      if (f.childCount <= 3) score += 0.2;
      return score;
    },

    IMAGE_CONTAINER: (f) => {
      let score = 0;
      if (f.hasImage) score += 0.5;
      if (!f.hasText || f.textLength < 10) score += 0.3;
      if (f.aspectRatio > 0.8 && f.aspectRatio < 2) score += 0.2;
      return score;
    },

    TEXT_BLOCK: (f) => {
      let score = 0;
      if (f.hasText && f.textLength > 20) score += 0.5;
      if (!f.hasImage) score += 0.3;
      if (f.childCount <= 2) score += 0.2;
      return score;
    },

    UNKNOWN: () => 0
  };

  infer(features: NodeFeatures): SemanticInference {
    const scores: Record<SemanticType, number> = {} as Record<SemanticType, number>;

    for (const [type, rule] of Object.entries(this.rules)) {
      scores[type as SemanticType] = rule(features);
    }

    const entries = Object.entries(scores) as Array<[SemanticType, number]>;
    entries.sort((a, b) => b[1] - a[1]);

    const [bestType, bestScore] = entries[0];

    if (bestScore < this.CONFIDENCE_THRESHOLD) {
      return {
        type: 'UNKNOWN',
        confidence: 0,
        scores
      };
    }

    return {
      type: bestType,
      confidence: bestScore,
      scores
    };
  }
}
