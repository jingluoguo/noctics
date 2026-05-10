# Page Config Guide

All page content is centralized in:

- `src/site.config.ts`

You can update this file to change:

- Brand name (`brand.name`)
- Page title (`seo.title`)
- Site icon (`seo.icon`)
- Top nav (`nav`)
- Hero texts/button/sculpture toggle (`hero`)
- Section titles and data (`sections.*`)
- Footer right text (`footer.rightText`)

No component edits are required for normal content updates.

### Works section app config (recommended)

Put one config file per app into:

- `src/content/apps/*.ts`

Example:

```ts
import type { WorkItem } from '../../site.config';

const app: WorkItem = {
  name: 'Nebula Journal',
  desc: '关系与事件管理应用，强调信息密度与情绪化表达。',
  stack: 'Flutter · GetX · SQLite',
  logo: '/app-logos/nebula-journal.svg',
  website: 'https://example.com/nebula-journal',
  platforms: [
    { name: 'iOS 下载', url: 'https://apps.apple.com/' },
    { name: 'Android 下载', url: 'https://play.google.com/store' }
  ]
};

export default app;
```

Rules:

- Each app is one independent config file
- Homepage auto-discovers all app configs
- Homepage shows latest 5 apps
- Card displays name, stack, desc, logo, platform download links
- Clicking app card opens `website`

### Writing section markdown (recommended)

Put markdown files into:

- `src/content/writing/*.md`

Each file can use:

- First line `# 标题` (recommended)
- Then article markdown body
- Optional front matter for `category` / `tags` / `summary`

The writing section auto-discovers and renders these files.
When markdown files exist, they take priority over `site.config.ts` writing items.
Writing list shows a one-line summary (ellipsis when overflow), and each item has a detail page.
- Homepage shows latest 5 articles

Example:

```md
---
category: Flutter
tags: form, state-management, ux
summary: 这一篇文章的列表摘要文案
---
# 文章标题

正文第一段...
```

### Writing section fallback structure

If no local markdown files are present, `sections.writing.items` in `site.config.ts` is used:

```ts
{
  title: string;
  markdown: string;
  summary?: string;
  category?: string;
  tags?: string[];
}[]
```

Supported markdown includes:

- Headings (`#`)
- Paragraphs
- Lists (`-` / `1.`)
- Quote (`>`)
- Inline code and code blocks
- Links and images

### Travel section markdown (recommended)

Put markdown files into:

- `src/content/travel/*.md`

Recommended front matter:

```md
---
city: Kyoto
date: 2026-04-08
tags: japan, street, rain-night
summary: 这一篇游记的列表摘要文案
---
# 京都雨夜

正文...
```

Rules:

- `city` is used as card title (fallback to markdown `#` heading)
- `date` and `tags` render as metadata badges
- `summary` is used as list summary (fallback to auto-generated summary from body)
- List shows a one-line summary (ellipsis when overflow)
- Each item has a detail page
- Homepage shows latest 5 travel notes
- When travel markdown files exist, they take priority over `site.config.ts` travel items

## Detail route format

- Writing detail: `#/writing/<slug>`
- Travel detail: `#/travel/<slug>`

## List page route format

- Works list: `#/works/page/<n>`
- Writing list: `#/writing/page/<n>`
- Travel list: `#/travel/page/<n>`

List pages support pagination:

- Page size is fixed at 12

## CMS mode (optional)

You can provide a remote CMS JSON endpoint:

- `VITE_CMS_SITE_CONFIG_URL`
- `VITE_CMS_BEARER_TOKEN` (optional)

When `VITE_CMS_SITE_CONFIG_URL` is set, the app fetches a full `siteConfig` JSON at runtime.
If the request fails, it falls back to local `src/site.config.ts`.
