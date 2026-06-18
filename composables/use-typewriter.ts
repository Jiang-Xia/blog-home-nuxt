function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

async function typeInto(text: string, target: Ref<string>, speed: number) {
  for (let i = 1; i <= text.length; i++) {
    target.value = text.slice(0, i);
    await delay(speed);
  }
}

/** 客户端打字机：SSR 展示完整文案，挂载后清空并重播 */
export function usePoetryTypewriter(
  getContent: () => string,
  getAuthor: () => string,
  options: { contentSpeed?: number; authorSpeed?: number; startDelay?: number } = {},
) {
  const typedContent = ref('');
  const typedAuthor = ref('');
  const isTypingContent = ref(false);
  const isTypingAuthor = ref(false);
  const showTyped = ref(false);

  const contentSpeed = options.contentSpeed ?? 120;
  const authorSpeed = options.authorSpeed ?? 80;
  const startDelay = options.startDelay ?? 900;

  onMounted(async () => {
    const content = getContent();
    const author = getAuthor();

    await delay(startDelay);

    showTyped.value = true;
    isTypingContent.value = true;
    await typeInto(content, typedContent, contentSpeed);
    isTypingContent.value = false;

    if (!author) return;

    isTypingAuthor.value = true;
    await typeInto(author, typedAuthor, authorSpeed);
    isTypingAuthor.value = false;
  });

  return {
    typedContent,
    typedAuthor,
    isTypingContent,
    isTypingAuthor,
    showTyped,
  };
}
