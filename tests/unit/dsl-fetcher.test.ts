import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import axios from 'axios';
import { DSLFetcher } from '../../src/modules/fetcher/dsl-fetcher';
import { DSLFetchError } from '../../src/types/dsl-data';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DSLFetcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MASTERGO_API_KEY = 'test-api-key';
  });

  describe('constructor', () => {
    it('should use API key from environment', () => {
      const fetcher = new DSLFetcher();
      expect(fetcher).toBeDefined();
    });

    it('should use provided API key over environment', () => {
      const fetcher = new DSLFetcher('custom-key');
      expect(fetcher).toBeDefined();
    });

    it('should throw error if no API key provided', () => {
      delete process.env.MASTERGO_API_KEY;
      expect(() => new DSLFetcher()).toThrow(DSLFetchError);
    });
  });

  describe('parseUrl', () => {
    it('should parse valid MasterGo URL', async () => {
      const mockResponse = {
        data: { id: '123', name: 'Test Layer' },
      };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const fetcher = new DSLFetcher();
      const result = await fetcher.fetchDSL({
        type: 'url',
        url: 'https://mastergo.com/file/abc123/layer/xyz789',
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://api.mastergo.com/v1/files/abc123/layers/xyz789',
        expect.any(Object)
      );
      expect(result.metadata.fileId).toBe('abc123');
      expect(result.metadata.layerId).toBe('xyz789');
    });

    it('should throw error for invalid URL format', async () => {
      const fetcher = new DSLFetcher();
      await expect(
        fetcher.fetchDSL({
          type: 'url',
          url: 'https://invalid-url.com',
        })
      ).rejects.toThrow(DSLFetchError);
    });
  });

  describe('fetchDSL', () => {
    it('should fetch DSL data successfully with File ID and Layer ID', async () => {
      const mockData = {
        id: 'layer-123',
        name: 'Hero Section',
        type: 'FRAME',
        version: '1.0',
      };
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const fetcher = new DSLFetcher();
      const result = await fetcher.fetchDSL({
        type: 'ids',
        fileId: 'file-123',
        layerId: 'layer-456',
      });

      expect(result.raw).toEqual(mockData);
      expect(result.metadata.fileId).toBe('file-123');
      expect(result.metadata.layerId).toBe('layer-456');
      expect(result.metadata.fetchedAt).toBeInstanceOf(Date);
    });

    it('should throw AUTH error on 401', async () => {
      mockedAxios.get.mockRejectedValue({
        isAxiosError: true,
        response: { status: 401 },
      });
      (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);

      const fetcher = new DSLFetcher();
      await expect(
        fetcher.fetchDSL({
          type: 'ids',
          fileId: 'file-123',
          layerId: 'layer-456',
        })
      ).rejects.toThrow('Authentication failed');
    });

    it('should throw NOT_FOUND error on 404', async () => {
      mockedAxios.get.mockRejectedValue({
        isAxiosError: true,
        response: { status: 404 },
      });
      (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);

      const fetcher = new DSLFetcher();
      await expect(
        fetcher.fetchDSL({
          type: 'ids',
          fileId: 'file-123',
          layerId: 'layer-456',
        })
      ).rejects.toThrow('File or layer not found');
    });

    it('should retry on network errors', async () => {
      mockedAxios.get
        .mockRejectedValueOnce({
          isAxiosError: true,
          response: { status: 500 },
        })
        .mockRejectedValueOnce({
          isAxiosError: true,
          response: { status: 503 },
        })
        .mockResolvedValueOnce({
          data: { id: 'success', version: '1.0' },
        });
      (mockedAxios.isAxiosError as any) = jest.fn().mockReturnValue(true);

      const fetcher = new DSLFetcher();
      const result = await fetcher.fetchDSL({
        type: 'ids',
        fileId: 'file-123',
        layerId: 'layer-456',
      });

      expect(mockedAxios.get).toHaveBeenCalledTimes(3);
      expect(result.raw.id).toBe('success');
    });
  });
});
