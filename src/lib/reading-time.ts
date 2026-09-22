const CJK_CHARS_PER_MINUTE = 350;
const LATIN_WORDS_PER_MINUTE = 220;

/** 去掉 Markdown 语法噪声，只保留可读文本。 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/~~~[\s\S]*?~~~/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s*(?:#{1,6}|>\s?|[-*+]|\d+\.)\s+/gm, " ")
    .replace(/[*_~]+/g, " ");
}

/** 估算阅读分钟数：中文 350 字/分钟，英文 220 词/分钟，最少 1 分钟。 */
export function estimateReadingMinutes(text: string): number {
  const plain = stripMarkdown(text);
  const cjkChars = plain.match(/[㐀-䶿一-鿿]/g)?.length ?? 0;
  const latinWords = plain.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g)?.length ?? 0;
  return Math.max(1, Math.ceil(cjkChars / CJK_CHARS_PER_MINUTE + latinWords / LATIN_WORDS_PER_MINUTE));
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} 分钟阅读`;
}
