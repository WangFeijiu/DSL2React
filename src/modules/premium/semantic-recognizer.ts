/**
 * Semantic Recognizer
 * Identifies business modules from DSL nodes (Header, Hero, Card, Tab, etc.)
 */

export enum SemanticType {
  HEADER = 'HEADER',
  BREADCRUMB = 'BREADCRUMB',
  HERO_SECTION = 'HERO_SECTION',
  HERO_IMAGE = 'HERO_IMAGE',
  PRODUCT_TITLE = 'PRODUCT_TITLE',
  TAG_GROUP = 'TAG_GROUP',
  TAG = 'TAG',
  PRICE = 'PRICE',
  CTA_BUTTON = 'CTA_BUTTON',
  TABS = 'TABS',
  PRODUCT_CARD = 'PRODUCT_CARD',
  PRODUCT_CASES = 'PRODUCT_CASES',
  RECOMMENDATIONS = 'RECOMMENDATIONS',
  BADGE_3D = 'BADGE_3D',
  GENERIC = 'GENERIC',
}

export interface SemanticNode {
  type: SemanticType;
  node: any;
  children: SemanticNode[];
  metadata?: any;
}

/**
 * Recognize semantic type from DSL node
 */
export function recognizeSemanticType(node: any, parent?: any): SemanticType {
  const name = (node.name || '').toLowerCase();
  const type = node.type || '';
  const layout = node.layoutStyle || {};
  const x = layout.relativeX || 0;
  const y = layout.relativeY || 0;
  const w = layout.width || 0;
  const h = layout.height || 0;
  const children = node.children || [];

  // Header: top area, full width, ~100px height
  if (y < 150 && w > 1400 && h < 120) {
    return SemanticType.HEADER;
  }

  // Breadcrumb: small text with ">" or "home"
  if (type === 'TEXT' && (name.includes('>') || name.includes('home'))) {
    return SemanticType.BREADCRUMB;
  }

  // Product Title: large text near top
  if (type === 'TEXT' && y > 150 && y < 300 && w > 400) {
    return SemanticType.PRODUCT_TITLE;
  }

  // Price: text with "$"
  if (type === 'TEXT' && name.includes('$')) {
    return SemanticType.PRICE;
  }

  // 3D Badge: small box with "3D" text
  if (name.includes('3d') && w < 100 && h < 100) {
    return SemanticType.BADGE_3D;
  }

  // CTA Button: contains action keywords
  const ctaKeywords = ['sample', 'project', 'custom', 'start', 'get'];
  if (ctaKeywords.some(k => name.includes(k))) {
    return SemanticType.CTA_BUTTON;
  }

  // Tag: small rounded rect with short text
  if (w < 150 && h < 60 && children.length <= 2) {
    return SemanticType.TAG;
  }

  // Tag Group: contains multiple tags
  if (children.length >= 2 && children.length <= 5) {
    const allSmall = children.every((c: any) => {
      const cw = c.layoutStyle?.width || 0;
      const ch = c.layoutStyle?.height || 0;
      return cw < 150 && ch < 60;
    });
    if (allSmall) {
      return SemanticType.TAG_GROUP;
    }
  }

  // Tabs: contains multiple text nodes with underline
  if (children.length >= 2) {
    const hasTexts = children.filter((c: any) => c.type === 'TEXT').length >= 2;
    const hasLine = children.some((c: any) => {
      const ch = c.layoutStyle?.height || 0;
      return ch < 5; // horizontal line
    });
    if (hasTexts && hasLine) {
      return SemanticType.TABS;
    }
  }

  // Hero Image: large image area
  if (w > 300 && h > 400 && (name.includes('image') || node.fill)) {
    return SemanticType.HERO_IMAGE;
  }

  // Product Card: has image + text + price
  if (children.length >= 3) {
    const hasImage = children.some((c: any) => c.fill || c.name?.includes('image'));
    const hasPrice = children.some((c: any) => c.name?.includes('$'));
    if (hasImage && hasPrice) {
      return SemanticType.PRODUCT_CARD;
    }
  }

  // Product Cases: contains multiple product cards
  if (children.length >= 3) {
    const cardCount = children.filter((c: any) => {
      const cChildren = c.children || [];
      const hasImage = cChildren.some((cc: any) => cc.fill);
      const hasPrice = cChildren.some((cc: any) => cc.name?.includes('$'));
      return hasImage && hasPrice;
    }).length;
    if (cardCount >= 3) {
      return SemanticType.PRODUCT_CASES;
    }
  }

  // Recommendations: contains multiple small images
  if (children.length >= 4) {
    const imageCount = children.filter((c: any) => {
      const cw = c.layoutStyle?.width || 0;
      const ch = c.layoutStyle?.height || 0;
      return (cw < 250 && ch < 300) && c.fill;
    }).length;
    if (imageCount >= 4) {
      return SemanticType.RECOMMENDATIONS;
    }
  }

  return SemanticType.GENERIC;
}

