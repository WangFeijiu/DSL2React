/**
 * Data Extractor - Improved with deep traversal
 */

import { PageData, HeaderData, HeroData, ButtonData, CaseData, RecData, StructureItem } from './data-extractor';

export class DataExtractorV2 {
  private styles: any;
  private data: PageData;

  constructor(styles: any) {
    this.styles = styles;
    this.data = this.initEmptyData();
  }

  extract(rootNode: any): PageData {
    // Deep traverse the entire tree
    this.deepTraverse(rootNode);

    return this.data;
  }

  private initEmptyData(): PageData {
    return {
      header: { logo: '' },
      hero: {
        breadcrumb: '',
        title: '',
        tags: [],
        price: '',
        priceLabel: '',
        moq: '',
        buttons: [],
        image: '',
        specs: []
      },
      tabs: { tabs: [], activeTab: 0 },
      details: { volume: '', category: '', items: [] },
      cases: [],
      recommendations: [],
      structure: { items: [] }
    };
  }

  /**
   * Deep traverse - visit every node in the tree
   */
  private deepTraverse(node: any, depth: number = 0) {
    // Process current node
    this.processNode(node, depth);

    // Recursively process all children
    const children = node.children || [];
    for (const child of children) {
      this.deepTraverse(child, depth + 1);
    }
  }

  /**
   * Process a single node based on its characteristics
   */
  private processNode(node: any, depth: number) {
    const y = node.layoutStyle?.relativeY || 0;
    const x = node.layoutStyle?.relativeX || 0;
    const w = node.layoutStyle?.width || 0;
    const h = node.layoutStyle?.height || 0;
    const text = this.extractText(node);
    const name = (node.name || '').toLowerCase();
    const type = node.type;

    // Extract based on node characteristics, not just position

    // Header (top area)
    if (y < 150 && type === 'TEXT' && name.includes('rhino')) {
      this.data.header.logo = text;
    }

    // Breadcrumb
    if (text.includes('>') || text.includes('home')) {
      this.data.hero.breadcrumb = text;
    }

    // Product title (large text near top)
    if (y > 150 && y < 300 && w > 400 && type === 'TEXT' && text.length > 5 && !text.includes('$')) {
      if (!this.data.hero.title) {
        this.data.hero.title = text;
      }
    }

    // Price
    if (text.includes('$') && !text.includes('PRICE')) {
      if (!this.data.hero.price) {
        this.data.hero.price = text;
      }
    }

    // Price label
    if (text.includes('PRICE') || text.includes('PCS')) {
      this.data.hero.priceLabel = text;
    }

    // MOQ
    if ((text.includes('MOQ') || (text.includes('pcs') && !text.includes('PRICE'))) && text.length < 30) {
      this.data.hero.moq = text;
    }

    // Tags (small rounded boxes with short text)
    if (w > 80 && w < 150 && h > 30 && h < 60 && type === 'TEXT' && text.length > 0 && text.length < 20) {
      if (!text.includes('$') && !text.includes('>') && text !== this.data.hero.title) {
        if (!this.data.hero.tags.includes(text)) {
          this.data.hero.tags.push(text);
        }
      }
    }

    // Buttons
    if (name.includes('sample') || name.includes('project') || name.includes('start') || name.includes('get')) {
      if (text && !this.data.hero.buttons.find(b => b.text === text)) {
        const isPrimary = name.includes('project') || name.includes('start');
        this.data.hero.buttons.push({
          text,
          type: isPrimary ? 'primary' : 'secondary'
        });
      }
    }

    // Hero image (large image)
    const imageUrl = this.extractImageUrl(node);
    if (imageUrl && w > 300 && h > 400 && y < 1100 && !this.data.hero.image) {
      this.data.hero.image = imageUrl;
    }

    // 3D Badge
    if (text === '3D' || name.includes('3d')) {
      this.data.hero.badge3D = text;
    }

    // Tabs (text in tabs area)
    if (y >= 1800 && y < 1900 && type === 'TEXT' && text.length > 0 && text.length < 20) {
      if (!this.data.tabs.tabs.includes(text) && !text.includes('$')) {
        this.data.tabs.tabs.push(text);
      }
    }

    // Product cards - look for nodes with specific characteristics
    this.tryExtractProductCard(node);

    // Structure items (large images with titles)
    if (imageUrl && w > 400 && h > 300 && y >= 1920 && y < 2400) {
      const title = this.findNearbyTitle(node);
      if (!this.data.structure.items.find(i => i.image === imageUrl)) {
        this.data.structure.items.push({ title: title || text, image: imageUrl });
      }
    }

    // Recommendations (small images)
    if (imageUrl && w > 100 && w < 250 && h < 300 && y >= 2400) {
      const price = this.findNearbyPrice(node);
      if (!this.data.recommendations.find(r => r.image === imageUrl)) {
        this.data.recommendations.push({ image: imageUrl, price });
      }
    }
  }

