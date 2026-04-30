#!/usr/bin/env node

/**
 * MasterGo Data Fetcher Helper
 *
 * This script helps you fetch data from MasterGo using different methods.
 */

const https = require('https');
const fs = require('fs');

const FILE_ID = process.env.MG_FILE_ID || '180662635664641';
const LAYER_ID = process.env.MG_LAYER_ID || '26:03727';
const TOKEN = process.env.MG_MCP_TOKEN || 'mg_965e5b80475e4246a1b55b8ddfbd9563';

console.log('🔍 MasterGo Data Fetcher');
console.log('========================\n');
console.log(`File ID: ${FILE_ID}`);
console.log(`Layer ID: ${LAYER_ID}`);
console.log(`Token: ${TOKEN.substring(0, 10)}...\n`);

// Try different API endpoints
const endpoints = [
  `https://api.mastergo.com/v1/files/${FILE_ID}/nodes/${LAYER_ID}`,
  `https://mastergo.com/api/v1/files/${FILE_ID}/layers/${LAYER_ID}`,
  `https://api.mastergo.com/files/${FILE_ID}/nodes/${LAYER_ID}`,
  `https://mastergo.com/api/files/${FILE_ID}/nodes/${LAYER_ID}`,
];

console.log('📡 Trying different API endpoints...\n');

async function tryEndpoint(url, index) {
  return new Promise((resolve) => {
    console.log(`${index + 1}. Trying: ${url}`);

    const options = {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'X-MG-Token': TOKEN,
        'Content-Type': 'application/json',
      }
    };

    https.get(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`   ✅ Success! Status: ${res.statusCode}`);
          try {
            const json = JSON.parse(data);
            const filename = `mastergo-layer-${LAYER_ID.replace(':', '-')}.json`;
            fs.writeFileSync(filename, JSON.stringify(json, null, 2));
            console.log(`   📄 Saved to: ${filename}`);
            console.log(`\n🎉 Data fetched successfully!`);
            console.log(`\nNext step: npm start ${filename}`);
            resolve(true);
          } catch (e) {
            console.log(`   ❌ Invalid JSON response`);
            resolve(false);
          }
        } else {
          console.log(`   ❌ Failed. Status: ${res.statusCode}`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log(`   ❌ Error: ${err.message}`);
      resolve(false);
    });
  });
}

async function main() {
  for (let i = 0; i < endpoints.length; i++) {
    const success = await tryEndpoint(endpoints[i], i);
    if (success) {
      return;
    }
  }

  console.log('\n❌ All endpoints failed.');
  console.log('\n💡 Alternative methods:');
  console.log('   1. Export JSON from MasterGo UI');
  console.log('   2. Use browser DevTools to capture API response');
  console.log('   3. Check MasterGo API documentation');
  console.log('\n📖 See HOW_TO_GET_DATA.md for detailed instructions');
}

main();
