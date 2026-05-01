/**
 * Data Structures for Premium Converter
 */

export interface PageData {
  header: HeaderData;
  hero: HeroData;
  tabs: TabData;
  details: DetailData;
  cases: CaseData[];
  recommendations: RecData[];
  structure: StructureData;
}

export interface HeaderData {
  logo: string;
  languageIcon?: string;
}

export interface HeroData {
  breadcrumb: string;
  title: string;
  tags: string[];
  price: string;
  priceLabel: string;
  moq: string;
  buttons: ButtonData[];
  image: string;
  badge3D?: string;
  specs: SpecItem[];
}

export interface ButtonData {
  text: string;
  type: 'primary' | 'secondary';
}

export interface SpecItem {
  label: string;
  value: string;
}

export interface TabData {
  tabs: string[];
  activeTab: number;
}

export interface DetailData {
  volume: string;
  category: string;
  items: DetailItem[];
}

export interface DetailItem {
  title: string;
  image?: string;
}

export interface CaseData {
  image: string;
  title: string;
  spec: string;
  price: string;
}

export interface RecData {
  image: string;
  price: string;
}

export interface StructureData {
  items: StructureItem[];
}

export interface StructureItem {
  title: string;
  image: string;
}

/**
 * Data Extractor - Traverses DSL tree and extracts all data
 */
export class DataExtractor {
  private styles: any;
  private data: PageData;

  constructor(styles: any) {
    this.styles = styles;
    this.data = this.initEmptyData();
  }

  extract(rootNode: any): PageData {
    const children = rootNode.children || [];

    // Traverse all children and categorize by position
    for (const child of children) {
      this.processNode(child);
    }

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

  private processNode(node: any, depth: number = 0) {
    const y = node.layoutStyle?.relativeY || 0;
    const x = node.layoutStyle?.relativeX || 0;
    const w = node.layoutStyle?.width || 0;
    const h = node.layoutStyle?.height || 0;

    // Categorize by vertical position
    if (y < 150) {
      this.extractHeader(node);
    } else if (y >= 150 && y < 1100) {
      this.extractHero(node);
    } else if (y >= 1100 && y < 1800) {
      this.extractCases(node);
    } else if (y >= 1800 && y < 1950) {
      this.extractTabs(node);
    } else if (y >= 1920 && y < 2400) {
      this.extractStructure(node);
    } else if (y >= 2400) {
      this.extractRecommendations(node);
    }

    // Recursively process children
    const children = node.children || [];
    for (const child of children) {
      this.processNode(child, depth + 1);
    }
  }

  private extractHeader(node: any) {
    if (node.type === 'TEXT') {
      const text = this.extractText(node);
      if (text && text.toLowerCase().includes('rhino')) {
        this.data.header.logo = text;
      }
    }
  }

  private extractHero(node: any) {
    const text = this.extractText(node);
    const name = (node.name || '').toLowerCase();
    const y = node.layoutStyle?.relativeY || 0;
    const w = node.layoutStyle?.width || 0;
    const h = node.layoutStyle?.height || 0;

    // Breadcrumb
    if (text.includes('>') || name.includes('home')) {
      this.data.hero.breadcrumb = text;
    }
    // Title
    else if (y > 150 && y < 300 && w > 400 && text.length > 5 && !text.includes('$')) {
      if (!this.data.hero.title) {
        this.data.hero.title = text;
      }
    }
    // Price
    else if (text.includes('$')) {
      this.data.hero.price = text;
    }
    else if (text.includes('PRICE') || text.includes('PCS')) {
      this.data.hero.priceLabel = text;
    }
    // MOQ
    else if (text.includes('MOQ') || (text.includes('pcs') && !text.includes('PRICE'))) {
      this.data.hero.moq = text;
    }
    // Volume
    else if (text.includes('Volume') || name.includes('volume')) {
      this.data.details.volume = text;
    }
    // Category
    else if (text.includes('适用品类') || name.includes('适用')) {
      this.data.details.category = text;
    }
    // Tags (small rounded boxes)
    else if (w < 150 && h < 60 && text.length < 20 && text.length > 0) {
      if (!this.data.hero.tags.includes(text) &&
          !text.includes('$') &&
          !text.includes('>') &&
          text !== this.data.hero.title) {
        this.data.hero.tags.push(text);
      }
    }
    // Buttons
    else if (name.includes('sample') || name.includes('project') ||
             name.includes('start') || name.includes('get')) {
      if (text && !this.data.hero.buttons.find(b => b.text === text)) {
        const isPrimary = name.includes('project') || name.includes('start');
        this.data.hero.buttons.push({
          text,
          type: isPrimary ? 'primary' : 'secondary'
        });
      }
    }
    // 3D Badge
    else if (text === '3D' || name.includes('3d')) {
      this.data.hero.badge3D = text;
    }
    // Hero Image
    const imageUrl = this.extractImageUrl(node);
    if (imageUrl && w > 300 && h > 400 && !this.data.hero.image) {
      this.data.hero.image = imageUrl;
    }
  }

  private extractTabs(node: any) {
    const text = this.extractText(node);
    const y = node.layoutStyle?.relativeY || 0;

    if (node.type === 'TEXT' && y >= 1800 && y < 1900 && text.length < 20 && text.length > 0) {
      if (!this.data.tabs.tabs.includes(text)) {
        this.data.tabs.tabs.push(text);
      }
    }
  }

  private extractCases(node: any) {
    const children = node.children || [];

    // Check if this node is a product card
    let hasImage = false;
    let hasPrice = false;
    let image = '';
    let title = '';
    let spec = '';
    let price = '';

    // Check direct children
    for (const child of children) {
      const childImage = this.extractImageUrl(child);
      if (childImage) {
        hasImage = true;
        image = childImage;
      }

      if (child.type === 'TEXT') {
        const text = this.extractText(child);
        if (text.includes('$')) {
          hasPrice = true;
          price = text;
        } else if (text.includes('毫升') || text.includes('液盎司')) {
          spec = text;
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
          } else if ((text.includes('毫升') || text.includes('液盎司')) && !spec) {
            spec = text;
          } else if (text.length > 5 && !title) {
            title = text;
          }
        }
      }
    }

    // If this looks like a product card, add it
    if (hasImage && hasPrice && !this.data.cases.find(c => c.image === image)) {
      this.data.cases.push({ image, title, spec, price });
    }
  }

