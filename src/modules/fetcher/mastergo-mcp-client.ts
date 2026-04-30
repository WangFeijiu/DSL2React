/**
 * MasterGo MCP Client
 * Fetch DSL data from MasterGo using MCP protocol
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as dotenv from 'dotenv';

dotenv.config();

export interface MasterGoConfig {
  token: string;
  fileId: string;
  layerId: string;
}

export async function fetchDSLFromMasterGo(config: MasterGoConfig): Promise<any> {
  const { token, fileId, layerId } = config;

  console.log('📡 Connecting to MasterGo via MCP...');
  console.log(`   File ID: ${fileId}`);
  console.log(`   Layer ID: ${layerId}`);

  // Create MCP transport
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['node_modules/@mastergo/magic-mcp/dist/index.js'],
    env: {
      MG_MCP_TOKEN: token,
      API_BASE_URL: 'https://mastergo.com',
    },
  });

  // Create MCP client
  const client = new Client({
    name: 'dsl2react-mcp-client',
    version: '1.0.0',
  });

  try {
    // Connect to MCP server
    await client.connect(transport);
    console.log('✅ Connected to MasterGo MCP server');

    // Call getDsl tool
    console.log('📥 Fetching DSL data...');
    const response = await client.callTool({
      name: 'mcp__getDsl',
      arguments: {
        fileId,
        layerId,
      },
    });

    console.log('✅ DSL data fetched successfully');

    // Close connection
    await client.close();

    // Parse response
    if (response.content && Array.isArray(response.content) && response.content.length > 0) {
      const content = response.content[0];
      if (content.type === 'text') {
        return JSON.parse(content.text);
      }
    }

    throw new Error('Invalid response format from MCP server');
  } catch (error: any) {
    await client.close();
    throw new Error(`Failed to fetch DSL from MasterGo: ${error.message}`);
  }
}

export async function fetchDSLFromEnv(): Promise<any> {
  const token = process.env.MG_MCP_TOKEN || process.env.MASTERGO_API_KEY;
  const fileId = process.env.MG_FILE_ID;
  const layerId = process.env.MG_LAYER_ID;

  if (!token) {
    throw new Error('MG_MCP_TOKEN or MASTERGO_API_KEY not found in environment');
  }

  if (!fileId) {
    throw new Error('MG_FILE_ID not found in environment');
  }

  if (!layerId) {
    throw new Error('MG_LAYER_ID not found in environment');
  }

  return fetchDSLFromMasterGo({ token, fileId, layerId });
}
