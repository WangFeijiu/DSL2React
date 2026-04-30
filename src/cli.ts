#!/usr/bin/env node
import { fetchDSLFromEnv } from './modules/fetcher/mastergo-mcp-client';
import { convertToHTML } from './modules/converter/simple-converter';
import * as fs from 'fs';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help') {
    console.log('DSL2React - Convert MasterGo designs to HTML');
    console.log('');
    console.log('Usage:');
    console.log('  npm run dev                         # Fetch from MasterGo via MCP');
    console.log('  npm run dev:rebuild                 # Rebuild from local DSL');
    console.log('  npm start <dsl-file.json>           # Convert from local file');
    console.log('');
    console.log('Environment variables (.env):');
    console.log('  MG_MCP_TOKEN     - Your MasterGo MCP token');
    console.log('  MG_FILE_ID       - MasterGo file ID');
    console.log('  MG_LAYER_ID      - MasterGo layer ID');
    console.log('');
    console.log('Method: Pure script conversion (NO LLM)');
    return;
  }

  try {
    let masterGoDSL: any;
    const layerId = process.env.MG_LAYER_ID || 'output';

    // Ensure output directory exists
    if (!fs.existsSync('output')) {
      fs.mkdirSync('output', { recursive: true });
    }

    // Check if rebuild mode
    if (args[0] === '--rebuild') {
      console.log('🔄 Rebuild mode: using local DSL...');
      const localPath = 'output/raw-mcp-dsl.json';
      if (!fs.existsSync(localPath)) {
        console.error('❌ No local DSL found. Run "npm run dev" first.');
        process.exit(1);
      }
      const content = fs.readFileSync(localPath, 'utf-8');
      masterGoDSL = JSON.parse(content);
      console.log('✅ Loaded local DSL');
    }
    // Check if using MCP
    else if (args[0] === '--mcp') {
      console.log('📡 Fetching DSL from MasterGo via MCP...');
      masterGoDSL = await fetchDSLFromEnv();
      console.log('✅ DSL fetched from MasterGo');

      // Save raw DSL
      fs.writeFileSync('output/raw-mcp-dsl.json', JSON.stringify(masterGoDSL, null, 2), 'utf-8');
      console.log('📄 Raw DSL saved to output/raw-mcp-dsl.json');
    }
    // Check if first arg is a JSON file
    else if (args[0] && args[0].endsWith('.json')) {
      console.log('📥 Loading DSL from file...');
      const content = fs.readFileSync(args[0], 'utf-8');
      masterGoDSL = JSON.parse(content);
      console.log('✅ DSL loaded from file');
    }
    else {
      console.error('❌ Invalid arguments. Use --help for usage.');
      return;
    }

    // Convert using simple converter (pure script, deterministic)
    console.log('🔄 Converting DSL to HTML (pure script, no LLM)...');
    const html = convertToHTML(masterGoDSL);
    console.log('✅ HTML generated');

    // Write output
    const safeLayerId = layerId.replace(/:/g, '-');
    const outputPath = `output/output-${safeLayerId}.html`;

    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`💾 Output written: ${outputPath}`);

    // Calculate file size
    const stats = fs.statSync(outputPath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`📊 File size: ${sizeKB} KB`);

    console.log('\n🎉 Conversion complete!');
    console.log(`💡 Open ${outputPath} in your browser to view the result.`);
    console.log('\n✅ Method: Pure script conversion (deterministic, no LLM)');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
