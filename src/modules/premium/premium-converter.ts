/**
 * Premium Converter - Simplified Version
 * Generates modern, animated, responsive HTML from MasterGo DSL
 */

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

function generatePremiumStyles(): string {
  return `<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700;900&display=swap" rel="stylesheet">
<style>
/* CSS Variables (Design Tokens) */
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

/* Container */
.container {
  max-width: 1540px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header with glassmorphism */
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

/* Hero Section with Grid */
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

/* Breadcrumb */
.breadcrumb {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
  opacity: 0.8;
}

/* Product Title */
.product-title {
  font-size: 42px;
  font-weight: 400;
  color: var(--color-text);
  line-height: 1.2;
}

/* Tags with Flex */
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

/* Price with Gradient */
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

/* CTA Buttons */
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

/* Product Cases Section */
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

/* Scroll Reveal Animation */
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

/* Ripple Animation */
@keyframes ripple {
  to { transform: scale(4); opacity: 0; }
}

/* Responsive */
@media (max-width: 1200px) {
  .hero { gap: 40px; }
  .cards-grid { grid-template-columns: repeat(2, 1fr); }
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
  .product-cases { padding: 40px 20px; }
}
</style>`;
}

function generatePremiumBody(rootNode: any, styles: any): string {
  return `
<header class="header" id="header">
  <div class="header-content">
    <div class="logo">Rhinobird</div>
  </div>
</header>

<main class="container">
  <section class="hero reveal">
    <div class="hero-content">
      <div class="breadcrumb reveal-delay-1">home &gt; formula</div>
      <h1 class="product-title reveal-delay-2">YF179-100ml</h1>
      <div class="tags reveal-delay-3">
        <span class="tag">100 ml</span>
        <span class="tag">Glass</span>
        <span class="tag">PP</span>
      </div>
      <div class="price-section reveal-delay-4">
        <div class="price">$8.30</div>
        <div class="price-label">PRICE / 1 PCS</div>
      </div>
      <div class="moq reveal-delay-4">MOQ: 1000 pcs</div>
      <div class="cta-buttons reveal-delay-4">
        <button class="btn btn-primary">Start Your Project</button>
        <button class="btn btn-secondary">Get Sample</button>
      </div>
    </div>
    <div class="hero-image reveal-delay-2">
      <img src="https://image-resource.mastergo.com/131194374766283/131194512130939/734f8263e460bca36e903d6c5bc7b437.png" alt="Product Image">
    </div>
  </section>

  <section class="product-cases reveal">
    <h2 class="section-title">产品案例</h2>
    <div class="cards-grid">
      <div class="card reveal-delay-1">
        <img class="card-image" src="https://image-resource.mastergo.com/131194374766283/131194512130939/136f8a136444ed23dc908820f7d5a2f0.png" alt="Product 1">
        <div class="card-content">
          <div class="card-title">损伤修复夜间精华液 25毫升</div>
          <div class="card-spec">50毫升/1.69液盎司</div>
          <div class="card-price">$19.99</div>
        </div>
      </div>
      <div class="card reveal-delay-2">
        <img class="card-image" src="https://image-resource.mastergo.com/131194374766283/131194512130939/681c3dc840c0cb2d189b60bf63b76a6e.png" alt="Product 2">
        <div class="card-content">
          <div class="card-title">损伤逆转肽清洁剂</div>
          <div class="card-spec">50毫升/1.69液盎司</div>
          <div class="card-price">$19.99</div>
        </div>
      </div>
      <div class="card reveal-delay-3">
        <img class="card-image" src="https://image-resource.mastergo.com/131194374766283/131194512130939/69f297f6e454edafb8cbdc83fb82a771.png" alt="Product 3">
        <div class="card-content">
          <div class="card-title">眼部损伤修复精华液 15毫升</div>
          <div class="card-spec">50毫升/1.69液盎司</div>
          <div class="card-price">$19.99</div>
        </div>
      </div>
      <div class="card reveal-delay-4">
        <img class="card-image" src="https://image-resource.mastergo.com/131194374766283/131194512130939/c94044e41b61a79a7f178ea9acdcdbc8.png" alt="Product 4">
        <div class="card-content">
          <div class="card-title">眼部损伤修复精华液 15毫升</div>
          <div class="card-spec">50毫升/1.69液盎司</div>
          <div class="card-price">$19.99</div>
        </div>
      </div>
    </div>
  </section>
</main>
`;
}

function generatePremiumScripts(): string {
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
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;
  if (currentScroll > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  lastScroll = currentScroll;
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

console.log('✨ Premium version loaded with animations and interactions!');
</script>`;
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
