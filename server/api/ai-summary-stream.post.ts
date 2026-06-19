import { createError, readBody, sendStream } from 'h3';

const MAX_CONTENT_CHARS = 8000;

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const body = await readBody(event);

  if (!config.aiSummaryApiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'AI 摘要服务未配置，请在环境变量中设置 AI_SUMMARY_API_KEY',
    });
  }

  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: '请求体缺少 messages 字段',
    });
  }

  const totalChars = messages.reduce((sum: number, msg: { content?: string }) => {
    return sum + (typeof msg?.content === 'string' ? msg.content.length : 0);
  }, 0);

  if (totalChars > MAX_CONTENT_CHARS) {
    throw createError({
      statusCode: 400,
      statusMessage: `文章内容过长，请控制在 ${MAX_CONTENT_CHARS} 字以内`,
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
    let statusMessage = '上游 AI 服务请求失败';

    try {
      const parsed = JSON.parse(errorText);
      statusMessage = parsed?.error?.message || parsed?.message || statusMessage;
    }
    catch {
      if (errorText && errorText.length < 200) {
        statusMessage = errorText;
      }
    }

    throw createError({
      statusCode: upstream.status === 401 || upstream.status === 403 ? upstream.status : 502,
      statusMessage,
    });
  }

  return sendStream(event, upstream.body);
});
