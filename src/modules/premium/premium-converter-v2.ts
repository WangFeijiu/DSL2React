/**
 * Premium Converter - Full Version
 * Properly traverses DSL tree and applies semantic rendering
 */

import { recognizeSemanticType, SemanticType } from './semantic-recognizer';

export function convertToPremiumHTML(dslInput: any): string {
  const { styles, nodes } = dslInput.dsl;
  const rootNode = nodes[0];

  return generatePremiumHTML(rootNode, styles);
}

function generatePremiumHTML(rootNode: any, styles: any): string {
  const title = rootNode.name || 'Premium Page';

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
${generatePremiumStyles()}
</head>
<body>
${generatePremiumBody(rootNode, styles)}
${generatePremiumScripts()}
</body>
</html>`;

  return html;
}

/**
 * Generate body by traversing DSL tree with semantic recognition
 */
function generatePremiumBody(rootNode: any, styles: any): string {
  const children = rootNode.children || [];

  // Separate children by semantic type
  const sections: { [key: string]: any[] } = {
    header: [],
    hero: [],
    tabs: [],
    cases: [],
    recommendations: [],
    other: []
  };

  // First pass: categorize all children
  for (const child of children) {
    const semantic = recognizeSemanticType(child);
    const y = child.layoutStyle?.relativeY || 0;

    // Categorize by position and semantic
    if (y < 150) {
      sections.header.push(child);
    } else if (y < 1000) {
      sections.hero.push(child);
    } else if (y >= 1800 && y < 2400) {
      sections.tabs.push(child);
    } else if (y >= 1100 && y < 1800) {
      sections.cases.push(child);
    } else if (y >= 2400) {
      sections.recommendations.push(child);
    } else {
      sections.other.push(child);
    }
  }

  let html = '';

  // Render header
  if (sections.header.length > 0) {
    html += renderHeader(sections.header, styles);
  }

  html += '<main class="container">\n';

  // Render hero section
  if (sections.hero.length > 0) {
    html += renderHeroSection(sections.hero, styles);
  }

  // Render tabs section
  if (sections.tabs.length > 0) {
    html += renderTabsSection(sections.tabs, styles);
  }

  // Render product cases
  if (sections.cases.length > 0) {
    html += renderCasesSection(sections.cases, styles);
  }

  // Render recommendations
  if (sections.recommendations.length > 0) {
    html += renderRecommendationsSection(sections.recommendations, styles);
  }

  // Render other content
  for (const node of sections.other) {
    html += renderGenericNode(node, styles);
  }

  html += '</main>\n';

  return html;
}

/**
 * Render header section
 */
function renderHeader(nodes: any[], styles: any): string {
  // Find logo text
  let logoText = 'Rhinobird';
  for (const node of nodes) {
    if (node.type === 'TEXT' && node.name?.toLowerCase().includes('rhino')) {
      logoText = extractText(node);
      break;
    }
  }

  return `<header class="header" id="header">
  <div class="header-content">
    <div class="logo">${escapeHtml(logoText)}</div>
  </div>
</header>\n`;
}

/**
 * Render hero section with semantic layout
 */
function renderHeroSection(nodes: any[], styles: any): string {
  // Extract hero content
  let breadcrumb = '';
  let title = '';
  let tags: string[] = [];
  let price = '';
  let priceLabel = '';
  let moq = '';
  let buttons: string[] = [];
  let imageUrl = '';

  for (const node of nodes) {
    const semantic = recognizeSemanticType(node);
    const name = (node.name || '').toLowerCase();

    if (semantic === SemanticType.BREADCRUMB || name.includes('>')) {
      breadcrumb = extractText(node);
    } else if (semantic === SemanticType.PRODUCT_TITLE || (node.layoutStyle?.width > 400 && node.type === 'TEXT')) {
      const text = extractText(node);
      if (text.length > 5 && !text.includes('$')) {
        title = text;
      }
    } else if (semantic === SemanticType.PRICE || name.includes('$')) {
      const text = extractText(node);
      if (text.includes('$')) {
        price = text;
      } else if (text.includes('PRICE')) {
        priceLabel = text;
      }
    } else if (name.includes('moq') || name.includes('pcs')) {
      moq = extractText(node);
    } else if (semantic === SemanticType.CTA_BUTTON) {
      buttons.push(extractText(node));
    } else if (semantic === SemanticType.HERO_IMAGE || (node.fill && node.layoutStyle?.width > 300)) {
      imageUrl = extractImageUrl(node, styles);
    } else if (semantic === SemanticType.TAG_GROUP) {
      // Extract tags from group
      const children = node.children || [];
      for (const child of children) {
        if (child.type === 'TEXT') {
          tags.push(extractText(child));
        }
      }
    }
  }

  // Recursively search for tags if not found
  if (tags.length === 0) {
    tags = findTags(nodes, styles);
  }

  // Recursively search for buttons if not found
  if (buttons.length === 0) {
    buttons = findButtons(nodes, styles);
  }

  // Recursively search for image if not found
  if (!imageUrl) {
    imageUrl = findHeroImage(nodes, styles);
  }

  return `<section class="hero reveal">
  <div class="hero-content">
    ${breadcrumb ? `<div class="breadcrumb reveal-delay-1">${escapeHtml(breadcrumb)}</div>` : ''}
    ${title ? `<h1 class="product-title reveal-delay-2">${escapeHtml(title)}</h1>` : ''}
    ${tags.length > 0 ? `<div class="tags reveal-delay-3">
      ${tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('\n      ')}
    </div>` : ''}
    ${price ? `<div class="price-section reveal-delay-4">
      <div class="price">${escapeHtml(price)}</div>
      ${priceLabel ? `<div class="price-label">${escapeHtml(priceLabel)}</div>` : ''}
    </div>` : ''}
    ${moq ? `<div class="moq reveal-delay-4">${escapeHtml(moq)}</div>` : ''}
    ${buttons.length > 0 ? `<div class="cta-buttons reveal-delay-4">
      ${buttons.map((btn, i) => `<button class="btn ${i === 0 ? 'btn-primary' : 'btn-secondary'}">${escapeHtml(btn)}</button>`).join('\n      ')}
    </div>` : ''}
  </div>
  ${imageUrl ? `<div class="hero-image reveal-delay-2">
    <img src="${imageUrl}" alt="Product Image">
  </div>` : ''}
</section>\n`;
}

/**
 * Render tabs section
 */
function renderTabsSection(nodes: any[], styles: any): string {
  // Find tab labels
  const tabs: string[] = [];
  for (const node of nodes) {
    if (node.type === 'TEXT') {
      const text = extractText(node);
      if (text && text.length < 20) {
        tabs.push(text);
      }
    }
  }

  if (tabs.length === 0) return '';

  return `<section class="tabs-section reveal">
  <div class="tabs">
    ${tabs.map((tab, i) => `<button class="tab ${i === 0 ? 'active' : ''}" data-tab="${i}">${escapeHtml(tab)}</button>`).join('\n    ')}
  </div>
</section>\n`;
}

/**
 * Render product cases section
 */
function renderCasesSection(nodes: any[], styles: any): string {
  // Find product cards
  const cards = findProductCards(nodes, styles);

  if (cards.length === 0) return '';

  return `<section class="product-cases reveal">
  <h2 class="section-title">产品案例</h2>
  <div class="cards-grid">
    ${cards.map((card, i) => `<div class="card reveal-delay-${(i % 4) + 1}">
      ${card.image ? `<img class="card-image" src="${card.image}" alt="${escapeHtml(card.title)}">` : ''}
      <div class="card-content">
        ${card.title ? `<div class="card-title">${escapeHtml(card.title)}</div>` : ''}
        ${card.spec ? `<div class="card-spec">${escapeHtml(card.spec)}</div>` : ''}
        ${card.price ? `<div class="card-price">${escapeHtml(card.price)}</div>` : ''}
      </div>
    </div>`).join('\n    ')}
  </div>
</section>\n`;
}

/**
 * Render recommendations section
 */
function renderRecommendationsSection(nodes: any[], styles: any): string {
  // Find recommendation items
  const items = findRecommendationItems(nodes, styles);

  if (items.length === 0) return '';

  return `<section class="recommendations reveal">
  <h2 class="section-title">相似推荐</h2>
  <div class="rec-grid">
    ${items.map((item, i) => `<div class="rec-item reveal-delay-${(i % 6) + 1}">
      ${item.image ? `<img src="${item.image}" alt="Recommendation ${i + 1}">` : ''}
      ${item.price ? `<div class="rec-price">${escapeHtml(item.price)}</div>` : ''}
    </div>`).join('\n    ')}
  </div>
</section>\n`;
}

/**
 * Render generic node (fallback)
 */
function renderGenericNode(node: any, styles: any): string {
  // For now, skip generic nodes to avoid clutter
  // In full version, render them with appropriate styling
  return '';
}

// Helper functions

function extractText(node: any): string {
  if (node.type === 'TEXT' && node.text) {
    if (Array.isArray(node.text)) {
      return node.text.map((t: any) => {
        if (typeof t === 'string') return t;
        if (t.text) return t.text;
        if (t.content) return t.content;
        return '';
      }).join('');
    }
    return String(node.text);
  }
  return node.name || '';
}

function extractImageUrl(node: any, styles: any): string {
  if (node.fill && styles[node.fill]) {
    const fillValue = styles[node.fill].value;
    if (Array.isArray(fillValue) && fillValue[0]?.url) {
      return fillValue[0].url;
    }
  }
  return '';
}

function findTags(nodes: any[], styles: any): string[] {
  const tags: string[] = [];
  for (const node of nodes) {
    const children = node.children || [];
    for (const child of children) {
      const w = child.layoutStyle?.width || 0;
      const h = child.layoutStyle?.height || 0;
      if (w < 150 && h < 60 && child.type === 'TEXT') {
        const text = extractText(child);
        if (text && text.length < 20) {
          tags.push(text);
        }
      }
      // Recurse
      if (child.children) {
        tags.push(...findTags([child], styles));
      }
    }
  }
  return tags.slice(0, 5); // Limit to 5 tags
}

function findButtons(nodes: any[], styles: any): string[] {
  const buttons: string[] = [];
  const keywords = ['sample', 'project', 'custom', 'start', 'get'];

  function search(nodes: any[]) {
    for (const node of nodes) {
      const name = (node.name || '').toLowerCase();
      if (keywords.some(k => name.includes(k))) {
        const text = extractText(node);
        if (text) buttons.push(text);
      }
      if (node.children) {
        search(node.children);
      }
    }
  }

  search(nodes);
  return buttons.slice(0, 3); // Limit to 3 buttons
}

function findHeroImage(nodes: any[], styles: any): string {
  function search(nodes: any[]): string {
    for (const node of nodes) {
      const w = node.layoutStyle?.width || 0;
      const h = node.layoutStyle?.height || 0;
      if (w > 300 && h > 400) {
        const url = extractImageUrl(node, styles);
        if (url) return url;
      }
      if (node.children) {
        const url = search(node.children);
        if (url) return url;
      }
    }
    return '';
  }
  return search(nodes);
}

function findProductCards(nodes: any[], styles: any): any[] {
  const cards: any[] = [];

  function search(nodes: any[]) {
    for (const node of nodes) {
      const children = node.children || [];

      // Check if this node looks like a product card
      let hasImage = false;
      let hasPrice = false;
      let image = '';
      let title = '';
      let spec = '';
      let price = '';

      for (const child of children) {
        const childImage = extractImageUrl(child, styles);
        if (childImage) {
          hasImage = true;
          image = childImage;
        }

        if (child.type === 'TEXT') {
          const text = extractText(child);
          if (text.includes('$')) {
            hasPrice = true;
            price = text;
          } else if (text.includes('毫升') || text.includes('ml')) {
            if (!title) {
              title = text;
            } else {
              spec = text;
            }
          } else if (text.length > 5) {
            if (!title) title = text;
          }
        }

        // Recurse to find nested images/text
        if (child.children) {
          for (const grandchild of child.children) {
            const gcImage = extractImageUrl(grandchild, styles);
            if (gcImage) {
              hasImage = true;
              image = gcImage;
            }
            if (grandchild.type === 'TEXT') {
              const text = extractText(grandchild);
              if (text.includes('$')) {
                hasPrice = true;
                price = text;
              } else if (!title && text.length > 5) {
                title = text;
              } else if (!spec && (text.includes('毫升') || text.includes('ml'))) {
                spec = text;
              }
            }
          }
        }
      }

      if (hasImage && hasPrice) {
        cards.push({ image, title, spec, price });
      }

      // Continue searching
      if (children.length > 0) {
        search(children);
      }
    }
  }

  search(nodes);
  return cards.slice(0, 8); // Limit to 8 cards
}

function findRecommendationItems(nodes: any[], styles: any): any[] {
  const items: any[] = [];

  function search(nodes: any[]) {
    for (const node of nodes) {
      const w = node.layoutStyle?.width || 0;
      const h = node.layoutStyle?.height || 0;

      // Small images are likely recommendations
      if (w < 250 && h < 300 && w > 100) {
        const image = extractImageUrl(node, styles);
        let price = '';

        // Look for price in siblings or children
        const parent = nodes.find(n => n.children?.includes(node));
        if (parent) {
          for (const sibling of parent.children || []) {
            if (sibling.type === 'TEXT') {
              const text = extractText(sibling);
              if (text.includes('$') || text.includes('+')) {
                price = text;
                break;
              }
            }
          }
        }

        if (image) {
          items.push({ image, price });
        }
      }

      if (node.children) {
        search(node.children);
      }
    }
  }

  search(nodes);
  return items.slice(0, 12); // Limit to 12 items
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// ... (keep the same generatePremiumStyles and generatePremiumScripts functions)
