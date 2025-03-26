# Aliyun MCP Server

This MCP server provides tools for interacting with Aliyun (Alibaba Cloud) services through Claude.

## Features

- Query SLS (Simple Log Service) logs
- (Future) Manage ECS instances
- (Future) Deploy serverless functions

## Configuration

1. Build the server:

```bash
npm install
npm run build
```

### Usage with Claude Desktop

Add the server to your claude_desktop_config.json:

```json
{
  "mcpServers": {
    "aliyun": {
      "command": "node",
      "args": ["/path/to/aliyun-mcp-server/build/index.js"],
      "env": {
        "ALIYUN_ACCESS_KEY_ID": "your-access-key-id",
        "ALIYUN_ACCESS_KEY_SECRET": "your-access-key-secret",
        "SLS_ENDPOINT": "cn-hangzhou.log.aliyuncs.com"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

### Configuration for Cline

Add the server to your Cline MCP settings file inside VSCode's settings `cline_mcp_settings.json` 

```json
{
  "mcpServers": {
    "aliyun": {
      "command": "node",
      "args": ["/path/to/aliyun-mcp-server/build/index.js"],
      "env": {
        "ALIYUN_ACCESS_KEY_ID": "your-access-key-id",
        "ALIYUN_ACCESS_KEY_SECRET": "your-access-key-secret",
        "SLS_ENDPOINT": "cn-hangzhou.log.aliyuncs.com"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```


Replace `/path/to/aliyun-mcp-server` with the actual path to this repository, and provide your Aliyun credentials.

## Usage

Once configured, you can ask Claude to query SLS logs:

```
Query SLS logs from project "my-project" and logstore "my-logstore" with the query "error" for the last hour.
```

Claude will use the MCP server to execute the query and return the results.

## Available Tools

### querySLSLogs

Query Aliyun SLS (Simple Log Service) logs.

Parameters:
- `project` (required): SLS project name
- `logstore` (required): SLS logstore name
- `query` (required): SLS query statement
- `from` (optional): Start time in milliseconds (defaults to 1 hour ago)
- `to` (optional): End time in milliseconds (defaults to now)
- `limit` (optional): Maximum number of logs to return (default: 100, max: 1000)
- `offset` (optional): Offset for pagination (default: 0)
- `reverse` (optional): Whether to return results in reverse order (default: false)

Example:
```json
{
  "project": "my-project",
  "logstore": "my-logstore",
  "query": "error",
  "limit": 10
}
