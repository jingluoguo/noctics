# Page Config Guide

All page content is centralized in:

- `src/site.config.ts`

You can update this file to change:

- Brand name (`brand.name`)
- Page title (`seo.title`)
- Site icon (`seo.icon`)
- Top nav (`nav`)
- Hero texts/button/sculpture toggle (`hero`)
- Hero profile card (`hero.profile`) including avatar / nickname / socials
- Section titles and data (`sections.*`)
- Footer right text (`footer.rightText`)

No component edits are required for normal content updates.

### Photography config (single file recommended)

Put photography items into:

- `src/content/photography.ts`

Example:

```ts
import type { PhotoItem } from '../site.config';

const photographyItems: PhotoItem[] = [
  { title: 'Dawn Geometry', image: '/photos/dawn-geometry.jpg', tone: 'cool', h: 'tall' },
  { title: 'Fog & Steel', image: '/photos/fog-steel.jpg', tone: 'warm', h: 'mid' }
];

export default photographyItems;
```

Rules:

- If `src/content/photography.ts` exists and has items, homepage uses it first
- If missing or empty, fallback to `site.config.ts` `sections.photography.items`
- `image` is optional; when provided, it renders real photo (put files under `public/photos` and use `/photos/xxx.jpg`)
- When `image` is missing, it falls back to color placeholder by `tone`

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
- Optional front matter for `category` / `tags` / `summary` / `cover`

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
cover: /covers/flutter-form.jpg
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
  cover?: string;
  category?: string;
  tags?: string[];
}[]
```

You can also set writing list cover ratio:

```ts
sections: {
  writing: {
    coverAspectRatio: '16 / 9'
  }
}
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
cover: /covers/kyoto-rain-night.jpg
---
# 京都雨夜

正文...
```

Rules:

- `city` is used as card title (fallback to markdown `#` heading)
- `date` and `tags` render as metadata badges
- `summary` is used as list summary (fallback to auto-generated summary from body)
- `cover` is used as list cover image (fallback to title placeholder when missing)
- `sections.travel.coverAspectRatio` controls travel list cover ratio (default `16 / 9`)
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

## Hero profile config (optional)

You can render avatar, nickname and social links on homepage hero by adding:

```ts
hero: {
  // ...other hero fields
  profile: {
    avatar: '/avatar.jpg',
    nickname: 'DonGuo',
    headline: 'MOBILE ENGINEER · WRITER',
    intro: '移动端工程师，关注体验与叙事。',
    socials: [
      { label: 'GitHub', icon: '🐙', url: 'https://github.com/yourname' },
      { label: 'X', icon: '𝕏', url: 'https://x.com/yourname' }
    ]
  }
}
```

Rules:

- `profile` is optional; when omitted, the profile card is hidden
- `avatar` should be an accessible static path or full URL
- `headline` is optional and appears under nickname
- `socials` supports any platform, rendered in order
- each social item requires `icon`, `label`, and `url`

## CMS mode (optional)

You can provide a remote CMS JSON endpoint:

- `VITE_CMS_SITE_CONFIG_URL`
- `VITE_CMS_BEARER_TOKEN` (optional)

When `VITE_CMS_SITE_CONFIG_URL` is set, the app fetches a full `siteConfig` JSON at runtime.
If the request fails, it falls back to local `src/site.config.ts`.
