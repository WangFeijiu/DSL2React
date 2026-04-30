/**
 * MasterGo DSL Server
 * HTTP API for rebuilding HTML without re-fetching DSL
 */

import http from 'http';
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const OUTPUT_DIR = join(PROJECT_ROOT, 'output');
const PORT = 3456;

// Ensure directories exist
if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

/**
 * Rebuild HTML from existing DSL
 */
async function rebuildHTML(): Promise<{ success: boolean; error?: string }> {
  try {
    const { DSLParser } = await import('./modules/parser/dsl-parser');
    const { HTMLGenerator } = await import('./modules/generator/html-generator');
    const { OutputManager } = await import('./modules/output/output-manager');

    const dslPath = join(OUTPUT_DIR, 'machine-dsl.json');

    if (!existsSync(dslPath)) {
      return { success: false, error: 'machine-dsl.json not found' };
    }

    const dsl = JSON.parse(readFileSync(dslPath, 'utf-8'));

    // Parse
    const parser = new DSLParser();
    const tree = parser.parse(dsl, dsl.id || 'unknown', dsl.id || 'unknown');

    // Generate
    const generator = new HTMLGenerator();
    const code = generator.generate(tree);

    // Write output
    const outputManager = new OutputManager(OUTPUT_DIR);
    const layerId = dsl.id || 'preview';
    outputManager.cleanOldOutput(layerId);
    const paths = outputManager.writeOutput(layerId, code.html, code.css, code.js);

    console.log(`   ✅ HTML rebuilt: ${paths.html}`);

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * HTTP request handler
 */
async function handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://localhost:${PORT}`);

  // Status endpoint
  if (req.method === 'GET' && url.pathname === '/status') {
    const dslExists = existsSync(join(OUTPUT_DIR, 'machine-dsl.json'));
    const outputFiles = existsSync(OUTPUT_DIR)
      ? readdirSync(OUTPUT_DIR).filter((f) => f.endsWith('.html')).length
      : 0;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'ok',
        dslReady: dslExists,
        outputFiles,
      })
    );
    return;
  }

  // Rebuild endpoint
  if (req.method === 'POST' && url.pathname === '/rebuild') {
    console.log('\n🔄 Rebuilding HTML...');

    const result = await rebuildHTML();

    if (!result.success) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: result.error }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: true,
        outputPath: join(OUTPUT_DIR, 'preview.html'),
      })
    );
    return;
  }

  // Save DSL endpoint
  if (req.method === 'POST' && url.pathname === '/save-dsl') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const dsl = JSON.parse(body);
        const dslPath = join(OUTPUT_DIR, 'machine-dsl.json');
        writeFileSync(dslPath, JSON.stringify(dsl, null, 2), 'utf-8');
        console.log('   💾 DSL saved');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (e: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
}

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`\n🚀 DSL2React Server started`);
  console.log(`   API: http://localhost:${PORT}`);
  console.log(`   - GET  /status      Check status`);
  console.log(`   - POST /save-dsl    Save DSL data`);
  console.log(`   - POST /rebuild     Rebuild HTML\n`);
});
