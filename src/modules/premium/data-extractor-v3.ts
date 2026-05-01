/**
 * Data Extractor V3 - Region-based extraction
 * Strategy: Identify regions first, then extract content within each region
 */

import { PageData, HeaderData, HeroData, ButtonData, CaseData, RecData, StructureItem } from './data-extractor';

export class DataExtractorV3 {
  private styles: any;
  private data: PageData;

  constructor(styles: any) {
    this.styles = styles;
    this.data = this.initEmptyData();
  }

  extract(rootNode: any): PageData {
    // Step 1: Identify regions
    const regions = this.identifyRegions(rootNode);

    // Step 2: Extract content from each region
    if (regions.header) this.extractHeader(regions.header);
    if (regions.hero) this.extractHero(regions.hero);
    if (regions.tabs) this.extractTabs(regions.tabs);
    if (regions.cases) this.extractCases(regions.cases);
    if (regions.structure) this.extractStructure(regions.structure);
    if (regions.recommendations) this.extractRecommendations(regions.recommendations);

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
   * Step 1: Identify major regions by y-coordinate
   */
  private identifyRegions(rootNode: any) {
    const regions: any = {
      header: null,
      hero: [],
      tabs: null,
      cases: null,
      structure: [],
      recommendations: []
    };

    const children = rootNode.children || [];

    for (const child of children) {
      const y = child.layoutStyle?.relativeY || 0;

      if (y < 150) {
        regions.header = child;
      } else if (y >= 150 && y < 1100) {
        regions.hero.push(child);
      } else if (y >= 1100 && y < 1800) {
        regions.cases = child;
      } else if (y >= 1800 && y < 1900) {
        regions.tabs = child;
      } else if (y >= 1900 && y < 2400) {
        regions.structure.push(child);
      } else if (y >= 2400) {
        regions.recommendations.push(child);
      }
    }

    return regions;
  }

  /**
   * Extract header content
   */
  private extractHeader(headerNode: any) {
    this.traverseForText(headerNode, (text, node) => {
      if (text.toLowerCase().includes('rhino')) {
        this.data.header.logo = text;
      }
    });
  }

  /**
   * Extract hero section content
   */
  private extractHero(heroNodes: any[]) {
    for (const node of heroNodes) {
      this.traverseNode(node, (n) => {
        const text = this.extractText(n);
        const name = (n.name || '').toLowerCase();
        const y = n.layoutStyle?.relativeY || 0;
        const w = n.layoutStyle?.width || 0;
        const h = n.layoutStyle?.height || 0;

        // Breadcrumb
        if (text.includes('>') && text.includes('home')) {
          this.data.hero.breadcrumb = text;
        }
        // Product title (large text near top)
        else if (y > 150 && y < 300 && w > 400 && text.length > 5 && !text.includes('$') && !this.data.hero.title) {
          this.data.hero.title = text;
        }
        // Price
        else if (text.includes('$') && !text.includes('PRICE') && !this.data.hero.price) {
          this.data.hero.price = text;
        }
        // Price label
        else if (text.includes('PRICE') || text.includes('PCS')) {
          this.data.hero.priceLabel = text;
        }
        // MOQ
        else if (text.includes('MOQ') || (text.includes('pcs') && !text.includes('PRICE'))) {
          if (!this.data.hero.moq) {
            this.data.hero.moq = text;
          }
        }
        // Buttons
        else if (name.includes('sample') || name.includes('project') || name.includes('start')) {
          if (text && !this.data.hero.buttons.find(b => b.text === text)) {
            const isPrimary = name.includes('project') || name.includes('start');
            this.data.hero.buttons.push({ text, type: isPrimary ? 'primary' : 'secondary' });
          }
        }
        // 3D Badge
        else if (text === '3D') {
          this.data.hero.badge3D = text;
        }

        // Tags - only extract from specific tag group nodes
        if (this.isTagNode(n)) {
          // Extract text from the tag's children
          for (const child of n.children || []) {
            if (child.type === 'TEXT') {
              const tagText = this.extractText(child);
              if (tagText && tagText.length < 20 && !tagText.includes('$') && !tagText.includes('>')) {
                if (!this.data.hero.tags.includes(tagText)) {
                  this.data.hero.tags.push(tagText);
                }
              }
            }
          }
        }

        // Hero image
        const imageUrl = this.extractImageUrl(n);
        if (imageUrl && w > 300 && h > 400 && !this.data.hero.image) {
          this.data.hero.image = imageUrl;
        }
      });
    }
  }

  /**
   * Check if a node is a tag (small rounded box)
   */
  private isTagNode(node: any): boolean {
    // Tags are in a specific group structure
    // Each tag is a GROUP with 2 children (background + text)
    const children = node.children || [];
    if (children.length === 2 && node.type === 'GROUP') {
      // Check if one child is text
      for (const child of children) {
        if (child.type === 'TEXT') {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Extract tabs
   */
  private extractTabs(tabsNode: any) {
    if (!tabsNode) return;

    this.traverseForText(tabsNode, (text) => {
      if (text.length > 0 && text.length < 20 && !text.includes('$')) {
        if (!this.data.tabs.tabs.includes(text)) {
          this.data.tabs.tabs.push(text);
        }
      }
    });
  }

  /**
   * Extract product cases - this is the key part
   */
  private extractCases(casesNode: any) {
    if (!casesNode) return;

    // Find all product card groups (组 1072, 1073, 1074, 1075)
    const cardGroups = this.findProductCardGroups(casesNode);

    for (const group of cardGroups) {
      const card = this.extractProductCard(group);
      if (card && card.image && card.price) {
        this.data.cases.push(card);
      }
    }
  }

  /**
   * Find product card groups
   */
  private findProductCardGroups(node: any): any[] {
    const groups: any[] = [];

    const traverse = (n: any) => {
      const children = n.children || [];

      // A product card group has 4 children: image, title, price, spec
      if (children.length === 4) {
        let hasImage = false;
        let hasPrice = false;

        for (const child of children) {
          if (child.fill) hasImage = true;
          if (child.type === 'TEXT') {
            const text = this.extractText(child);
            if (text.includes('$')) hasPrice = true;
          }
        }

        if (hasImage && hasPrice) {
          groups.push(n);
          return; // Don't traverse deeper
        }
      }

      // Continue traversing
      for (const child of children) {
        traverse(child);
      }
    };

    traverse(node);
    return groups;
  }

  /**
   * Extract a single product card
   */
  private extractProductCard(cardNode: any): CaseData | null {
    const children = cardNode.children || [];

    let image = '';
    let title = '';
    let price = '';
    let spec = '';

    for (const child of children) {
      // Image
      const imageUrl = this.extractImageUrl(child);
      if (imageUrl) {
        image = imageUrl;
      }

      // Text
      if (child.type === 'TEXT') {
        const text = this.extractText(child);

        if (text.includes('$')) {
          price = text;
        } else if (text.includes('毫升') || text.includes('液盎司') || text.includes('ml')) {
          spec = text;
        } else if (text.length > 5) {
          title = text;
        }
      }
    }

    if (image && price) {
      return { image, title, price, spec };
    }

    return null;
  }

  /**
   * Extract structure items
   */
  private extractStructure(structureNodes: any[]) {
    for (const node of structureNodes) {
      this.traverseNode(node, (n) => {
        const imageUrl = this.extractImageUrl(n);
        const w = n.layoutStyle?.width || 0;
        const h = n.layoutStyle?.height || 0;

        if (imageUrl && w > 400 && h > 300) {
          // Find title nearby
          const title = this.findTitleForImage(n);
          if (!this.data.structure.items.find(i => i.image === imageUrl)) {
            this.data.structure.items.push({ title, image: imageUrl });
          }
        }
      });
    }
  }

  /**
   * Extract recommendations
   */
  private extractRecommendations(recNodes: any[]) {
    for (const node of recNodes) {
      this.traverseNode(node, (n) => {
        const imageUrl = this.extractImageUrl(n);
        const w = n.layoutStyle?.width || 0;
        const h = n.layoutStyle?.height || 0;

        // Small images are recommendations
        if (imageUrl && w > 100 && w < 250 && h < 300) {
          const price = this.findPriceForImage(n);
          if (!this.data.recommendations.find(r => r.image === imageUrl)) {
            this.data.recommendations.push({ image: imageUrl, price });
          }
        }
      });
    }
  }

  /**
   * Helper: Traverse node and apply callback
   */
  private traverseNode(node: any, callback: (node: any) => void) {
    callback(node);
    const children = node.children || [];
    for (const child of children) {
      this.traverseNode(child, callback);
    }
  }

  /**
   * Helper: Traverse and collect text
   */
  private traverseForText(node: any, callback: (text: string, node: any) => void) {
    if (node.type === 'TEXT') {
      const text = this.extractText(node);
      if (text) {
        callback(text, node);
      }
    }

    const children = node.children || [];
    for (const child of children) {
      this.traverseForText(child, callback);
    }
  }

  /**
   * Find title for an image node
   */
  private findTitleForImage(imageNode: any): string {
    // Look in parent's children
    const parent = imageNode.parent;
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
   * Find price for an image node
   */
  private findPriceForImage(imageNode: any): string {
    // Look in children
    for (const child of imageNode.children || []) {
      if (child.type === 'TEXT') {
        const text = this.extractText(child);
        if (text.includes('$') || text.includes('+')) {
          return text;
        }
      }
    }

    // Look in siblings
    const parent = imageNode.parent;
    if (parent) {
      for (const sibling of parent.children || []) {
        if (sibling.type === 'TEXT') {
          const text = this.extractText(sibling);
          if (text.includes('$') || text.includes('+')) {
            return text;
          }
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
