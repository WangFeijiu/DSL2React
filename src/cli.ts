#!/usr/bin/env node
import { DSLValidator } from './modules/parser/dsl-validator';
import { DSLParser } from './modules/parser/dsl-parser';
import { HTMLGenerator } from './modules/generator/html-generator';
import { OutputManager } from './modules/output/output-manager';
import { fetchDSLFromEnv } from './modules/fetcher/mastergo-mcp-client';
import * as fs from 'fs';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('DSL2React - Convert MasterGo designs to HTML');
    console.log('');
    console.log('Usage:');
    console.log('  dsl2react <dsl-file.json>           # Convert from local DSL file');
    console.log('  dsl2react --mcp                     # Fetch from MasterGo via MCP');
    console.log('  dsl2react --file <id> --layer <id>  # Fetch from MasterGo (requires API)');
    console.log('');
    console.log('Environment variables:');
    console.log('  MG_MCP_TOKEN     - Your MasterGo MCP token');
    console.log('  MG_FILE_ID       - MasterGo file ID');
    console.log('  MG_LAYER_ID      - MasterGo layer ID');
    return;
  }

  try {
    let dslData: any;
    let fileId = process.env.MG_FILE_ID || '';
    let layerId = process.env.MG_LAYER_ID || '';

    // Check if using MCP
    if (args[0] === '--mcp') {
      console.log('📡 Fetching DSL from MasterGo via MCP...');
      dslData = await fetchDSLFromEnv();
      console.log('✅ DSL fetched from MasterGo');

      // Save raw DSL for debugging
      fs.writeFileSync('output/raw-mcp-dsl.json', JSON.stringify(dslData, null, 2), 'utf-8');
      console.log('📄 Raw DSL saved to output/raw-mcp-dsl.json');
    }
    // Check if first arg is a JSON file
    else if (args[0].endsWith('.json')) {
      console.log('📥 Loading DSL from file...');
      const content = fs.readFileSync(args[0], 'utf-8');
      dslData = JSON.parse(content);
      layerId = dslData.id || 'local';
      console.log('✅ DSL loaded from file');
    }
    // Legacy file/layer args
    else if (args[0] === '--file') {
      fileId = args[1];
      layerId = args[3];

      console.log('📥 Fetching DSL data from MasterGo...');
      console.log(`   File ID: ${fileId}`);
      console.log(`   Layer ID: ${layerId}`);
      console.log('');
      console.log('⚠️  Note: Direct API access not yet implemented.');
      console.log('   Please use --mcp flag or export DSL as JSON from MasterGo:');
      console.log(`   npm start --mcp`);
      console.log(`   npm start dsl-export.json`);
      return;
    } else {
      console.error('❌ Invalid arguments. Use --help for usage.');
      return;
    }

    // 2. Validate
    console.log('🔍 Validating DSL...');
    const validator = new DSLValidator();
    const validatedData = validator.validate(dslData);
    console.log('✅ DSL validated');

    // 3. Parse
    console.log('🔄 Parsing DSL tree...');
    const parser = new DSLParser();
    const tree = parser.parse(validatedData, fileId, layerId);
    console.log(`✅ Parsed ${tree.root.children?.length || 0} top-level elements`);

    // 4. Generate HTML
    console.log('🎨 Generating HTML...');
    const generator = new HTMLGenerator();
    const code = generator.generate(tree);
    console.log('✅ HTML generated');

    // 5. Write output
    console.log('💾 Writing output files...');
    const outputManager = new OutputManager();
    outputManager.cleanOldOutput(layerId);
    const paths = outputManager.writeOutput(layerId, code.html, code.css, code.js);
    console.log('✅ Output written');

    console.log('\n📄 Generated files:');
    console.log(`  HTML: ${paths.html}`);
    console.log(`  CSS: ${paths.css}`);
    if (paths.js) console.log(`  JS: ${paths.js}`);

    console.log('\n🎉 Conversion complete!');
    console.log(`\n💡 Open ${paths.html} in your browser to view the result.`);
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
