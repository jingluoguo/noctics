import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');
const contentDir = path.join(rootDir, 'src', 'content');
const appsDir = path.join(contentDir, 'apps');
const writingDir = path.join(contentDir, 'writing');
const travelDir = path.join(contentDir, 'travel');

const siteUrl = (process.env.VITE_SITE_URL || 'https://example.com').replace(/\/+$/, '');

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function parseFrontMatter(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n*/);
  if (!match) return { frontMatter: {}, content: markdown };
  const frontMatter = {};
  for (const line of match[1].split('\n')) {
    const [keyRaw, ...rest] = line.split(':');
    const key = keyRaw?.trim();
    const value = rest.join(':').trim();
    if (key && value) frontMatter[key] = value;
  }
  return { frontMatter, content: markdown.slice(match[0].length) };
}

function getHeading(markdown, fallback) {
  const heading = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return heading || fallback;
}

function toSummary(markdown) {
  const normalized = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/!\[[^\]]*\]\([^\)]+\)/g, ' ')
    .replace(/\[[^\]]+\]\([^\)]+\)/g, ' ')
    .replace(/^>\s+/gm, ' ')
    .replace(/^[-*+]\s+/gm, ' ')
    .replace(/^\d+\.\s+/gm, ' ')
    .replace(/^#+\s+/gm, ' ')
    .replace(/[*_~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return normalized.slice(0, 180);
}

function toIsoDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

async function readMarkdownItems(dir, type) {
  let files = [];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }

  const items = [];
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const filePath = path.join(dir, file);
    const raw = await fs.readFile(filePath, 'utf8');
    const { frontMatter, content } = parseFrontMatter(raw);
    const slug = file.replace(/\.md$/i, '');
    const fallbackTitle = slug.replace(/[-_]+/g, ' ');
    const title = type === 'travel' ? frontMatter.city || getHeading(content, fallbackTitle) : getHeading(content, fallbackTitle);
    const summary = frontMatter.summary || toSummary(content);
    const updatedAt = toIsoDate(frontMatter.updatedAt || frontMatter.updatedat || frontMatter.date);
    const route = type === 'travel' ? `/#/travel/${encodeURIComponent(slug)}` : `/#/writing/${encodeURIComponent(slug)}`;

    items.push({
      type,
      slug,
      title,
      summary,
      updatedAt,
      url: `${siteUrl}${route}`
    });
  }

  return items.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}

async function readWorkItems() {
  let files = [];
  try {
    files = await fs.readdir(appsDir);
  } catch {
    return [];
  }

  const items = [];
  for (const file of files) {
    if (!file.endsWith('.ts')) continue;
    const filePath = path.join(appsDir, file);
    const source = await fs.readFile(filePath, 'utf8');
    const nameMatch = source.match(/name:\s*['\"]([^'\"]+)['\"]/);
    if (!nameMatch) continue;
    const updatedAtMatch = source.match(/updatedAt:\s*['\"]([^'\"]+)['\"]/);
    const updatedAt = toIsoDate(updatedAtMatch?.[1]);
    const name = nameMatch[1];
    items.push({
      name,
      updatedAt,
      url: `${siteUrl}/#/works/${encodeURIComponent(name)}`
    });
  }

  return items;
}

function buildRssXml(items) {
  const pubDate = new Date().toUTCString();
  const content = items
    .map((item) => {
      const description = escapeXml(item.summary || '');
      const updated = item.updatedAt ? new Date(item.updatedAt).toUTCString() : pubDate;
      return [
        '<item>',
        `<title>${escapeXml(item.title)}</title>`,
        `<link>${escapeXml(item.url)}</link>`,
        `<guid>${escapeXml(item.url)}</guid>`,
        `<pubDate>${updated}</pubDate>`,
        `<description>${description}</description>`,
        `<category>${item.type === 'travel' ? 'travel' : 'writing'}</category>`,
        '</item>'
      ].join('');
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n<title>DonGuo Blog</title>\n<link>${escapeXml(siteUrl)}</link>\n<description>技术文章、作品与游记更新</description>\n<lastBuildDate>${pubDate}</lastBuildDate>\n${content}\n</channel>\n</rss>\n`;
}

function buildSitemapXml(urlItems) {
  const content = urlItems
    .map((item) => {
      const lastmod = item.updatedAt ? `<lastmod>${item.updatedAt}</lastmod>` : '';
      return `<url><loc>${escapeXml(item.url)}</loc>${lastmod}</url>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${content}</urlset>\n`;
}

async function main() {
  await fs.mkdir(publicDir, { recursive: true });

  const writingItems = await readMarkdownItems(writingDir, 'writing');
  const travelItems = await readMarkdownItems(travelDir, 'travel');
  const workItems = await readWorkItems();

  const rssItems = [...writingItems, ...travelItems]
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
    .slice(0, 80);

  const sitemapItems = [
    { url: `${siteUrl}/`, updatedAt: null },
    { url: `${siteUrl}/#/search`, updatedAt: null },
    { url: `${siteUrl}/#writing`, updatedAt: null },
    { url: `${siteUrl}/#travel`, updatedAt: null },
    { url: `${siteUrl}/#works`, updatedAt: null },
    ...writingItems.map((item) => ({ url: item.url, updatedAt: item.updatedAt })),
    ...travelItems.map((item) => ({ url: item.url, updatedAt: item.updatedAt })),
    ...workItems.map((item) => ({ url: item.url, updatedAt: item.updatedAt }))
  ];

  await fs.writeFile(path.join(publicDir, 'rss.xml'), buildRssXml(rssItems), 'utf8');
  await fs.writeFile(path.join(publicDir, 'sitemap.xml'), buildSitemapXml(sitemapItems), 'utf8');

  console.log('Generated public/rss.xml and public/sitemap.xml');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
