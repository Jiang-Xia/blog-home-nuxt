/**
 * 全站 RAG 助手状态：AI SDK Chat + 配额（GET /rag/quota）
 * Chat 仅客户端初始化；messages 按 uid 写入 sessionStorage，刷新后恢复。
 */
import { Chat } from '@ai-sdk/vue';
import { DefaultChatTransport, type ChatStatus, type UIMessage } from 'ai';
import { baseUrl, isEnv } from '~/config';
import { getRagQuota, type RagQuota } from '@/api/rag';
import { getToken } from '@/utils/cookie';
import { useUserInfo } from '@/composables/use-common';

/** 开发走 Nitro 透传；生产直连 blog-server，少一跳 */
const ragStreamApi = isEnv ? '/api/rag-query-stream' : `${baseUrl}/rag/query-stream`;
const STORAGE_PREFIX = 'rag-assistant-msgs:';

/** 持久化结构：仅 text + citations，避免 sessionStorage 过大 */
type StoredRagMessage = Pick<UIMessage, 'id' | 'role'> & {
  parts: UIMessage['parts'];
};

/** 客户端 Chat 单例（勿放 useState，类实例无法 SSR 序列化） */
let ragChatSingleton: Chat<UIMessage> | null = null;

/** sessionStorage key，按登录 uid 隔离 */
function storageKey(uid: number) {
  return `${STORAGE_PREFIX}${uid}`;
}

/** UI 与持久化保留的最大消息条数（约 20 轮问答） */
export const RAG_ASSISTANT_MAX_MESSAGES = 40;

/** 截断超出上限的旧消息，避免 DOM / sessionStorage 膨胀 */
function trimMessages(messages: UIMessage[]): UIMessage[] {
  if (messages.length <= RAG_ASSISTANT_MAX_MESSAGES) return messages;
  return messages.slice(-RAG_ASSISTANT_MAX_MESSAGES);
}

/** 从 sessionStorage 恢复指定用户的对话（仅客户端） */
function loadStoredMessages(uid: number): UIMessage[] {
  if (typeof sessionStorage === 'undefined' || uid <= 0) return [];
  try {
    const raw = sessionStorage.getItem(storageKey(uid));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredRagMessage[];
    return Array.isArray(parsed) ? trimMessages(parsed as UIMessage[]) : [];
  }
  catch {
    return [];
  }
}

/** 将当前对话写入 sessionStorage（仅客户端） */
function saveStoredMessages(uid: number, messages: UIMessage[]) {
  if (typeof sessionStorage === 'undefined' || uid <= 0) return;
  try {
    const slim: StoredRagMessage[] = trimMessages(messages).map(m => ({
      id: m.id,
      role: m.role,
      parts: m.parts.filter(p => p.type === 'text' || p.type === 'data-citations'),
    }));
    sessionStorage.setItem(storageKey(uid), JSON.stringify(slim));
  }
  catch {
    // sessionStorage 满或不可用时忽略
  }
}

/** 创建 Chat 实例；onFinish/onError 时持久化并刷新配额 */
function createRagChat(
  initialMessages: UIMessage[],
  callbacks: { onPersist: () => void; onQuotaRefresh: () => void },
): Chat<UIMessage> {
  return new Chat({
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: ragStreamApi,
      headers: () => {
        const token = getToken();
        const headers: Record<string, string> = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        return headers;
      },
    }),
    onFinish: () => {
      callbacks.onPersist();
      callbacks.onQuotaRefresh();
    },
    onError: () => {
      callbacks.onPersist();
      callbacks.onQuotaRefresh();
    },
  });
}

/** 获取或创建客户端 Chat 单例 */
function ensureRagChat(callbacks: {
  onPersist: () => void;
  onQuotaRefresh: () => void;
}): Chat<UIMessage> {
  if (!ragChatSingleton) {
    ragChatSingleton = createRagChat([], callbacks);
  }
  return ragChatSingleton;
}

export function useRagAssistant() {
  const quota = ref<RagQuota | null>(null);
  const userInfo = useUserInfo();
  const uid = computed(() => Number(userInfo.value?.uid) || 0);

  /** shallowRef 供模板绑定；SSR 阶段保持 null */
  const chat = shallowRef<Chat<UIMessage> | null>(null);
  const messages = computed(() => chat.value?.messages ?? []);
  const status = computed<ChatStatus>(() => chat.value?.status ?? 'ready');
  const chatError = computed(() => chat.value?.error);
  const loading = computed(() => status.value === 'submitted' || status.value === 'streaming');

  const refreshQuota = async () => {
    try {
      quota.value = await getRagQuota();
    }
    catch {
      quota.value = null;
    }
  };

  /** 持久化当前 Chat messages（需有效 uid）；超出上限时截断最旧条目 */
  const persistMessages = () => {
    if (!chat.value || uid.value <= 0) return;
    if (chat.value.messages.length > RAG_ASSISTANT_MAX_MESSAGES) {
      chat.value.messages = trimMessages(chat.value.messages);
    }
    saveStoredMessages(uid.value, chat.value.messages);
  };

  /** 从 sessionStorage 恢复当前 uid 的对话 */
  const restoreMessagesForUid = (targetUid: number) => {
    if (!chat.value) return;
    if (targetUid > 0) {
      chat.value.messages = loadStoredMessages(targetUid);
    }
    else {
      chat.value.messages = [];
    }
  };

  /** 判断 assistant 消息是否处于流式输出中（避免挂载 MdPreview） */
  const isAssistantStreaming = (messageId: string) => {
    if (!chat.value || !loading.value) return false;
    const last = chat.value.messages.at(-1);
    return last?.role === 'assistant' && last.id === messageId;
  };

  /** 发送用户问题；Chat 会把完整 messages 带给后端以支持多轮 */
  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || loading.value || !chat.value) return;
    await chat.value.sendMessage({ text: q });
    persistMessages();
  };

  const stop = () => {
    chat.value?.stop();
    persistMessages();
  };

  /** 清空当前用户会话（UI + sessionStorage） */
  const clearHistory = () => {
    if (!chat.value) return;
    chat.value.messages = [];
    if (uid.value > 0) {
      sessionStorage.removeItem(storageKey(uid.value));
    }
  };

  // SSR：不创建 Chat、不访问 sessionStorage
  if (import.meta.server) {
    return {
      chat,
      messages,
      status,
      chatError,
      loading,
      quota,
      ask: async () => {},
      stop: () => {},
      clearHistory: () => {},
      refreshQuota: async () => {},
      isAssistantStreaming: () => false,
      maxMessages: RAG_ASSISTANT_MAX_MESSAGES,
    };
  }

  onMounted(() => {
    chat.value = ensureRagChat({
      onPersist: persistMessages,
      onQuotaRefresh: refreshQuota,
    });
    restoreMessagesForUid(uid.value);
  });

  watch(uid, (nextUid, prevUid) => {
    if (nextUid === prevUid || !chat.value) return;
    restoreMessagesForUid(nextUid);
  });

  onUnmounted(() => {
    chat.value?.stop();
  });

  return {
    chat,
    messages,
    status,
    chatError,
    loading,
    quota,
    ask,
    stop,
    clearHistory,
    refreshQuota,
    isAssistantStreaming,
    maxMessages: RAG_ASSISTANT_MAX_MESSAGES,
  };
}
