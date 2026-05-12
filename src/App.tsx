import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Header } from './components/Header';
import { MouseAura } from './components/MouseAura';
import { CustomCursor } from './components/CustomCursor';
import { Hero } from './sections/Hero';
import { Works } from './sections/Works';
import { Writing } from './sections/Writing';
import { Travel } from './sections/Travel';
import { Photography } from './sections/Photography';
import { Footer } from './components/Footer';
import { useSiteConfig } from './hooks/useSiteConfig';
import { getTravelItems, getWorkItems, getWritingItems } from './lib/content';
import { DetailPage } from './sections/DetailPage';

function splitHash(hash: string) {
  if (!hash) return { path: '', query: '' };
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  const [pathPart = '', query = ''] = raw.split('?');
  return { path: `#${pathPart}`, query };
}

function parseHash(hash: string) {
  const { path } = splitHash(hash);
  const match = path.match(/^#\/(writing|travel|works)\/([^/]+?)(?:\/page\/(\d+))?$/);
  if (!match) return null;
  const page = match[3] ? Math.max(1, Number(match[3])) : undefined;
  return { type: match[1] as 'writing' | 'travel' | 'works', slug: decodeURIComponent(match[2]), page };
}

function parseSectionHash(hash: string) {
  const { path } = splitHash(hash);
  const match = path.match(/^#([a-zA-Z0-9_-]+)$/);
  if (!match) return null;
  return match[1];
}

function parseListHash(hash: string) {
  const { path } = splitHash(hash);
  const match = path.match(/^#\/(works|writing|travel)(?:\/page\/(\d+))?$/);
  if (!match) return null;
  const page = Math.max(1, Number(match[2] || 1));
  return { type: match[1] as 'works' | 'writing' | 'travel', page };
}

function parseTagFromHash(hash: string) {
  const { query } = splitHash(hash);
  if (!query) return null;
  const tag = new URLSearchParams(query).get('tag')?.trim();
  return tag || null;
}

function withTag(path: string, tag?: string | null) {
  if (!tag) return path;
  return `${path}?tag=${encodeURIComponent(tag)}`;
}

function buildListPageHref(type: 'works' | 'writing' | 'travel', page: number, tag?: string | null) {
  return withTag(`#/${type}/page/${page}`, tag);
}

function buildSectionHref(type: 'works' | 'writing' | 'travel', tag?: string | null) {
  return withTag(`#${type}`, tag);
}

function filterByTag<T extends { tags: string[] }>(items: T[], tag: string | null) {
  if (!tag) return items;
  return items.filter((item) => item.tags.includes(tag));
}

function collectTags<T extends { tags: string[] }>(items: T[]) {
  const tags = new Set<string>();
  for (const item of items) {
    for (const tag of item.tags) tags.add(tag);
  }
  return Array.from(tags).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
}

function normalizePage(page: number, total: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  return Math.min(Math.max(1, page), pageCount);
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

function buildCompactPages(currentPage: number, pageCount: number): Array<number | 'ellipsis'> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, pageCount, currentPage - 1, currentPage, currentPage + 1]);
  const normalized = Array.from(pages)
    .filter((page) => page >= 1 && page <= pageCount)
    .sort((a, b) => a - b);

  const output: Array<number | 'ellipsis'> = [];
  for (let index = 0; index < normalized.length; index += 1) {
    const current = normalized[index];
    const prev = normalized[index - 1];
    if (index > 0 && current - prev > 1) {
      output.push('ellipsis');
    }
    output.push(current);
  }
  return output;
}

function Pagination({
  type,
  page,
  total,
  pageSize,
  activeTag
}: {
  type: 'works' | 'writing' | 'travel';
  page: number;
  total: number;
  pageSize: number;
  activeTag?: string | null;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (pageCount <= 1) return null;
  const currentPage = Math.min(page, pageCount);
  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(pageCount, currentPage + 1);
  const compactPages = buildCompactPages(currentPage, pageCount);

  return (
    <div className="container pagination">
      <a
        className={`pagination-link ${currentPage <= 1 ? 'pagination-disabled' : ''}`}
        href={buildListPageHref(type, prevPage, activeTag)}
      >
        上一页
      </a>
      <div className="pagination-pages">
        {compactPages.map((item, index) =>
          item === 'ellipsis' ? (
            <span key={`${type}-ellipsis-${index}`} className="pagination-ellipsis">
              ...
            </span>
          ) : (
            <a
              key={`${type}-page-${item}`}
              className={`pagination-link ${item === currentPage ? 'pagination-current' : ''}`}
              href={buildListPageHref(type, item, activeTag)}
            >
              {item}
            </a>
          )
        )}
      </div>
      <a
        className={`pagination-link ${currentPage >= pageCount ? 'pagination-disabled' : ''}`}
        href={buildListPageHref(type, nextPage, activeTag)}
      >
        下一页
      </a>
    </div>
  );
}

function App() {
  const config = useSiteConfig();
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    document.title = config.seo.title;
  }, [config.seo.title]);

  useEffect(() => {
    const iconUrl = `${config.seo.icon}${config.seo.icon.includes('?') ? '&' : '?'}v=1`;
    const iconRels = ['icon', 'shortcut icon', 'apple-touch-icon'];

    for (const rel of iconRels) {
      let iconLink = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!iconLink) {
        iconLink = document.createElement('link');
        iconLink.rel = rel;
        document.head.appendChild(iconLink);
      }
      iconLink.href = iconUrl;
      if (rel === 'icon' || rel === 'shortcut icon') {
        iconLink.type = 'image/x-icon';
      }
    }
  }, [config.seo.icon]);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const hasPageRoute = Boolean(parseHash(hash) || parseListHash(hash));
    if (hasPageRoute) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [hash]);

  const route = useMemo(() => parseHash(hash), [hash]);
  const listRoute = useMemo(() => parseListHash(hash), [hash]);
  const sectionHash = useMemo(() => parseSectionHash(hash), [hash]);
  const hashTag = useMemo(() => parseTagFromHash(hash), [hash]);
  const writingItems = useMemo(() => getWritingItems(), []);
  const travelItems = useMemo(() => getTravelItems(), []);
  const workItems = useMemo(() => getWorkItems(), []);
  const writingTags = useMemo(() => collectTags(writingItems), [writingItems]);
  const travelTags = useMemo(() => collectTags(travelItems), [travelItems]);
  const currentSectionType = route?.type ?? listRoute?.type ?? (sectionHash === 'writing' || sectionHash === 'travel' || sectionHash === 'works' ? sectionHash : null);
  const writingTag = currentSectionType === 'writing' ? hashTag : null;
  const travelTag = currentSectionType === 'travel' ? hashTag : null;
  const writingScopedItems = useMemo(() => filterByTag(writingItems, writingTag), [writingItems, writingTag]);
  const travelScopedItems = useMemo(() => filterByTag(travelItems, travelTag), [travelItems, travelTag]);

  let detailContent: ReactNode = null;
  if (route?.type === 'writing') {
    const sourceItems = writingScopedItems.some((entry) => entry.slug === route.slug) ? writingScopedItems : writingItems;
    const currentIndex = sourceItems.findIndex((entry) => entry.slug === route.slug);
    const item = currentIndex >= 0 ? sourceItems[currentIndex] : undefined;
    if (item && currentIndex >= 0) {
      const meta = [item.updatedAt ? `更新于 ${item.updatedAt}` : '', item.category, ...item.tags.map((tag) => `#${tag}`)].filter(Boolean) as string[];
      const backHref = route.page ? buildListPageHref('writing', route.page, writingTag) : buildSectionHref('writing', writingTag);
      const prevEntry = sourceItems[currentIndex - 1];
      const nextEntry = sourceItems[currentIndex + 1];
      const buildWritingDetailHref = (slug: string) =>
        withTag(`#/writing/${slug}${route.page ? `/page/${route.page}` : ''}`, writingTag);
      detailContent = (
        <DetailPage
          title={item.title}
          markdown={item.markdown}
          backHref={backHref}
          meta={meta}
          prevItem={prevEntry ? { title: prevEntry.title, href: buildWritingDetailHref(prevEntry.slug) } : null}
          nextItem={nextEntry ? { title: nextEntry.title, href: buildWritingDetailHref(nextEntry.slug) } : null}
        />
      );
    }
  }
  if (route?.type === 'travel') {
    const sourceItems = travelScopedItems.some((entry) => entry.slug === route.slug) ? travelScopedItems : travelItems;
    const currentIndex = sourceItems.findIndex((entry) => entry.slug === route.slug);
    const item = currentIndex >= 0 ? sourceItems[currentIndex] : undefined;
    if (item && currentIndex >= 0) {
      const meta = [item.date, ...item.tags.map((tag) => `#${tag}`)].filter(Boolean) as string[];
      const backHref = route.page ? buildListPageHref('travel', route.page, travelTag) : buildSectionHref('travel', travelTag);
      const prevEntry = sourceItems[currentIndex - 1];
      const nextEntry = sourceItems[currentIndex + 1];
      const buildTravelDetailHref = (slug: string) =>
        withTag(`#/travel/${slug}${route.page ? `/page/${route.page}` : ''}`, travelTag);
      detailContent = (
        <DetailPage
          title={item.city}
          markdown={item.markdown}
          backHref={backHref}
          meta={meta}
          prevItem={prevEntry ? { title: prevEntry.city, href: buildTravelDetailHref(prevEntry.slug) } : null}
          nextItem={nextEntry ? { title: nextEntry.city, href: buildTravelDetailHref(nextEntry.slug) } : null}
          prevLabel="上一章"
          nextLabel="下一章"
          prevEndText="已到第一章"
          nextEndText="已到最后一章"
        />
      );
    }
  }
  if (route?.type === 'works') {
    const item = workItems.find((entry) => entry.name === route.slug);
    if (item) {
      const meta = [item.updatedAt ? `更新于 ${item.updatedAt}` : '', item.stack].filter(Boolean) as string[];
      const markdown = [
        item.desc,
        '',
        item.website ? `[项目主页](${item.website})` : '',
        item.platforms?.length
          ? item.platforms.map((platform) => `- [${platform.name}](${platform.url})`).join('\n')
          : ''
      ]
        .filter(Boolean)
        .join('\n');
      const backHref = route.page ? buildListPageHref('works', route.page) : '#works';
      detailContent = <DetailPage title={item.name} markdown={markdown} backHref={backHref} meta={meta} />;
    }
  }

  let listContent: ReactNode = null;
  if (listRoute?.type === 'works') {
    const pageSize = 12;
    const page = normalizePage(listRoute.page, workItems.length, pageSize);
    const pagedItems = paginate(workItems, page, pageSize);
    listContent = (
      <>
        <section className="container section detail-page">
          <a className="detail-back" href="#works">返回</a>
          <Works config={config} items={pagedItems} listPage={page} />
        </section>
        <Pagination type="works" page={page} total={workItems.length} pageSize={pageSize} />
      </>
    );
  }
  if (listRoute?.type === 'writing') {
    const pageSize = 12;
    const page = normalizePage(listRoute.page, writingScopedItems.length, pageSize);
    const pagedItems = paginate(writingScopedItems, page, pageSize);
    listContent = (
      <>
        <section className="container section detail-page">
          <a className="detail-back" href={buildSectionHref('writing', writingTag)}>返回</a>
          <Writing
            config={config}
            items={pagedItems}
            listPage={page}
            activeTag={writingTag}
            availableTags={writingTags}
            tagHrefBuilder={(tag) => buildListPageHref('writing', 1, tag)}
            detailTag={writingTag}
          />
        </section>
        <Pagination type="writing" page={page} total={writingScopedItems.length} pageSize={pageSize} activeTag={writingTag} />
      </>
    );
  }
  if (listRoute?.type === 'travel') {
    const pageSize = 12;
    const page = normalizePage(listRoute.page, travelScopedItems.length, pageSize);
    const pagedItems = paginate(travelScopedItems, page, pageSize);
    listContent = (
      <>
        <section className="container section detail-page">
          <a className="detail-back" href={buildSectionHref('travel', travelTag)}>返回</a>
          <Travel
            config={config}
            items={pagedItems}
            listPage={page}
            activeTag={travelTag}
            availableTags={travelTags}
            tagHrefBuilder={(tag) => buildListPageHref('travel', 1, tag)}
            detailTag={travelTag}
          />
        </section>
        <Pagination type="travel" page={page} total={travelScopedItems.length} pageSize={pageSize} activeTag={travelTag} />
      </>
    );
  }

  useEffect(() => {
    if (route || listRoute) return;
    const sectionId = parseSectionHash(hash);
    if (!sectionId) return;
    const element = document.getElementById(sectionId);
    if (!element) return;
    requestAnimationFrame(() => {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [hash, route, listRoute]);

  useEffect(() => {
    if (!listRoute) return;
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, [listRoute?.type, listRoute?.page]);

  return (
    <div className="site-shell">
      <CustomCursor />
      <MouseAura />
      <div className="mesh mesh-a" />
      <div className="mesh mesh-b" />
      <div className="mesh mesh-c" />
      <Header config={config} />
      <main>
        {detailContent ? (
          detailContent
        ) : listContent ? (
          listContent
        ) : (
          <>
            <Hero config={config} />
            <Works config={config} items={workItems.slice(0, 6)} moreHref="#/works/page/1" moreLabel="浏览全部作品" />
            <Writing
              config={config}
              items={writingItems.slice(0, 6)}
              moreHref={buildListPageHref('writing', 1)}
              moreLabel="浏览全部文章"
            />
            <Travel
              config={config}
              items={travelItems.slice(0, 6)}
              moreHref={buildListPageHref('travel', 1)}
              moreLabel="浏览全部游记"
            />
            <Photography config={config} />
          </>
        )}
      </main>
      <Footer config={config} />
    </div>
  );
}

export default App;