  private extractStructure(node: any) {
    const text = this.extractText(node);
    const imageUrl = this.extractImageUrl(node);
    const y = node.layoutStyle?.relativeY || 0;
    const w = node.layoutStyle?.width || 0;
    const h = node.layoutStyle?.height || 0;

    // Structure items (large images with titles)
    if (imageUrl && w > 400 && h > 300 && y >= 1920) {
      // Find associated title
      let title = '';
      const parent = node.parent;
      if (parent) {
        for (const sibling of parent.children || []) {
          if (sibling.type === 'TEXT') {
            const siblingText = this.extractText(sibling);
            if (siblingText.length < 20) {
              title = siblingText;
              break;
            }
          }
        }
      }

      if (!this.data.structure.items.find(i => i.image === imageUrl)) {
        this.data.structure.items.push({ title: title || text, image: imageUrl });
      }
    }
  }

  private extractRecommendations(node: any) {
    const imageUrl = this.extractImageUrl(node);
    const w = node.layoutStyle?.width || 0;
    const h = node.layoutStyle?.height || 0;
    const y = node.layoutStyle?.relativeY || 0;

    // Small images are recommendations
    if (imageUrl && w < 250 && h < 300 && w > 100 && y >= 2400) {
      // Find price in siblings
      let price = '';
      const children = node.children || [];
      for (const child of children) {
        if (child.type === 'TEXT') {
          const text = this.extractText(child);
          if (text.includes('$') || text.includes('+')) {
            price = text;
            break;
          }
        }
      }

      if (!this.data.recommendations.find(r => r.image === imageUrl)) {
        this.data.recommendations.push({ image: imageUrl, price });
      }
    }
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
