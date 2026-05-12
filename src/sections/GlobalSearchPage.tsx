import { useEffect } from 'react';
import { SearchBox } from '../components/SearchBox';
import type { TravelContentItem, WritingContentItem } from '../lib/content';
import type { WorkItem } from '../site.config';

type GlobalSearchPageProps = {
  keyword: string;
  onKeywordChange: (next: string) => void;
  writingItems: WritingContentItem[];
  travelItems: TravelContentItem[];
  workItems: WorkItem[];
};

export function GlobalSearchPage({
  keyword,
  onKeywordChange,
  writingItems,
  travelItems,
  workItems
}: GlobalSearchPageProps) {
  const hasKeyword = Boolean(keyword.trim());
  const total = writingItems.length + travelItems.length + workItems.length;

  const onLocalKeywordChange = (next: string) => {
    const currentScrollTop = window.scrollY;
    onKeywordChange(next);
    requestAnimationFrame(() => {
      window.scrollTo({ top: currentScrollTop, left: 0, behavior: 'auto' });
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] ?? '');
    const hashKeyword = params.get('q')?.trim() ?? '';
    if (hashKeyword === keyword.trim()) return;
    const nextParams = new URLSearchParams();
    if (keyword.trim()) nextParams.set('q', keyword.trim());
    const query = nextParams.toString();
    const nextHash = query ? `#/search?${query}` : '#/search';
    const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;
    window.history.replaceState(null, '', nextUrl);
  }, [keyword]);

  return (
    <section className="container section detail-page global-search-page">
      <h2>全局搜索</h2>
      <SearchBox
        value={keyword}
        onChange={onLocalKeywordChange}
        autoFocus
        placeholder="搜索文章、游记、作品（标题/标签/摘要）"
      />
      <div className="search-results-shell">
        {hasKeyword ? (
          <p className="search-result-meta">共找到 {total} 条结果</p>
        ) : (
          <p className="search-result-meta">输入关键词开始搜索</p>
        )}

        {hasKeyword && total === 0 && <div className="filter-empty">未找到相关内容，试试更短的关键词或其他标签。</div>}

        {writingItems.length > 0 && (
          <div className="search-group">
            <h3>文章 ({writingItems.length})</h3>
            <div className="search-list">
              {writingItems.map((post) => (
                <article key={post.slug} className="search-list-item">
                  <a className="search-item-link" href={`#/writing/${post.slug}`}>
                    <div className="search-item-main">
                      <strong className="search-item-title">{post.title}</strong>
                      <span className="search-item-meta">
                        {post.updatedAt && <span className="item-updated-at">更新于 {post.updatedAt}</span>}
                        <span className="item-updated-at">{post.wordCount} 字 · 预计 {post.readingMinutes} 分钟</span>
                        {post.tags.map((tag) => (
                          <span key={`${post.slug}-${tag}`} className="article-tag">#{tag}</span>
                        ))}
                      </span>
                      <span className="search-item-summary">{post.summary}</span>
                    </div>
                  </a>
                </article>
              ))}
            </div>
          </div>
        )}

        {travelItems.length > 0 && (
          <div className="search-group">
            <h3>游记 ({travelItems.length})</h3>
            <div className="search-list">
              {travelItems.map((trip) => (
                <article key={trip.slug} className="search-list-item">
                  <a className="search-item-link" href={`#/travel/${trip.slug}`}>
                    <div className="search-item-main">
                      <strong className="search-item-title">{trip.city}</strong>
                      <div className="search-item-meta">
                        {trip.date && <span className="travel-date">{trip.date}</span>}
                        {trip.tags.map((tag) => (
                          <span key={`${trip.slug}-${tag}`} className="travel-tag">#{tag}</span>
                        ))}
                      </div>
                      <p className="search-item-summary">{trip.summary}</p>
                    </div>
                  </a>
                </article>
              ))}
            </div>
          </div>
        )}

        {workItems.length > 0 && (
          <div className="search-group">
            <h3>作品 ({workItems.length})</h3>
            <div className="search-list">
              {workItems.map((app) => (
                <article key={app.name} className="search-list-item">
                  <a className="work-link search-work-link" href={`#/works/${encodeURIComponent(app.name)}`}>
                    <div className="search-item-main">
                      <strong className="search-item-title">{app.name}</strong>
                      <span className="search-item-summary">{app.desc}</span>
                      <span className="search-item-meta">
                        <span className="item-updated-at">{app.stack}</span>
                      </span>
                    </div>
                  </a>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
