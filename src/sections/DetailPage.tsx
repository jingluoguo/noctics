import { Markdown } from '../components/Markdown';

type DetailPageProps = {
  title: string;
  markdown: string;
  backHref: string;
  backLabel?: string;
  meta?: string[];
};

export function DetailPage({ title, markdown, backHref, backLabel = '返回', meta = [] }: DetailPageProps) {
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
    </section>
  );
}
