export interface DSLData {
  raw: any;
  metadata: {
    fileId: string;
    layerId: string;
    fetchedAt: Date;
    version?: string;
  };
}

export type FetchInput =
  | { type: 'url'; url: string }
  | { type: 'ids'; fileId: string; layerId: string };

export type DSLFetchErrorCode = 'NETWORK' | 'AUTH' | 'NOT_FOUND' | 'INVALID_INPUT';

export class DSLFetchError extends Error {
  constructor(
    message: string,
    public code: DSLFetchErrorCode,
    public suggestion: string
  ) {
    super(message);
    this.name = 'DSLFetchError';
  }
}
