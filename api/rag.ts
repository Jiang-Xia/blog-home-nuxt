import request from '@/api/request';

export interface RagQuota {
  used: number;
  limit: number;
  remaining: number;
}

export interface RagStatus {
  enabled: boolean;
  configured: boolean;
  chunkCount: number;
  ready: boolean;
}

export interface RagCitation {
  articleId: number;
  title: string;
  url: string;
  snippet?: string;
}

export const getRagQuota = (): Promise<RagQuota> => request.get('/rag/quota');

export const getRagStatus = (): Promise<RagStatus> => request.get('/rag/status');
