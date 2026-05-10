# Page Config Guide

All page content is centralized in:

- `src/site.config.ts`

You can update this file to change:

- Brand name (`brand.name`)
- Top nav (`nav`)
- Hero texts/button/sculpture toggle (`hero`)
- Section titles and data (`sections.*`)
- Footer right text (`footer.rightText`)

No component edits are required for normal content updates.

### Writing section markdown (recommended)

Put markdown files into:

- `src/content/writing/*.md`

Each file can use:

- First line `# 标题` (recommended)
- Then article markdown body
- Optional front matter for category/tags

The writing section auto-discovers and renders these files.
When markdown files exist, they take priority over `site.config.ts` writing items.
Writing list shows a one-line summary (ellipsis when overflow), and each item has a detail page.

Example:

```md
---
category: Flutter
tags: form, state-management, ux
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
---
# 京都雨夜

正文...
```

Rules:

- `city` is used as card title (fallback to markdown `#` heading)
- `date` and `tags` render as metadata badges
- List shows a one-line summary (ellipsis when overflow)
- Each item has a detail page
- When travel markdown files exist, they take priority over `site.config.ts` travel items

## Detail route format

- Writing detail: `#/writing/<slug>`
- Travel detail: `#/travel/<slug>`

## CMS mode (optional)

You can provide a remote CMS JSON endpoint:

- `VITE_CMS_SITE_CONFIG_URL`
- `VITE_CMS_BEARER_TOKEN` (optional)

When `VITE_CMS_SITE_CONFIG_URL` is set, the app fetches a full `siteConfig` JSON at runtime.
If the request fails, it falls back to local `src/site.config.ts`.
