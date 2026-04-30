import { ParsedTree, ElementNode } from '../../types/dsl-schema';

export interface GeneratedCode {
  html: string;
  css: string;
  js?: string;
  assets: Asset[];
  metadata: GenerationMetadata;
}

export interface Asset {
  type: 'image' | 'icon' | 'font';
  url: string;
  localPath?: string;
}

export interface GenerationMetadata {
  generatedAt: Date;
  layerId: string;
  version: string;
}

export class HTMLGenerator {
  private cssRules: string[] = [];
  private jsCode: string[] = [];
  private assets: Asset[] = [];

  /**
   * Generate HTML from parsed tree
   */
  generate(tree: ParsedTree): GeneratedCode {
    this.cssRules = [];
    this.jsCode = [];
    this.assets = [];

    const bodyContent = this.generateElement(tree.root);

    const html = this.wrapInDocument(bodyContent, tree.metadata.layerId);

    return {
      html,
      css: this.cssRules.join('\n\n'),
      js: this.jsCode.length > 0 ? this.jsCode.join('\n\n') : undefined,
      assets: this.assets,
      metadata: {
        generatedAt: new Date(),
        layerId: tree.metadata.layerId,
        version: tree.metadata.version || '1.0',
      },
    };
  }

  /**
   * Generate HTML element recursively
   */
  private generateElement(node: ElementNode, depth: number = 0): string {
    const indent = '  '.repeat(depth);
    const tag = this.getHTMLTag(node.type);
    const className = this.generateClassName(node);
    const attributes = this.generateAttributes(node);

    let html = `${indent}<${tag} class="${className}"${attributes}>`;

    // Add content for text nodes
    if (node.content?.type === 'text') {
      html += this.escapeHtml(node.content.value);
    }

    // Add children
    if (node.children && node.children.length > 0) {
      html += '\n';
      for (const child of node.children) {
        html += this.generateElement(child, depth + 1) + '\n';
      }
      html += indent;
    }

    html += `</${tag}>`;

    // Generate CSS for this element
    this.generateCSS(node, className);

    return html;
  }

  /**
   * Get semantic HTML tag for element type
   */
  private getHTMLTag(type: ElementNode['type']): string {
    const tagMap: Record<ElementNode['type'], string> = {
      container: 'div',
      text: 'p',
      image: 'img',
      button: 'button',
      icon: 'i',
      input: 'input',
      group: 'div',
    };

    return tagMap[type] || 'div';
  }

  /**
   * Generate CSS class name from node
   */
  private generateClassName(node: ElementNode): string {
    // Sanitize name for CSS class
    const sanitized = node.name
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return `${node.type}-${sanitized}`;
  }

  /**
   * Generate HTML attributes
   */
  private generateAttributes(node: ElementNode): string {
    const attrs: string[] = [];

    if (node.type === 'image' && node.content?.type === 'image') {
      attrs.push(`src="${node.content.url}"`);
      if (node.content.alt) {
        attrs.push(`alt="${this.escapeHtml(node.content.alt)}"`);
      }
    }

    if (node.type === 'button') {
      attrs.push('type="button"');
    }

    return attrs.length > 0 ? ' ' + attrs.join(' ') : '';
  }

  /**
   * Generate CSS rules for element
   */
  private generateCSS(node: ElementNode, className: string): void {
    const rules: string[] = [];

    // Layout
    const { layout } = node;
    if (layout.position) {
      rules.push(`  position: ${layout.positioning || 'relative'};`);
      if (layout.positioning === 'absolute') {
        rules.push(`  left: ${layout.position.x}px;`);
        rules.push(`  top: ${layout.position.y}px;`);
      }
    }

    if (layout.size) {
      rules.push(`  width: ${layout.size.width}px;`);
      rules.push(`  height: ${layout.size.height}px;`);
    }

    if (layout.display) {
      rules.push(`  display: ${layout.display};`);
    }

    // Styles
    const { styles } = node;
    if (styles.colors?.background) {
      rules.push(`  background-color: ${styles.colors.background};`);
    }

    if (styles.colors?.text) {
      rules.push(`  color: ${styles.colors.text};`);
    }

    if (styles.typography) {
      const { fontFamily, fontSize, fontWeight, lineHeight } = styles.typography;
      rules.push(`  font-family: ${fontFamily};`);
      rules.push(`  font-size: ${fontSize}px;`);
      rules.push(`  font-weight: ${fontWeight};`);
      rules.push(`  line-height: ${lineHeight}px;`);
    }

    if (styles.opacity !== undefined) {
      rules.push(`  opacity: ${styles.opacity};`);
    }

    if (rules.length > 0) {
      this.cssRules.push(`.${className} {\n${rules.join('\n')}\n}`);
    }
  }

  /**
   * Wrap content in full HTML document
   */
  private wrapInDocument(bodyContent: string, layerId: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated from Layer ${layerId}</title>
  <link rel="stylesheet" href="output-${layerId}.css">
</head>
<body>
${bodyContent}
</body>
</html>`;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  }
}
