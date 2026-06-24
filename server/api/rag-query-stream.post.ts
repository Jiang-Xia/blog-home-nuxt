/**
 * RAG 流式问答 Nitro 代理：开发环境透传 blog-server SSE，避免 devProxy 缓冲。
 * 生产环境前端 Chat 直连 gateway / blog-server，不走此路由。
 */
import { createError, getHeader, readBody, sendStream, setResponseHeader } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const auth = getHeader(event, 'authorization') || '';

  const originUrl = process.env.VITE_NUXT_ORIGIN_URL || 'http://localhost:5000';
  const apiPrefix = process.env.VITE_NUXT_API_PREFIX || '/api/v1';
  const upstreamUrl = `${originUrl}${apiPrefix}/rag/query-stream`;

  const upstream = await fetch(upstreamUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: auth } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });

  if (!upstream.ok || !upstream.body) {
    const errorText = await upstream.text();
    let statusMessage = 'RAG 问答请求失败';

    try {
      const parsed = JSON.parse(errorText);
      statusMessage = parsed?.message || parsed?.statusMessage || statusMessage;
    }
    catch {
      if (errorText && errorText.length < 200) {
        statusMessage = errorText;
      }
    }

    throw createError({
      statusCode: upstream.status,
      statusMessage,
    });
  }

  setResponseHeader(event, 'Content-Type', 'text/event-stream');
  setResponseHeader(event, 'Cache-Control', 'no-cache');
  setResponseHeader(event, 'Connection', 'keep-alive');

  const uiStreamHeader = upstream.headers.get('x-vercel-ai-ui-message-stream');
  if (uiStreamHeader) {
    setResponseHeader(event, 'x-vercel-ai-ui-message-stream', uiStreamHeader);
  }

  return sendStream(event, upstream.body);
});
