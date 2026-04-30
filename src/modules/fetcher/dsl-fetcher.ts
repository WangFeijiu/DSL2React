import axios, { AxiosError } from 'axios';
import * as dotenv from 'dotenv';
import { DSLData, FetchInput, DSLFetchError } from '../../types/dsl-data';

dotenv.config();

export class DSLFetcher {
  private apiKey: string;
  private baseUrl = 'https://api.mastergo.com/v1';
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second base delay

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.MASTERGO_API_KEY || '';
    if (!this.apiKey) {
      throw new DSLFetchError(
        'MasterGo API key not found',
        'AUTH',
        'Set MASTERGO_API_KEY in .env file or pass it to constructor'
      );
    }
  }

  /**
   * Parse MasterGo URL to extract File ID and Layer ID
   * Example URL: https://mastergo.com/file/123456/layer/789012
   */
  private parseUrl(url: string): { fileId: string; layerId: string } {
    const urlPattern = /mastergo\.com\/file\/([^\/]+)\/layer\/([^\/]+)/;
    const match = url.match(urlPattern);

    if (!match) {
      throw new DSLFetchError(
        'Invalid MasterGo URL format',
        'INVALID_INPUT',
        'URL should be in format: https://mastergo.com/file/{fileId}/layer/{layerId}'
      );
    }

    return {
      fileId: match[1],
      layerId: match[2],
    };
  }

  /**
   * Fetch DSL data with retry mechanism
   */
  async fetchDSL(input: FetchInput): Promise<DSLData> {
    const { fileId, layerId } =
      input.type === 'url' ? this.parseUrl(input.url) : input;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await axios.get(
          `${this.baseUrl}/files/${fileId}/layers/${layerId}`,
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 seconds
          }
        );

        return {
          raw: response.data,
          metadata: {
            fileId,
            layerId,
            fetchedAt: new Date(),
            version: response.data.version,
          },
        };
      } catch (error) {
        lastError = error as Error;

        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;

          // Don't retry on auth or not found errors
          if (axiosError.response?.status === 401) {
            throw new DSLFetchError(
              'Authentication failed',
              'AUTH',
              'Check your MasterGo API key in .env file'
            );
          }

          if (axiosError.response?.status === 404) {
            throw new DSLFetchError(
              'File or layer not found',
              'NOT_FOUND',
              'Verify the File ID and Layer ID are correct'
            );
          }

          // Retry on network errors or 5xx errors
          if (!axiosError.response || axiosError.response.status >= 500) {
            if (attempt < this.maxRetries - 1) {
              // Exponential backoff
              const delay = this.retryDelay * Math.pow(2, attempt);
              await this.sleep(delay);
              continue;
            }
          }
        }

        // If we've exhausted retries or it's a non-retryable error
        throw new DSLFetchError(
          `Failed to fetch DSL data: ${lastError.message}`,
          'NETWORK',
          'Check your network connection and try again'
        );
      }
    }

    // Should never reach here, but TypeScript needs it
    throw new DSLFetchError(
      `Failed after ${this.maxRetries} attempts`,
      'NETWORK',
      'Check your network connection and try again'
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