/**
 * Build semantic tree from DSL nodes
 */
export function buildSemanticTree(node: any, parent?: any): SemanticNode {
  const semanticType = recognizeSemanticType(node, parent);
  const children = node.children || [];

  // For certain types, don't recurse into children (treat as atomic)
  const atomicTypes = [
    SemanticType.TAG,
    SemanticType.CTA_BUTTON,
    SemanticType.BADGE_3D,
    SemanticType.PRICE,
    SemanticType.BREADCRUMB,
  ];

  const semanticChildren: SemanticNode[] = atomicTypes.includes(semanticType)
    ? []
    : children.map((child: any) => buildSemanticTree(child, node));

  return {
    type: semanticType,
    node,
    children: semanticChildren,
    metadata: {
      name: node.name,
      id: node.id,
      layout: node.layoutStyle,
    },
  };
}

/**
 * Find all nodes of a specific semantic type
 */
export function findNodesByType(tree: SemanticNode, type: SemanticType): SemanticNode[] {
  const results: SemanticNode[] = [];

  if (tree.type === type) {
    results.push(tree);
  }

  for (const child of tree.children) {
    results.push(...findNodesByType(child, type));
  }

  return results;
}

/**
 * Group nodes into modules
 */
export interface Module {
  type: SemanticType;
  nodes: SemanticNode[];
  layout?: 'flex' | 'grid' | 'absolute';
  columns?: number;
}

export function groupIntoModules(tree: SemanticNode): Module[] {
  const modules: Module[] = [];

  // Header module
  const headers = findNodesByType(tree, SemanticType.HEADER);
  if (headers.length > 0) {
    modules.push({
      type: SemanticType.HEADER,
      nodes: headers,
      layout: 'flex',
    });
  }

  // Hero section (left content + right image)
  const heroImages = findNodesByType(tree, SemanticType.HERO_IMAGE);
  if (heroImages.length > 0) {
    modules.push({
      type: SemanticType.HERO_SECTION,
      nodes: heroImages,
      layout: 'grid',
      columns: 2,
    });
  }

  // Product Cases (4 cards)
  const cases = findNodesByType(tree, SemanticType.PRODUCT_CASES);
  if (cases.length > 0) {
    modules.push({
      type: SemanticType.PRODUCT_CASES,
      nodes: cases,
      layout: 'grid',
      columns: 4,
    });
  }

  // Recommendations (6 items)
  const recs = findNodesByType(tree, SemanticType.RECOMMENDATIONS);
  if (recs.length > 0) {
    modules.push({
      type: SemanticType.RECOMMENDATIONS,
      nodes: recs,
      layout: 'grid',
      columns: 6,
    });
  }

  // Tabs
  const tabs = findNodesByType(tree, SemanticType.TABS);
  if (tabs.length > 0) {
    modules.push({
      type: SemanticType.TABS,
      nodes: tabs,
      layout: 'flex',
    });
  }

  return modules;
}
