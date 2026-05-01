/**
 * Premium Renderer - Generates semantic HTML from extracted data
 */

import { PageData, CaseData, RecData } from './data-extractor';

export class PremiumRenderer {
  render(data: PageData): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
${this.renderHead(data)}
</head>
<body>
${this.renderBody(data)}
${this.renderScripts()}
</body>
</html>`;
  }

  private renderHead(data: PageData): string {
    const title = data.hero.title || 'Premium Page';
    return `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${this.escape(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700;900&display=swap" rel="stylesheet">
${this.renderStyles()}`;
  }

  private renderBody(data: PageData): string {
    return `${this.renderHeader(data.header)}
<main class="container">
${this.renderHero(data.hero)}
${data.tabs.tabs.length > 0 ? this.renderTabs(data.tabs) : ''}
${data.cases.length > 0 ? this.renderCases(data.cases) : ''}
${data.structure.items.length > 0 ? this.renderStructure(data.structure) : ''}
${data.recommendations.length > 0 ? this.renderRecommendations(data.recommendations) : ''}
</main>`;
  }

  private renderHeader(header: any): string {
    return `<header class="header" id="header">
  <div class="header-content">
    <div class="logo">${this.escape(header.logo || 'Rhinobird')}</div>
  </div>
</header>`;
  }

  private renderHero(hero: any): string {
    return `<section class="hero reveal">
  <div class="hero-content">
    ${hero.breadcrumb ? `<div class="breadcrumb reveal-delay-1">${this.escape(hero.breadcrumb)}</div>` : ''}
    ${hero.title ? `<h1 class="product-title reveal-delay-2">${this.escape(hero.title)}</h1>` : ''}
    ${hero.tags.length > 0 ? `<div class="tags reveal-delay-3">
      ${hero.tags.map((tag: string) => `<span class="tag">${this.escape(tag)}</span>`).join('\n      ')}
    </div>` : ''}
    ${hero.price ? `<div class="price-section reveal-delay-4">
      <div class="price">${this.escape(hero.price)}</div>
      ${hero.priceLabel ? `<div class="price-label">${this.escape(hero.priceLabel)}</div>` : ''}
    </div>` : ''}
    ${hero.moq ? `<div class="moq reveal-delay-4">${this.escape(hero.moq)}</div>` : ''}
    ${hero.buttons.length > 0 ? `<div class="cta-buttons reveal-delay-4">
      ${hero.buttons.map((btn: any) =>
        `<button class="btn btn-${btn.type}">${this.escape(btn.text)}</button>`
      ).join('\n      ')}
    </div>` : ''}
  </div>
  ${hero.image ? `<div class="hero-image reveal-delay-2">
    <img src="${hero.image}" alt="${this.escape(hero.title)}">
    ${hero.badge3D ? `<div class="badge-3d">${this.escape(hero.badge3D)}</div>` : ''}
  </div>` : ''}
</section>`;
  }

  private renderTabs(tabs: any): string {
    return `<section class="tabs-section reveal">
  <div class="tabs">
    ${tabs.tabs.map((tab: string, i: number) =>
      `<button class="tab ${i === 0 ? 'active' : ''}" data-tab="${i}">${this.escape(tab)}</button>`
    ).join('\n    ')}
  </div>
  <div class="tab-indicator"></div>
</section>`;
  }

  private renderCases(cases: CaseData[]): string {
    return `<section class="product-cases reveal">
  <h2 class="section-title">产品案例</h2>
  <div class="cards-grid">
    ${cases.map((card, i) => `<div class="card reveal-delay-${(i % 4) + 1}">
      ${card.image ? `<div class="card-image-wrapper">
        <img class="card-image" src="${card.image}" alt="${this.escape(card.title)}">
      </div>` : ''}
      <div class="card-content">
        ${card.title ? `<div class="card-title">${this.escape(card.title)}</div>` : ''}
        ${card.spec ? `<div class="card-spec">${this.escape(card.spec)}</div>` : ''}
        ${card.price ? `<div class="card-price">${this.escape(card.price)}</div>` : ''}
      </div>
    </div>`).join('\n    ')}
  </div>
</section>`;
  }

  private renderStructure(structure: any): string {
    return `<section class="structure-section reveal">
  <div class="structure-grid">
    ${structure.items.map((item: any, i: number) => `<div class="structure-item reveal-delay-${(i % 2) + 1}">
      ${item.title ? `<h3 class="structure-title">${this.escape(item.title)}</h3>` : ''}
      ${item.image ? `<div class="structure-image">
        <img src="${item.image}" alt="${this.escape(item.title)}">
      </div>` : ''}
    </div>`).join('\n    ')}
  </div>
</section>`;
  }

  private renderRecommendations(recs: RecData[]): string {
    return `<section class="recommendations reveal">
  <h2 class="section-title">相似推荐</h2>
  <div class="rec-grid">
    ${recs.map((item, i) => `<div class="rec-item reveal-delay-${(i % 6) + 1}">
      ${item.image ? `<div class="rec-image">
        <img src="${item.image}" alt="Recommendation ${i + 1}">
      </div>` : ''}
      ${item.price ? `<div class="rec-price">${this.escape(item.price)}</div>` : ''}
    </div>`).join('\n    ')}
  </div>
</section>`;
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

/* Reset & Base */
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

/* Header */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
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

/* Hero Section */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  padding: 60px 50px;
  align-items: center;
}
.hero-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.hero-image {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  transition: var(--transition);
  background: #F9F9F9;
}
.hero-image:hover {
  transform: translateY(-8px);
  box-shadow: 0 24px 64px rgba(0,0,0,0.16);
}
.hero-image img {
  width: 100%;
  height: auto;
  display: block;
  transition: var(--transition);
}
.hero-image:hover img {
  transform: scale(1.05);
}
.badge-3d {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: #3D3D3D;
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 36px;
  font-weight: 700;
  animation: float 3s ease-in-out infinite;
}

/* Text Elements */
.breadcrumb {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
  opacity: 0.8;
}
.product-title {
  font-size: 42px;
  font-weight: 400;
  color: var(--color-text);
  line-height: 1.2;
}

/* Tags */
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

/* Price */
.price-section {
  display: flex;
  align-items: baseline;
  gap: 16px;
  flex-wrap: wrap;
}
.price {
  font-size: 56px;
  font-weight: 400;
  background: linear-gradient(135deg, #5A48F4 0%, #8B7FFF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.price-label {
  font-size: 24px;
  color: var(--color-text-light);
}
.moq {
  font-size: 24px;
  color: var(--color-text);
}

/* Buttons */
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
  position: relative;
  overflow: hidden;
}
.btn-primary {
  background: #000;
  color: #fff;
}
.btn-primary:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.2);
}
.btn-secondary {
  background: rgba(0, 0, 0, 0.06);
  color: #4D4D4D;
}
.btn-secondary:hover {
  background: rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* Tabs */
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

/* Product Cases */
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
}
.card-image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  transition: var(--transition);
}
.card:hover .card-image {
  transform: scale(1.1);
}
.card-content {
  padding: 20px;
}
.card-title {
  font-size: 20px;
  margin-bottom: 8px;
  color: var(--color-text);
}
.card-spec {
  font-size: 16px;
  color: var(--color-text-light);
  margin-bottom: 8px;
}
.card-price {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
}

/* Structure Section */
.structure-section {
  padding: 60px 50px;
}
.structure-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
}
.structure-item {
  background: var(--color-white);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.structure-title {
  font-size: 24px;
  font-weight: 900;
  padding: 20px;
}
.structure-image img {
  width: 100%;
  height: auto;
  display: block;
}

/* Recommendations */
.recommendations {
  padding: 60px 50px;
}
.rec-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 24px;
}
.rec-item {
  background: var(--color-white);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  cursor: pointer;
}
.rec-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}
.rec-image img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}
.rec-price {
  padding: 12px;
  font-size: 18px;
  font-weight: 400;
  color: var(--color-text);
  text-align: center;
}

/* Animations */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
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

/* Responsive */
@media (max-width: 1200px) {
  .hero { gap: 40px; }
  .cards-grid { grid-template-columns: repeat(2, 1fr); }
  .structure-grid { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .hero {
    grid-template-columns: 1fr;
    padding: 40px 20px;
  }
  .header-content { padding: 0 20px; height: 80px; }
  .logo { font-size: 24px; }
  .product-title { font-size: 32px; }
  .price { font-size: 42px; }
  .cards-grid { grid-template-columns: 1fr; }
  .cta-buttons { flex-direction: column; }
  .btn { width: 100%; }
  .product-cases, .structure-section, .recommendations { padding: 40px 20px; }
  .rec-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>`;
  }

  private renderScripts(): string {
    return `<script>
// Scroll Reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Header scroll effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// Button ripple effect
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = \`
      position: absolute;
      width: \${size}px;
      height: \${size}px;
      left: \${x}px;
      top: \${y}px;
      border-radius: 50%;
      background: rgba(255,255,255,0.5);
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      pointer-events: none;
    \`;

    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// Add ripple animation
const style = document.createElement('style');
style.textContent = \`
@keyframes ripple {
  to { transform: scale(4); opacity: 0; }
}
\`;
document.head.appendChild(style);

console.log('✨ Premium version loaded - Full content with animations!');
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
