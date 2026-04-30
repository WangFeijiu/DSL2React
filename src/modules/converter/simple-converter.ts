/**
 * Simple MasterGo DSL to HTML Converter
 * Pure script, deterministic conversion - NO LLM needed
 *
 * Based on the reference implementation in dsl-generated.html
 */

export interface MasterGoDSLInput {
  dsl: {
    styles: Record<string, any>;
    nodes: any[];
  };
}

/**
 * Convert MasterGo DSL to HTML (single file with inline styles)
 */
export function convertToHTML(input: MasterGoDSLInput): string {
  const { styles, nodes } = input.dsl;

  if (!nodes || nodes.length === 0) {
    throw new Error('No nodes found in DSL');
  }

  const rootNode = nodes[0];
  const title = rootNode.name || 'Generated Page';

  // Build HTML
  let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700;900&display=swap" rel="stylesheet">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    background: #f5f5f5;
    font-family: 'Source Han Sans', 'Noto Sans SC', sans-serif;
    display: flex;
    justify-content: center;
    padding: 20px 0;
}
.canvas {
    position: relative;
    width: ${rootNode.layoutStyle.width}px;
    height: ${rootNode.layoutStyle.height}px;
    background: #f5f5f5;
    overflow: hidden;
    box-shadow: 0 0 50px rgba(0,0,0,0.1);
}
</style>
</head>
<body>
<div class="canvas">
`;

  // Convert root node
  html += convertNode(rootNode, styles, true);

  html += `
</div>
</body>
</html>`;

  return html;
}

/**
 * Convert a single node to HTML with inline styles
 */
function convertNode(node: any, styles: Record<string, any>, isRoot: boolean = false): string {
  const { id, type, name, layoutStyle, fill, strokeColor, text, font, children } = node;

  // Build inline style
  let style = '';

  if (!isRoot) {
    style += 'position: absolute; ';
    style += `left: ${layoutStyle.relativeX || 0}px; `;
    style += `top: ${layoutStyle.relativeY || 0}px; `;
  }

  style += `width: ${layoutStyle.width}px; `;
  style += `height: ${layoutStyle.height}px;`;

  // Handle fill (background)
  if (fill && styles[fill]) {
    const fillStyle = styles[fill].value;
    if (Array.isArray(fillStyle) && fillStyle.length > 0) {
      const fillValue = fillStyle[0];

      if (typeof fillValue === 'string') {
        // Solid color
        style += ` background: ${fillValue};`;
      } else if (fillValue.url) {
        // Image fill
        style += ` background-image: url(${fillValue.url});`;
        style += ` background-size: cover;`;
        style += ` background-position: center;`;
      }
    }
  }

  // Handle text styles
  if (type === 'TEXT' && font && styles[font]) {
    const fontStyle = styles[font].value;

    if (fontStyle.family) {
      style += ` font-family: '${fontStyle.family}', 'Noto Sans SC', sans-serif;`;
    }

    if (fontStyle.size) {
      style += ` font-size: ${fontStyle.size}px;`;
    }

    if (fontStyle.style) {
      try {
        const styleObj = JSON.parse(fontStyle.style);
        if (styleObj.fontStyle) {
          const weightMap: Record<string, number> = {
            'Regular': 400,
            'Medium': 500,
            'Bold': 700,
            'Heavy': 900,
          };
          const weight = weightMap[styleObj.fontStyle] || 400;
          style += ` font-weight: ${weight};`;
        }
      } catch (e) {
        // Ignore parse errors
      }
    }

    if (fontStyle.lineHeight && fontStyle.lineHeight !== 'auto') {
      style += ` line-height: ${fontStyle.lineHeight}px;`;
    }

    // Text color from stroke or fill
    if (strokeColor && styles[strokeColor]) {
      const colorStyle = styles[strokeColor].value;
      if (Array.isArray(colorStyle) && colorStyle[0]) {
        style += ` color: ${colorStyle[0]};`;
      }
    }

    style += ` text-align: left;`;
    style += ` white-space: nowrap;`;
    style += ` overflow: hidden;`;
    style += ` text-overflow: ellipsis;`;
  }

  // Handle border radius
  if (node.borderRadius) {
    if (typeof node.borderRadius === 'number') {
      style += ` border-radius: ${node.borderRadius}px;`;
    } else if (node.borderRadius === 'circle') {
      style += ` border-radius: 50%;`;
    }
  }

  // Generate HTML tag
  let html = '';
  const className = `node-${id.replace(/:/g, '-')}`;

  if (type === 'TEXT') {
    // Text node
    const textContent = extractTextContent(text);
    html += `<div class="${className}" style="${style}">${escapeHtml(textContent)}</div>\n`;
  } else {
    // Container node
    html += `<div class="${className}" style="${style}">`;

    // Recursively convert children
    if (children && children.length > 0) {
      for (const child of children) {
        html += convertNode(child, styles);
      }
    }

    html += `</div>\n`;
  }

  return html;
}

/**
 * Extract text content from MasterGo text array
 */
function extractTextContent(textArray: any): string {
  if (!textArray) return '';

  if (Array.isArray(textArray)) {
    return textArray
      .map(item => {
        if (typeof item === 'string') return item;
        if (item.text) return item.text;
        if (item.content) return item.content;
        return '';
      })
      .join('');
  }

  return String(textArray);
}

/**
 * Escape HTML special characters
 */
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
