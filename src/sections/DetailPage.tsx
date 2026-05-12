import { useEffect, useMemo, useState } from 'react';
import { Markdown, extractTocHeadings } from '../components/Markdown';
import type { TocHeading } from '../components/Markdown';

type DetailPageProps = {
  title: string;
  markdown: string;
  backHref: string;
  backLabel?: string;
  meta?: string[];
  prevItem?: { title: string; href: string } | null;
  nextItem?: { title: string; href: string } | null;
  prevLabel?: string;
  nextLabel?: string;
  prevEndText?: string;
  nextEndText?: string;
  structuredData?: Record<string, unknown> | null;
};

export function DetailPage({
  title,
  markdown,
  backHref,
  backLabel = '返回',
  meta = [],
  prevItem,
  nextItem,
  prevLabel = '上一篇',
  nextLabel = '下一篇',
  prevEndText = '已到第一篇',
  nextEndText = '已到最后一篇',
  structuredData = null
}: DetailPageProps) {
  const parsedTocItems = useMemo(() => extractTocHeadings(markdown), [markdown]);
  const [tocItems, setTocItems] = useState<TocHeading[]>(parsedTocItems);
  const [tocOpen, setTocOpen] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.detail-body .markdown h1[id], .detail-body .markdown h2[id], .detail-body .markdown h3[id]'));
    if (nodes.length > 0) {
      const domToc: TocHeading[] = nodes.map((node) => {
        const level = Number(node.tagName.replace('H', ''));
        return {
          id: node.id,
          text: (node.textContent || '').trim(),
          level: Number.isFinite(level) ? level : 2
        };
      }).filter((item) => item.text);
      if (domToc.length > 0) {
        setTocItems(domToc);
        return;
      }
    }
    setTocItems(parsedTocItems);
  }, [markdown, parsedTocItems]);

  useEffect(() => {
    if (!tocItems.length) return;

    const selectors = tocItems.map((item) => `#${CSS.escape(item.id)}`).join(', ');
    const elements = Array.from(document.querySelectorAll<HTMLElement>(selectors));
    if (!elements.length) return;

    const updateActive = () => {
      let current = elements[0]?.id ?? '';
      for (const element of elements) {
        if (element.getBoundingClientRect().top <= 120) {
          current = element.id;
        } else {
          break;
        }
      }
      setActiveHeadingId(current);
    };

    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', updateActive);
    return () => {
      window.removeEventListener('scroll', updateActive);
      window.removeEventListener('resize', updateActive);
    };
  }, [tocItems]);

  useEffect(() => {
    const updateProgress = () => {
      const body = document.querySelector<HTMLElement>('.detail-body');
      if (!body) return;

      const rect = body.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const total = Math.max(1, rect.height - viewportHeight * 0.4);
      const passed = Math.max(0, -rect.top + viewportHeight * 0.2);
      const percent = Math.max(0, Math.min(100, Math.round((passed / total) * 100)));
      setReadProgress(percent);
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [markdown]);

  const onTocJump = (headingId: string) => {
    const escapedId = CSS.escape(headingId);
    const target = document.querySelector<HTMLElement>(`.detail-body .markdown h1#${escapedId}, .detail-body .markdown h2#${escapedId}, .detail-body .markdown h3#${escapedId}`);
    if (!target) return;
    const rootStyle = getComputedStyle(document.documentElement);
    const headerHeightRaw = rootStyle.getPropertyValue('--header-height').trim();
    const headerHeight = Number.parseFloat(headerHeightRaw) || 58;
    const absoluteTop = window.scrollY + target.getBoundingClientRect().top;
    const top = Math.max(0, absoluteTop - headerHeight - 14);
    window.scrollTo({ top, behavior: 'smooth' });
    setTocOpen(false);
  };

  return (
    <section className="container section detail-page">
      <a className="detail-back" href={backHref}>
        {backLabel}
      </a>
      <h2>{title}</h2>
      {meta.length > 0 && (
        <div className="detail-meta">
          {meta.map((item) => (
            <span key={item} className="detail-meta-item">
              {item}
            </span>
          ))}
        </div>
      )}
      <div className="detail-body">
        <Markdown content={markdown} />
      </div>
      <>
        <button
          type="button"
          className="toc-fab"
          onClick={() => setTocOpen((open) => !open)}
          aria-expanded={tocOpen}
          aria-controls="article-toc-panel"
        >
          目录 {readProgress}%
        </button>
        <aside id="article-toc-panel" className={`toc-drawer ${tocOpen ? 'is-open' : ''}`} aria-label="文章目录">
          <div className="toc-drawer-head">
            <strong>文章目录</strong>
            <button type="button" className="toc-close" onClick={() => setTocOpen(false)} aria-label="关闭目录">
              关闭
            </button>
          </div>
          <nav className="toc-list">
            {tocItems.length > 0 ? (
              tocItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`toc-item toc-level-${item.level} ${activeHeadingId === item.id ? 'is-active' : ''}`}
                  onClick={() => onTocJump(item.id)}
                >
                  {item.text}
                </button>
              ))
            ) : (
              <p className="toc-empty">当前文章暂无可导航标题</p>
            )}
          </nav>
        </aside>
        {tocOpen && <button type="button" className="toc-mask" aria-label="关闭目录遮罩" onClick={() => setTocOpen(false)} />}
      </>
      {(prevItem || nextItem) && (
        <nav className="detail-siblings" aria-label="文章导航">
          {prevItem ? (
            <a className="detail-sibling-link" href={prevItem.href}>
              <span className="detail-sibling-label">{prevLabel}</span>
              <strong>{prevItem.title}</strong>
            </a>
          ) : (
            <span className="detail-sibling-link detail-sibling-disabled" aria-disabled="true">
              <span className="detail-sibling-label">{prevLabel}</span>
              <strong>{prevEndText}</strong>
            </span>
          )}
          {nextItem ? (
            <a className="detail-sibling-link detail-sibling-link-next" href={nextItem.href}>
              <span className="detail-sibling-label">{nextLabel}</span>
              <strong>{nextItem.title}</strong>
            </a>
          ) : (
            <span className="detail-sibling-link detail-sibling-link-next detail-sibling-disabled" aria-disabled="true">
              <span className="detail-sibling-label">{nextLabel}</span>
              <strong>{nextEndText}</strong>
            </span>
          )}
        </nav>
      )}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </section>
  );
}
