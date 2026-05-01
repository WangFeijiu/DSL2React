/**
 * Premium Renderer - Generates semantic HTML from universal semantic data
 */

import { UniversalExtractedData, UniversalDataExtractor } from './universal-data-extractor';
import { SemanticNode } from './universal-semantic-engine';

export class PremiumRenderer {
  constructor(private styles: Record<string, any>) {}

  render(data: UniversalExtractedData, extractor: UniversalDataExtractor): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
${this.renderHead(data, extractor)}
</head>
<body>
${this.renderBody(data, extractor)}
${this.renderScripts()}
</body>
</html>`;
  }

  private renderHead(data: UniversalExtractedData, extractor: UniversalDataExtractor): string {
    const title = data.hero ? extractor.getTextContent(data.hero) : 'Premium Page';
    return `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${this.escape(title.substring(0, 50))}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700;900&display=swap" rel="stylesheet">
${this.renderStyles()}`;
  }

  private renderBody(data: UniversalExtractedData, extractor: UniversalDataExtractor): string {
    return `${data.header ? this.renderHeader(data.header, extractor) : ''}
<main class="container">
${data.hero ? this.renderHero(data.hero, extractor) : ''}
${data.tabs.length > 0 ? this.renderTabs(data.tabs, extractor) : ''}
${data.cards.length > 0 ? this.renderCards(data.cards, extractor) : ''}
${data.sections.length > 0 ? this.renderSections(data.sections, extractor) : ''}
</main>`;
  }

  private renderHeader(header: SemanticNode, extractor: UniversalDataExtractor): string {
    const text = extractor.getTextContent(header);
    return `<header class="header" id="header">
  <div class="header-content">
    <div class="logo">${this.escape(text || 'Logo')}</div>
  </div>
</header>`;
  }

  private renderHero(hero: SemanticNode, extractor: UniversalDataExtractor): string {
    const allText = extractor.getTextContent(hero);
    const tags = hero.children.filter(c => c.type === 'TAG');
    const buttons = hero.children.filter(c => c.type === 'BUTTON');

    return `<section class="hero reveal">
  <div class="hero-content">
    <h1 class="product-title reveal-delay-2">${this.escape(allText.substring(0, 100))}</h1>
    ${tags.length > 0 ? `<div class="tags reveal-delay-3">
      ${tags.map(tag => `<span class="tag">${this.escape(extractor.getTextContent(tag))}</span>`).join('\n      ')}
    </div>` : ''}
    ${buttons.length > 0 ? `<div class="cta-buttons reveal-delay-4">
      ${buttons.map(btn => `<button class="btn btn-primary">${this.escape(extractor.getTextContent(btn))}</button>`).join('\n      ')}
    </div>` : ''}
  </div>
</section>`;
  }

  private renderTabs(tabs: SemanticNode[], extractor: UniversalDataExtractor): string {
    return `<section class="tabs-section reveal">
  <div class="tabs">
    ${tabs.map((tab, i) =>
      `<button class="tab ${i === 0 ? 'active' : ''}" data-tab="${i}">${this.escape(extractor.getTextContent(tab))}</button>`
    ).join('\n    ')}
  </div>
  <div class="tab-indicator"></div>
</section>`;
  }

  private renderCards(cards: SemanticNode[], extractor: UniversalDataExtractor): string {
    return `<section class="product-cases reveal">
  <h2 class="section-title">产品案例</h2>
  <div class="cards-grid">
    ${cards.map((card, i) => {
      const text = extractor.getTextContent(card);
      const hasImage = card.features.hasImage;

      return `<div class="card reveal-delay-${(i % 4) + 1}">
      ${hasImage ? `<div class="card-image-wrapper">
        <div class="card-image-placeholder"></div>
      </div>` : ''}
      <div class="card-content">
        <div class="card-title">${this.escape(text)}</div>
      </div>
    </div>`;
    }).join('\n    ')}
  </div>
</section>`;
  }

  private renderSections(sections: SemanticNode[], extractor: UniversalDataExtractor): string {
    return sections.map(section => {
      const text = extractor.getTextContent(section);
      return `<section class="content-section reveal">
  <div class="section-content">${this.escape(text)}</div>
</section>`;
    }).join('\n');
  }

  private renderStyles(): string {
    return `<style>
/* CSS Variables */
:root {
  --color-primary: #5A48F4;
  --color-text: #3D3D3D;
  --color-text-light: rgba(61, 61, 61, 0.6);
  --color-bg: #f5f5f5;
  --color-white: #FFFFFF;
  --radius-md: 18px;
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.04);
  --shadow-md: 0 8px 32px rgba(0,0,0,0.08);
  --shadow-lg: 0 16px 48px rgba(0,0,0,0.12);
  --transition: 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Source Han Sans', 'Noto Sans SC', -apple-system, sans-serif;
  background: var(--color-bg);
  color: var(--color-text);
  line-height: 1.6;
  overflow-x: hidden;
}

