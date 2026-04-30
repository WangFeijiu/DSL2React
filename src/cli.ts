#!/usr/bin/env node
import { DSLValidator } from './modules/parser/dsl-validator';
import { DSLParser } from './modules/parser/dsl-parser';
import { HTMLGenerator } from './modules/generator/html-generator';
import { OutputManager } from './modules/output/output-manager';
import { fetchDSLFromEnv } from './modules/fetcher/mastergo-mcp-client';
import { adaptMasterGoDSL } from './modules/parser/mastergo-dsl-adapter';
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
    console.log('  npm start -- --mcp                  # Fetch from MasterGo via MCP');
    console.log('');
    console.log('Environment variables (.env):');
    console.log('  MG_MCP_TOKEN     - Your MasterGo MCP token');
    console.log('  MG_FILE_ID       - MasterGo file ID');
    console.log('  MG_LAYER_ID      - MasterGo layer ID');
    console.log('');
    console.log('Examples:');
    console.log('  npm run dev                         # Complete pipeline from MasterGo');
    console.log('  npm start example-dsl.json          # Convert local file');
    return;
  }

  try {
    let dslData: any;
    let fileId = process.env.MG_FILE_ID || '';
    let layerId = process.env.MG_LAYER_ID || '';

    // Check if rebuild mode
    if (args[0] === '--rebuild') {
      console.log('🔄 Rebuild mode: using local DSL...');
      const localPath = 'output/raw-mcp-dsl.json';
      if (!fs.existsSync(localPath)) {
        console.error('❌ No local DSL found. Run "npm run dev" first.');
        process.exit(1);
      }
      const content = fs.readFileSync(localPath, 'utf-8');
      dslData = JSON.parse(content);
      console.log('✅ Loaded local DSL');
    }
    // Check if using MCP
    else if (args[0] === '--mcp') {
      console.log('📡 Fetching DSL from MasterGo via MCP...');
      const masterGoDSL = await fetchDSLFromEnv();
      console.log('✅ DSL fetched from MasterGo');

      // Save raw DSL for debugging and rebuild
      if (!fs.existsSync('output')) {
        fs.mkdirSync('output', { recursive: true });
      }
      fs.writeFileSync('output/raw-mcp-dsl.json', JSON.stringify(masterGoDSL, null, 2), 'utf-8');
      console.log('📄 Raw DSL saved to output/raw-mcp-dsl.json');

      // Adapt MasterGo DSL to standard format
      console.log('🔄 Adapting MasterGo DSL format...');
      dslData = adaptMasterGoDSL(masterGoDSL);
      console.log('✅ DSL format adapted');

      // Save adapted DSL
      fs.writeFileSync('output/adapted-dsl.json', JSON.stringify(dslData, null, 2), 'utf-8');
      console.log('📄 Adapted DSL saved to output/adapted-dsl.json');
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
      console.log('⚠️  Note: Use --mcp flag instead:');
      console.log(`   npm run dev`);
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
