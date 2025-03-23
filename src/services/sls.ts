/**
 * Aliyun SLS (Simple Log Service) integration for MCP server
 */

import ALY from 'aliyun-sdk';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

/**
 * Interface for SLS query parameters
 */
export interface SLSQueryParams {
    project: string;
    logstore: string;
    query: string;
    from?: number;
    to?: number;
    limit?: number;
    offset?: number;
    reverse?: boolean;
}

/**
 * Interface for SLS client configuration
 */
interface SLSConfig {
    accessKeyId: string;
    secretAccessKey: string;
    securityToken?: string;
    endpoint: string;
    apiVersion: string;
}

/**
 * SLS Service for querying Aliyun logs
 */
export class SLSService {
    private static slsClient: any = null;
    private static lastInitTime: number = 0;
    private static readonly REFRESH_INTERVAL = 3600000; // 1 hour in milliseconds

    /**
     * Check if the SLS client should be refreshed
     */
    private static shouldRefresh(): boolean {
        const now = Date.now();
        return !this.slsClient || (now - this.lastInitTime) > this.REFRESH_INTERVAL;
    }

    /**
     * Get SLS client instance with proper authentication
     */
    public static getSLSClient(): any {
        if (this.slsClient && !this.shouldRefresh()) {
            return this.slsClient;
        }

        // Get configuration from environment variables
        const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
        const secretAccessKey = process.env.ALIYUN_ACCESS_KEY_SECRET;
        const securityToken = process.env.ALIYUN_SECURITY_TOKEN;
        const endpoint = process.env.SLS_ENDPOINT || 'cn-hangzhou.log.aliyuncs.com';
        const apiVersion = process.env.SLS_API_VERSION || '2015-06-01';

        if (!accessKeyId || !secretAccessKey) {
            throw new McpError(
                ErrorCode.InvalidRequest,
                'Missing Aliyun credentials. Please set ALIYUN_ACCESS_KEY_ID and ALIYUN_ACCESS_KEY_SECRET environment variables.'
            );
        }

        console.error('[SLS] Initializing SLS client...');

        const config: SLSConfig = {
            accessKeyId,
            secretAccessKey,
            endpoint,
            apiVersion,
        };

        if (securityToken) {
            config.securityToken = securityToken;
        }

        this.slsClient = new ALY.SLS(config);
        this.lastInitTime = Date.now();

        console.error('[SLS] SLS client initialized successfully');
        return this.slsClient;
    }

    /**
     * Query SLS logs with the given parameters
     */
    public static async queryLogs(params: SLSQueryParams): Promise<any> {
        console.error('[SLS] Querying logs with params:', JSON.stringify({
            project: params.project,
            logstore: params.logstore,
            query: params.query,
            from: params.from,
            to: params.to,
            limit: params.limit
        }));

        try {
            const slsClient = this.getSLSClient();

            // Prepare query parameters
            const now = Math.floor(Date.now() / 1000);
            const queryParams = {
                projectName: params.project,
                logStoreName: params.logstore,
                from: params.from ? Math.floor(params.from / 1000) : now - 3600, // Default to last hour
                to: params.to ? Math.floor(params.to / 1000) : now,
                query: params.query,
                line: params.limit || 100,
                offset: params.offset || 0,
                reverse: params.reverse || false
            };

            // Execute the query
            return new Promise((resolve, reject) => {
                slsClient.getLogs(queryParams, (error: any, data: any) => {
                    if (error) {
                        console.error('[SLS] Error querying logs:', error);
                        reject(error);
                        return;
                    }

                    console.error('[SLS] Successfully retrieved logs');
                    resolve(data);
                });
            });
        } catch (error: any) {
            console.error('[SLS] Error in queryLogs:', error);
            throw new McpError(
                ErrorCode.InternalError,
                `SLS query failed: ${error.message || 'Unknown error'}`
            );
        }
    }
}
