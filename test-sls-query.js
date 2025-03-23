#!/usr/bin/env node

/**
 * Test script for the Aliyun MCP Server SLS query tool
 * 
 * This script tests the SLS query functionality by directly calling the SLSService
 * without going through the MCP server. This allows us to verify that the SLS
 * integration works correctly before using it in the MCP server.
 * 
 * Usage:
 * 1. Set the required environment variables:
 *    - ALIYUN_ACCESS_KEY_ID
 *    - ALIYUN_ACCESS_KEY_SECRET
 *    - SLS_ENDPOINT (optional, defaults to cn-hangzhou.log.aliyuncs.com)
 * 
 * 2. Run the script:
 *    node test-sls-query.js <project> <logstore> <query> [limit]
 * 
 * Example:
 *    node test-sls-query.js my-project my-logstore "error" 10
 */

import { SLSService } from './build/services/sls.js';

// Check command line arguments
if (process.argv.length < 5) {
  console.error('Usage: node test-sls-query.js <project> <logstore> <query> [limit]');
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
  console.error('  ALIYUN_ACCESS_KEY_ID=your-access-key-id ALIYUN_ACCESS_KEY_SECRET=your-access-key-secret node test-sls-query.js my-project my-logstore "error" 10');
  process.exit(1);
}

console.log('Testing SLS query with the following parameters:');
console.log(`- Project: ${project}`);
console.log(`- Logstore: ${logstore}`);
console.log(`- Query: ${query}`);
console.log(`- Limit: ${limit}`);
console.log('- Endpoint:', process.env.SLS_ENDPOINT || 'cn-hangzhou.log.aliyuncs.com (default)');
console.log('- Access Key ID:', process.env.ALIYUN_ACCESS_KEY_ID.substring(0, 3) + '...');
console.log('\nExecuting query...');

// Execute the query
try {
  const result = await SLSService.queryLogs({
    project,
    logstore,
    query,
    limit
  });

  console.log('\nQuery successful!');
  console.log('Result:');
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error('\nError executing query:');
  console.error(error);
  process.exit(1);
}
