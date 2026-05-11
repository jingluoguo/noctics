import { Markdown } from '../components/Markdown';

type DetailPageProps = {
  title: string;
  markdown: string;
  backHref: string;
  backLabel?: string;
  meta?: string[];
  prevItem?: { title: string; href: string } | null;
  nextItem?: { title: string; href: string } | null;
};

export function DetailPage({
  title,
  markdown,
  backHref,
  backLabel = '返回',
  meta = [],
  prevItem,
  nextItem
}: DetailPageProps) {
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
      {(prevItem || nextItem) && (
        <nav className="detail-siblings" aria-label="文章导航">
          {prevItem ? (
            <a className="detail-sibling-link" href={prevItem.href}>
              <span className="detail-sibling-label">上一篇</span>
              <strong>{prevItem.title}</strong>
            </a>
          ) : (
            <span className="detail-sibling-link detail-sibling-disabled" aria-disabled="true">
              <span className="detail-sibling-label">上一篇</span>
              <strong>已到第一篇</strong>
            </span>
          )}
          {nextItem ? (
            <a className="detail-sibling-link detail-sibling-link-next" href={nextItem.href}>
              <span className="detail-sibling-label">下一篇</span>
              <strong>{nextItem.title}</strong>
            </a>
          ) : (
            <span className="detail-sibling-link detail-sibling-link-next detail-sibling-disabled" aria-disabled="true">
              <span className="detail-sibling-label">下一篇</span>
              <strong>已到最后一篇</strong>
            </span>
          )}
        </nav>
      )}
    </section>
  );
}
