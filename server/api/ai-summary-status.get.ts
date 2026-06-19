/** 供前端检测 AI 摘要服务是否已配置密钥（不暴露 key 本身） */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  return { configured: Boolean(config.aiSummaryApiKey) };
});
