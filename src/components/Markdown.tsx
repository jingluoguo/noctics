type MarkdownProps = {
  content: string;
};

function parseInline(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return escaped
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>');
}

function renderMarkdown(content: string) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const nodes: string[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let codeLines: string[] = [];
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
    nodes.push(`<pre><code>${codeLines.map((line) => line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')).join('\n')}</code></pre>`);
    codeLines = [];
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
      nodes.push(`<h${level}>${parseInline(headingMatch[2])}</h${level}>`);
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
  return <div className="markdown" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />;
}
