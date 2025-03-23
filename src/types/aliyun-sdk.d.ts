/**
 * Type declarations for aliyun-sdk
 */
declare module 'aliyun-sdk' {
    export interface SLSConfig {
        accessKeyId: string;
        secretAccessKey: string;
        securityToken?: string;
        endpoint: string;
        apiVersion: string;
    }

    export interface SLSQueryParams {
        projectName: string;
        logStoreName: string;
        from: number;
        to: number;
        query: string;
        line?: number;
        offset?: number;
        reverse?: boolean;
    }

    export class SLS {
        constructor(config: SLSConfig);
        getLogs(
            params: SLSQueryParams,
            callback: (error: any, data: any) => void
        ): void;
    }

    export default {
        SLS
    };
}