  /**
   * Try to extract a product card from a node
   */
  private tryExtractProductCard(node: any) {
    const children = node.children || [];

    // A product card typically has:
    // - An image
    // - A title (text)
    // - A spec (text with 毫升 or ml)
    // - A price (text with $)

    let hasImage = false;
    let hasPrice = false;
    let image = '';
    let title = '';
    let spec = '';
    let price = '';

    // Check direct children
    for (const child of children) {
      const childImage = this.extractImageUrl(child);
      if (childImage && !image) {
        hasImage = true;
        image = childImage;
      }

      if (child.type === 'TEXT') {
        const text = this.extractText(child);
        if (text.includes('$')) {
          hasPrice = true;
          price = text;
        } else if (text.includes('毫升') || text.includes('液盎司') || text.includes('ml')) {
          if (!spec) spec = text;
          else if (!title) title = text;
        } else if (text.length > 5 && !title) {
          title = text;
        }
      }

      // Check grandchildren
      const grandchildren = child.children || [];
      for (const grandchild of grandchildren) {
        const gcImage = this.extractImageUrl(grandchild);
        if (gcImage && !image) {
          hasImage = true;
          image = gcImage;
        }

        if (grandchild.type === 'TEXT') {
          const text = this.extractText(grandchild);
          if (text.includes('$') && !price) {
            hasPrice = true;
            price = text;
          } else if ((text.includes('毫升') || text.includes('液盎司') || text.includes('ml')) && !spec) {
            spec = text;
          } else if (text.length > 5 && !title) {
            title = text;
          }
        }
      }
    }

    // If this looks like a product card, add it
    if (hasImage && hasPrice && image && !this.data.cases.find(c => c.image === image)) {
      this.data.cases.push({ image, title, spec, price });
    }
  }

  /**
   * Find nearby title for a node
   */
  private findNearbyTitle(node: any): string {
    // Look in siblings
    const parent = node.parent;
    if (parent) {
      for (const sibling of parent.children || []) {
        if (sibling.type === 'TEXT') {
          const text = this.extractText(sibling);
          if (text.length > 0 && text.length < 20) {
            return text;
          }
        }
      }
    }
    return '';
  }

  /**
   * Find nearby price for a node
   */
  private findNearbyPrice(node: any): string {
    // Look in children
    for (const child of node.children || []) {
      if (child.type === 'TEXT') {
        const text = this.extractText(child);
        if (text.includes('$') || text.includes('+')) {
          return text;
        }
      }
    }
    return '';
  }

  private extractText(node: any): string {
    if (node.type === 'TEXT' && node.text) {
      if (Array.isArray(node.text)) {
        return node.text.map((t: any) => {
          if (typeof t === 'string') return t;
          if (t.text) return t.text;
          if (t.content) return t.content;
          return '';
        }).join('');
      }
      if (typeof node.text === 'string') {
        return node.text;
      }
      return String(node.text);
    }
    return '';
  }

  private extractImageUrl(node: any): string {
    if (node.fill && this.styles[node.fill]) {
      const fillValue = this.styles[node.fill].value;
      if (Array.isArray(fillValue) && fillValue[0]?.url) {
        return fillValue[0].url;
      }
    }
    return '';
  }
}
