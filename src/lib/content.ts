import { siteConfig } from '../site.config';
import type { PhotoItem, WorkItem } from '../site.config';

type MarkdownModuleMap = Record<string, string>;

export type WritingContentItem = {
  slug: string;
  title: string;
  markdown: string;
  summary: string;
  wordCount: number;
  readingMinutes: number;
  cover?: string;
  category?: string;
  updatedAt?: string;
  tags: string[];
};

export type TravelContentItem = {
  slug: string;
  city: string;
  markdown: string;
  summary: string;
  cover?: string;
  date?: string;
  updatedAt?: string;
  tags: string[];
};

const writingMarkdownModules = import.meta.glob('/src/content/writing/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as MarkdownModuleMap;

const travelMarkdownModules = import.meta.glob('/src/content/travel/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as MarkdownModuleMap;

type WorkAppModuleMap = Record<string, WorkItem>;
const workAppModules = import.meta.glob('/src/content/apps/*.ts', {
  eager: true,
  import: 'default'
}) as WorkAppModuleMap;

type PhotographyModuleMap = Record<string, PhotoItem[]>;
const photographyModules = import.meta.glob('/src/content/photography.ts', {
  eager: true,
  import: 'default'
}) as PhotographyModuleMap;

function getFileName(filePath: string) {
  return filePath.split('/').pop()?.replace(/\.md$/i, '') ?? 'untitled';
}

function toSlug(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');
}

function getFileTitle(filePath: string, markdown: string) {
  const heading = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (heading) return heading;
  return getFileName(filePath).replace(/[-_]+/g, ' ');
}

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeMarkdown(markdown: string, title: string) {
  return markdown.replace(new RegExp(`^#\\s+${escapeRegExp(title)}\\s*\\n+`), '').trim();
}

function toSummary(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[[^\]]+]\([^)]+\)/g, ' ')
    .replace(/^>\s+/gm, ' ')
    .replace(/^[-*+]\s+/gm, ' ')
    .replace(/^\d+\.\s+/gm, ' ')
    .replace(/^#+\s+/gm, ' ')
    .replace(/[*_~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

type FrontMatter = Record<string, string>;

function parseFrontMatter(markdown: string): { frontMatter: FrontMatter; content: string } {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n*/);
  if (!match) return { frontMatter: {}, content: markdown };
  const frontMatter: FrontMatter = {};
  for (const line of match[1].split('\n')) {
    const [keyRaw, ...rest] = line.split(':');
    const key = keyRaw?.trim().toLowerCase();
    const value = rest.join(':').trim();
    if (key && value) frontMatter[key] = value;
  }
  return { frontMatter, content: markdown.slice(match[0].length) };
}

function parseTags(value?: string) {
  if (!value) return [];
  return value.split(',').map((tag) => tag.trim()).filter(Boolean);
}

function pickSummary(summary: string | undefined, markdown: string) {
  const cleaned = summary?.trim();
  if (cleaned) return cleaned;
  return toSummary(markdown);
}

function countWords(markdown: string) {
  const text = toSummary(markdown);
  const cjkChars = (text.match(/[\u3400-\u9FFF]/g) ?? []).length;
  const latinWords = text
    .replace(/[\u3400-\u9FFF]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return cjkChars + latinWords;
}

function estimateReadingMinutes(wordCount: number) {
  // For mixed Chinese/English technical articles, 300 chars/words per minute is a practical baseline.
  return Math.max(1, Math.ceil(wordCount / 300));
}

export function getWritingItems(): WritingContentItem[] {
  const localItems = Object.entries(writingMarkdownModules)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([filePath, markdown]) => {
      const { frontMatter, content } = parseFrontMatter(markdown);
      const title = getFileTitle(filePath, content);
      const normalized = normalizeMarkdown(content, title);
      const wordCount = countWords(normalized);
      return {
        slug: toSlug(getFileName(filePath)),
        title,
        markdown: normalized,
        summary: pickSummary(frontMatter.summary, normalized),
        wordCount,
        readingMinutes: estimateReadingMinutes(wordCount),
        cover: frontMatter.cover,
        category: frontMatter.category,
        updatedAt: frontMatter.updatedat,
        tags: parseTags(frontMatter.tags)
      };
    });

  if (localItems.length) return localItems;

  return siteConfig.sections.writing.items.map((item) => ({
    slug: toSlug(item.title),
    title: item.title,
    markdown: item.markdown,
    summary: pickSummary(item.summary, item.markdown),
    wordCount: countWords(item.markdown),
    readingMinutes: estimateReadingMinutes(countWords(item.markdown)),
    cover: item.cover,
    category: item.category,
    updatedAt: item.updatedAt,
    tags: item.tags ?? []
  }));
}

export function getTravelItems(): TravelContentItem[] {
  const localItems = Object.entries(travelMarkdownModules)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([filePath, markdown]) => {
      const { frontMatter, content } = parseFrontMatter(markdown);
      const title = getFileTitle(filePath, content);
      const normalized = normalizeMarkdown(content, title);
      return {
        slug: toSlug(getFileName(filePath)),
        city: frontMatter.city || title,
        markdown: normalized,
        summary: pickSummary(frontMatter.summary, normalized),
        cover: frontMatter.cover,
        date: frontMatter.date,
        updatedAt: frontMatter.updatedat,
        tags: parseTags(frontMatter.tags)
      };
    });

  if (localItems.length) return localItems;

  return siteConfig.sections.travel.items.map((item) => ({
    slug: toSlug(item.city),
    city: item.city,
    markdown: item.markdown ?? item.note,
    summary: pickSummary(item.summary, item.markdown ?? item.note),
    cover: item.cover,
    date: item.date,
    updatedAt: item.updatedAt,
    tags: item.tags ?? []
  }));
}

export function getWorkItems(): WorkItem[] {
  const localItems = Object.entries(workAppModules)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([, app]) => app)
    .filter((app) => app.name && app.desc && app.stack);

  if (localItems.length) return localItems;
  return siteConfig.sections.works.items;
}

export function getPhotographyItems(): PhotoItem[] {
  const items = Object.values(photographyModules)[0];
  if (Array.isArray(items) && items.length) return items;
  return siteConfig.sections.photography.items;
}
