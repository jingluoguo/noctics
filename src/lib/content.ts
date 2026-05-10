import { siteConfig } from '../site.config';

type MarkdownModuleMap = Record<string, string>;

export type WritingContentItem = {
  slug: string;
  title: string;
  markdown: string;
  summary: string;
  category?: string;
  tags: string[];
};

export type TravelContentItem = {
  slug: string;
  city: string;
  markdown: string;
  summary: string;
  date?: string;
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

export function getWritingItems(): WritingContentItem[] {
  const localItems = Object.entries(writingMarkdownModules)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([filePath, markdown]) => {
      const { frontMatter, content } = parseFrontMatter(markdown);
      const title = getFileTitle(filePath, content);
      const normalized = normalizeMarkdown(content, title);
      return {
        slug: toSlug(getFileName(filePath)),
        title,
        markdown: normalized,
        summary: toSummary(normalized),
        category: frontMatter.category,
        tags: parseTags(frontMatter.tags)
      };
    });

  if (localItems.length) return localItems;

  return siteConfig.sections.writing.items.map((item) => ({
    slug: toSlug(item.title),
    title: item.title,
    markdown: item.markdown,
    summary: toSummary(item.markdown),
    category: item.category,
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
        summary: toSummary(normalized),
        date: frontMatter.date,
        tags: parseTags(frontMatter.tags)
      };
    });

  if (localItems.length) return localItems;

  return siteConfig.sections.travel.items.map((item) => ({
    slug: toSlug(item.city),
    city: item.city,
    markdown: item.markdown ?? item.note,
    summary: toSummary(item.markdown ?? item.note),
    date: item.date,
    tags: item.tags ?? []
  }));
}
