#!/usr/bin/env node

/**
 * Test script for the Aliyun MCP Server
 * 
 * This script tests the MCP server by using the MCP Inspector to call the
 * querySLSLogs tool. This allows us to verify that the MCP server works
 * correctly before integrating it with Claude.
 * 
 * Usage:
 * 1. Set the required environment variables:
 *    - ALIYUN_ACCESS_KEY_ID
 *    - ALIYUN_ACCESS_KEY_SECRET
 *    - SLS_ENDPOINT (optional, defaults to cn-hangzhou.log.aliyuncs.com)
 * 
 * 2. Run the script:
 *    node test-mcp-server.js <project> <logstore> <query> [limit]
 * 
 * Example:
 *    node test-mcp-server.js my-project my-logstore "error" 10
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get the directory of the current module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Check command line arguments
if (process.argv.length < 5) {
  console.error('Usage: node test-mcp-server.js <project> <logstore> <query> [limit]');
  process.exit(1);
}

// Get command line arguments
const project = process.argv[2];
const logstore = process.argv[3];
const query = process.argv[4];
const limit = process.argv[5] ? parseInt(process.argv[5], 10) : 10;

// Check required environment variables
if (!process.env.ALIYUN_ACCESS_KEY_ID || !process.env.ALIYUN_ACCESS_KEY_SECRET) {
  console.error('Error: ALIYUN_ACCESS_KEY_ID and ALIYUN_ACCESS_KEY_SECRET environment variables are required');
  console.error('Example:');
  console.error('  ALIYUN_ACCESS_KEY_ID=your-access-key-id ALIYUN_ACCESS_KEY_SECRET=your-access-key-secret node test-mcp-server.js my-project my-logstore "error" 10');
  process.exit(1);
}

console.log('Testing MCP server with the following parameters:');
console.log(`- Project: ${project}`);
console.log(`- Logstore: ${logstore}`);
console.log(`- Query: ${query}`);
console.log(`- Limit: ${limit}`);
console.log('- Endpoint:', process.env.SLS_ENDPOINT || 'cn-hangzhou.log.aliyuncs.com (default)');
console.log('- Access Key ID:', process.env.ALIYUN_ACCESS_KEY_ID.substring(0, 3) + '...');
console.log('\nStarting MCP server and executing query...');

// Create the tool call JSON
const toolCall = JSON.stringify({
  name: 'querySLSLogs',
  arguments: {
    project,
    logstore,
    query,
    limit
  }
});

// Start the MCP Inspector with the server and tool call
const inspector = spawn('npx', [
  '@modelcontextprotocol/inspector',
  resolve(__dirname, 'build/index.js'),
  '--call-tool',
  toolCall
], {
  env: process.env,
  stdio: 'inherit'
});

inspector.on('error', (error) => {
  console.error('Error starting MCP Inspector:', error);
  process.exit(1);
});

inspector.on('close', (code) => {
  if (code !== 0) {
    console.error(`MCP Inspector exited with code ${code}`);
    process.exit(code);
  }
});
