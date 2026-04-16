import { createError, readBody, sendStream } from 'h3';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const body = await readBody(event);

  if (!config.aiSummaryApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'AI_SUMMARY_API_KEY is not configured',
    });
  }

  const upstream = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.aiSummaryApiKey}`,
    },
    body: JSON.stringify({
      ...body,
      stream: true,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const errorText = await upstream.text();
    throw createError({
      statusCode: upstream.status || 500,
      statusMessage: errorText || 'Upstream AI request failed',
    });
  }

  return sendStream(event, upstream.body);
});
