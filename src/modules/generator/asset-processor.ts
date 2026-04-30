import { ElementNode } from '../../types/dsl-schema';
import { Asset } from '../generator/html-generator';

export class AssetProcessor {
  processImage(node: ElementNode): Asset | null {
    if (node.content?.type === 'image') {
      return {
        type: 'image',
        url: node.content.url,
      };
    }
    return null;
  }

  generateImageTag(node: ElementNode): string {
    if (node.content?.type === 'image') {
      const alt = node.content.alt || node.name;
      return `<img src="${node.content.url}" alt="${alt}" />`;
    }
    return '';
  }
}