.container {
  max-width: 1540px;
  margin: 0 auto;
  padding: 0 20px;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0,0,0,0.06);
  transition: var(--transition);
}
.header.scrolled {
  box-shadow: var(--shadow-md);
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 102px;
  padding: 0 50px;
  max-width: 1540px;
  margin: 0 auto;
}
.logo {
  font-size: 28px;
  font-weight: 900;
  color: var(--color-text);
}

.hero {
  display: grid;
  grid-template-columns: 1fr;
  gap: 60px;
  padding: 60px 50px;
}
.hero-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.product-title {
  font-size: 42px;
  font-weight: 400;
  color: var(--color-text);
  line-height: 1.2;
}

.tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.tag {
  padding: 13px 38px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: var(--radius-md);
  font-size: 16px;
  color: var(--color-text);
  transition: var(--transition);
}
.tag:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.cta-buttons {
  display: flex;
  gap: 16px;
  margin-top: 24px;
  flex-wrap: wrap;
}
.btn {
  padding: 23px 48px;
  border-radius: var(--radius-md);
  font-size: 24px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: var(--transition);
}
.btn-primary {
  background: #000;
  color: #fff;
}
.btn-primary:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.2);
}

.tabs-section {
  padding: 40px 50px 20px;
  border-bottom: 1px solid #D8D8D8;
}
.tabs {
  display: flex;
  gap: 40px;
}
.tab {
  background: none;
  border: none;
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  cursor: pointer;
  padding: 10px 0;
  transition: var(--transition);
  position: relative;
}
.tab.active {
  color: var(--color-primary);
}
.tab.active::after {
  content: '';
  position: absolute;
  bottom: -20px;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color-primary);
}

.product-cases {
  padding: 60px 50px;
}
.section-title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #D8D8D8;
}
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
}
.card {
  background: var(--color-white);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  cursor: pointer;
}
.card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-lg);
}
.card-image-wrapper {
  overflow: hidden;
  background: #f0f0f0;
}
.card-image-placeholder {
  width: 100%;
  aspect-ratio: 1;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
}
.card-content {
  padding: 20px;
}
.card-title {
  font-size: 20px;
  color: var(--color-text);
}

.content-section {
  padding: 40px 50px;
}
.section-content {
  font-size: 18px;
  line-height: 1.8;
  color: var(--color-text);
}

.reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.8s cubic-bezier(0.4,0,0.2,1);
}
.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
.reveal-delay-1 { transition-delay: 0.1s; }
.reveal-delay-2 { transition-delay: 0.2s; }
.reveal-delay-3 { transition-delay: 0.3s; }
.reveal-delay-4 { transition-delay: 0.4s; }

@media (max-width: 768px) {
  .hero { padding: 40px 20px; }
  .header-content { padding: 0 20px; height: 80px; }
  .logo { font-size: 24px; }
  .product-title { font-size: 32px; }
  .cards-grid { grid-template-columns: 1fr; }
  .cta-buttons { flex-direction: column; }
  .btn { width: 100%; }
  .product-cases, .content-section { padding: 40px 20px; }
}
</style>`;
  }

  private renderScripts(): string {
    return `<script>
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

console.log('✨ Universal Premium version loaded!');
</script>`;
  }

  private escape(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}





