function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

async function typeInto(text: string, target: Ref<string>, speed: number) {
  for (let i = 1; i <= text.length; i++) {
    target.value = text.slice(0, i);
    await delay(speed);
  }
}

/** 客户端打字机：SSR / 挂载前展示完整文案，挂载后重播 */
export function usePoetryTypewriter(
  getContent: () => string,
  getAuthor: () => string,
  options: { contentSpeed?: number; authorSpeed?: number; startDelay?: number } = {},
) {
  const typingActive = ref(false);
  const authorTypingActive = ref(false);
  const typedContent = ref('');
  const typedAuthor = ref('');
  const isTypingContent = ref(false);
  const isTypingAuthor = ref(false);

  const contentSpeed = options.contentSpeed ?? 120;
  const authorSpeed = options.authorSpeed ?? 80;
  const startDelay = options.startDelay ?? 900;

  const displayedContent = computed(() => (typingActive.value ? typedContent.value : getContent()));

  const displayedAuthor = computed(() => {
    if (!typingActive.value) return getAuthor();
    if (authorTypingActive.value || typedAuthor.value) return typedAuthor.value;
    return isTypingContent.value ? '' : getAuthor();
  });

  onMounted(async () => {
    await delay(startDelay);

    const content = getContent().trim() || '每日诗词';
    const author = getAuthor();

    typingActive.value = true;
    isTypingContent.value = true;
    typedContent.value = '';
    await typeInto(content, typedContent, contentSpeed);
    isTypingContent.value = false;

    if (!author) return;

    authorTypingActive.value = true;
    isTypingAuthor.value = true;
    typedAuthor.value = '';
    await typeInto(author, typedAuthor, authorSpeed);
    isTypingAuthor.value = false;
  });

  return {
    displayedContent,
    displayedAuthor,
    isTypingContent,
    isTypingAuthor,
  };
}
