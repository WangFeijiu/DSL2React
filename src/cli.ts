#!/usr/bin/env node
import { DSLFetcher } from './modules/fetcher/dsl-fetcher';
import { DSLValidator } from './modules/parser/dsl-validator';
import { DSLParser } from './modules/parser/dsl-parser';
import { HTMLGenerator } from './modules/generator/html-generator';
import { OutputManager } from './modules/output/output-manager';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('DSL2React - Convert MasterGo designs to HTML');
    console.log('Usage: dsl2react <mastergo-url> or dsl2react --file <fileId> --layer <layerId>');
    return;
  }

  try {
    // 1. Fetch DSL
    console.log('📥 Fetching DSL data...');
    const fetcher = new DSLFetcher();
    const input = args[0].startsWith('http')
      ? { type: 'url' as const, url: args[0] }
      : { type: 'ids' as const, fileId: args[1], layerId: args[3] };

    const dslData = await fetcher.fetchDSL(input);
    console.log('✅ DSL data fetched');

    // 2. Validate
    console.log('🔍 Validating DSL...');
    const validator = new DSLValidator();
    validator.validate(dslData.raw);
    console.log('✅ DSL validated');

    // 3. Parse
    console.log('🔄 Parsing DSL tree...');
    const parser = new DSLParser();
    const tree = parser.parse(dslData.raw, dslData.metadata.fileId, dslData.metadata.layerId);
    console.log('✅ DSL parsed');

    // 4. Generate HTML
    console.log('🎨 Generating HTML...');
    const generator = new HTMLGenerator();
    const code = generator.generate(tree);
    console.log('✅ HTML generated');

    // 5. Write output
    console.log('💾 Writing output files...');
    const outputManager = new OutputManager();
    outputManager.cleanOldOutput(dslData.metadata.layerId);
    const paths = outputManager.writeOutput(
      dslData.metadata.layerId,
      code.html,
      code.css,
      code.js
    );
    console.log('✅ Output written');

    console.log('\n📄 Generated files:');
    console.log(`  HTML: ${paths.html}`);
    console.log(`  CSS: ${paths.css}`);
    if (paths.js) console.log(`  JS: ${paths.js}`);

    console.log('\n🎉 Conversion complete!');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
