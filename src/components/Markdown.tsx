import { useEffect, useRef } from 'react';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import markdown from 'highlight.js/lib/languages/markdown';
import yaml from 'highlight.js/lib/languages/yaml';
import dart from 'highlight.js/lib/languages/dart';
import { withBaseAssetUrl } from '../lib/asset';

type MarkdownProps = {
  content: string;
};

export type TocHeading = {
  id: string;
  text: string;
  level: number;
};

function slugifyHeading(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[*_`~[\]()]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function createHeadingId(rawHeading: string, used: Map<string, number>): string {
  const base = slugifyHeading(rawHeading) || 'section';
  const count = used.get(base) ?? 0;
  used.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

export function extractTocHeadings(content: string): TocHeading[] {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const headings: TocHeading[] = [];
  const used = new Map<string, number>();
  let inCode = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (line.startsWith('```')) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;

    const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (!headingMatch) continue;

    const level = headingMatch[1].length;
    const text = headingMatch[2].trim();
    headings.push({
      id: createHeadingId(text, used),
      text,
      level
    });
  }

  return headings;
}

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('tsx', typescript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('md', markdown);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);
hljs.registerLanguage('dart', dart);

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttribute(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function encodeForDataAttribute(text: string): string {
  return encodeURIComponent(text);
}

function decodeFromDataAttribute(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

function highlightCode(rawCode: string, language: string): string {
  const normalizedLanguage = language.trim().toLowerCase();
  if (normalizedLanguage && hljs.getLanguage(normalizedLanguage)) {
    return hljs.highlight(rawCode, { language: normalizedLanguage, ignoreIllegals: true }).value;
  }

  return hljs.highlightAuto(rawCode).value;
}

function parseInline(text: string): string {
  const escaped = escapeHtml(text);

  return escaped
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt: string, src: string) => `<img alt="${alt}" src="${withBaseAssetUrl(src)}" />`)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>');
}

function renderMarkdown(content: string) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const nodes: string[] = [];
  const usedHeadingIds = new Map<string, number>();
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let codeLines: string[] = [];
  let codeLanguage = '';
  let inCode = false;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    nodes.push(`<p>${paragraph.map(parseInline).join(' ')}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (!listType || !listItems.length) return;
    nodes.push(`<${listType}>${listItems.map((item) => `<li>${parseInline(item)}</li>`).join('')}</${listType}>`);
    listItems = [];
    listType = null;
  };

  const flushCode = () => {
    const rawCode = codeLines.join('\n');
    const normalizedLanguage = codeLanguage.trim().toLowerCase() || 'text';
    const highlightedCode = highlightCode(rawCode, normalizedLanguage);
    nodes.push(
      `<div class="markdown-code-block" data-code="${escapeAttribute(encodeForDataAttribute(rawCode))}">` +
        `<div class="markdown-code-head">` +
          `<span class="markdown-code-lang">${normalizedLanguage}</span>` +
          `<button type="button" class="markdown-code-copy" aria-label="复制代码">复制</button>` +
        `</div>` +
        `<pre><code class="language-${normalizedLanguage}">${highlightedCode}</code></pre>` +
      `</div>`
    );
    codeLines = [];
    codeLanguage = '';
    inCode = false;
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith('```')) {
      if (inCode) {
        flushCode();
      } else {
        flushParagraph();
        flushList();
        inCode = true;
        codeLanguage = line.replace(/^```/, '').trim();
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = headingMatch[1].length;
      const headingText = headingMatch[2].trim();
      const headingId = createHeadingId(headingText, usedHeadingIds);
      nodes.push(`<h${level} id="${escapeAttribute(headingId)}">${parseInline(headingText)}</h${level}>`);
      continue;
    }

    const quoteMatch = line.match(/^>\s+(.*)$/);
    if (quoteMatch) {
      flushParagraph();
      flushList();
      nodes.push(`<blockquote>${parseInline(quoteMatch[1])}</blockquote>`);
      continue;
    }

    const unorderedMatch = line.match(/^[-*+]\s+(.*)$/);
    const orderedMatch = line.match(/^\d+\.\s+(.*)$/);
    if (unorderedMatch || orderedMatch) {
      flushParagraph();
      const nextType: 'ul' | 'ol' = unorderedMatch ? 'ul' : 'ol';
      if (listType && listType !== nextType) {
        flushList();
      }
      listType = nextType;
      listItems.push((unorderedMatch || orderedMatch)?.[1] ?? '');
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  if (inCode) {
    flushCode();
  }

  flushParagraph();
  flushList();

  return nodes.join('');
}

export function Markdown({ content }: MarkdownProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onClick = async (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const copyButton = target.closest('.markdown-code-copy') as HTMLButtonElement | null;
      if (!copyButton) return;

      const block = copyButton.closest('.markdown-code-block') as HTMLElement | null;
      const encodedCode = block?.dataset.code;
      if (!encodedCode) return;
      const rawCode = decodeFromDataAttribute(encodedCode);

      try {
        await navigator.clipboard.writeText(rawCode);
        copyButton.textContent = '已复制';
        window.setTimeout(() => {
          if (copyButton.isConnected) copyButton.textContent = '复制';
        }, 1200);
      } catch {
        copyButton.textContent = '复制失败';
        window.setTimeout(() => {
          if (copyButton.isConnected) copyButton.textContent = '复制';
        }, 1200);
      }
    };

    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [content]);

  return <div ref={rootRef} className="markdown" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />;
}
