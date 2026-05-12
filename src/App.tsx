import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Header } from './components/Header';
import { MouseAura } from './components/MouseAura';
import { CustomCursor } from './components/CustomCursor';
import { Hero } from './sections/Hero';
import { Works } from './sections/Works';
import { Writing } from './sections/Writing';
import { Travel } from './sections/Travel';
import { Photography } from './sections/Photography';
import { FriendLinks } from './sections/FriendLinks';
import { Footer } from './components/Footer';
import { GlobalSearchPage } from './sections/GlobalSearchPage';
import { useSiteConfig } from './hooks/useSiteConfig';
import { getTravelItems, getWorkItems, getWritingItems } from './lib/content';
import { DetailPage } from './sections/DetailPage';
import { filterTravelByKeyword, filterWorkByKeyword, filterWritingByKeyword } from './lib/search';

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

function parseSearchHash(hash: string) {
  const { path } = splitHash(hash);
  return path === '#/search';
}

function parseTagFromHash(hash: string) {
  const { query } = splitHash(hash);
  if (!query) return null;
  const tag = new URLSearchParams(query).get('tag')?.trim();
  return tag || null;
}

function parseKeywordFromHash(hash: string) {
  const { query } = splitHash(hash);
  if (!query) return '';
  return new URLSearchParams(query).get('q')?.trim() ?? '';
}

function shouldInstantSectionJump(previousHash: string, sectionId: string) {
  const previousRoute = parseHash(previousHash);
  if (!previousRoute) return false;
  return previousRoute.type === sectionId;
}

function buildPageTransitionKey(hash: string) {
  const { path, query } = splitHash(hash);
  const safePath = path || '#top';
  const tag = new URLSearchParams(query).get('tag')?.trim();
  if (!tag) return safePath;
  return `${safePath}?tag=${tag}`;
}

function withQuery(path: string, options: { tag?: string | null; keyword?: string }) {
  const params = new URLSearchParams();
  const tag = options.tag?.trim();
  const keyword = options.keyword?.trim();
  if (tag) params.set('tag', tag);
  if (keyword) params.set('q', keyword);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

function buildListPageHref(type: 'works' | 'writing' | 'travel', page: number, options?: { tag?: string | null; keyword?: string }) {
  return withQuery(`#/${type}/page/${page}`, options ?? {});
}

function buildSectionHref(type: 'works' | 'writing' | 'travel', options?: { tag?: string | null; keyword?: string }) {
  return withQuery(`#${type}`, options ?? {});
}

function buildTopHref(options?: { keyword?: string }) {
  return withQuery('#top', { keyword: options?.keyword });
}

function buildSearchHref(keyword?: string) {
  return withQuery('#/search', { keyword });
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
  activeTag,
  keyword
}: {
  type: 'works' | 'writing' | 'travel';
  page: number;
  total: number;
  pageSize: number;
  activeTag?: string | null;
  keyword?: string;
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
        href={buildListPageHref(type, prevPage, { tag: activeTag, keyword })}
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
              href={buildListPageHref(type, item, { tag: activeTag, keyword })}
            >
              {item}
            </a>
          )
        )}
      </div>
      <a
        className={`pagination-link ${currentPage >= pageCount ? 'pagination-disabled' : ''}`}
        href={buildListPageHref(type, nextPage, { tag: activeTag, keyword })}
      >
        下一页
      </a>
    </div>
  );
}

function App() {
  const config = useSiteConfig();
  const [hash, setHash] = useState(window.location.hash);
  const previousHashRef = useRef(hash);
  const [pageDirection, setPageDirection] = useState<'forward' | 'back'>('forward');
  const initialPageKey = buildPageTransitionKey(window.location.hash);
  const navStackRef = useRef<string[]>([initialPageKey]);
  const navIndexRef = useRef(0);

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
    const onHashChange = () => {
      const nextHash = window.location.hash;
      const nextPath = buildPageTransitionKey(nextHash);
      const stack = navStackRef.current;
      const currentIndex = navIndexRef.current;
      const currentPath = stack[currentIndex];

      if (nextPath !== currentPath) {
        if (currentIndex > 0 && stack[currentIndex - 1] === nextPath) {
          navIndexRef.current = currentIndex - 1;
          setPageDirection('back');
        } else if (currentIndex < stack.length - 1 && stack[currentIndex + 1] === nextPath) {
          navIndexRef.current = currentIndex + 1;
          setPageDirection('forward');
        } else {
          const nextStack = stack.slice(0, currentIndex + 1);
          nextStack.push(nextPath);
          navStackRef.current = nextStack;
          navIndexRef.current = nextStack.length - 1;
          setPageDirection('forward');
        }
      }

      setHash(nextHash);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const hasPageRoute = Boolean(parseHash(hash) || parseListHash(hash));
    if (hasPageRoute) window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [hash]);

  const route = useMemo(() => parseHash(hash), [hash]);
  const listRoute = useMemo(() => parseListHash(hash), [hash]);
  const isSearchRoute = useMemo(() => parseSearchHash(hash), [hash]);
  const pageTransitionKey = useMemo(() => buildPageTransitionKey(hash), [hash]);
  const sectionHash = useMemo(() => parseSectionHash(hash), [hash]);
  const hashTag = useMemo(() => parseTagFromHash(hash), [hash]);
  const hashKeyword = useMemo(() => parseKeywordFromHash(hash), [hash]);
  const [keywordInput, setKeywordInput] = useState(hashKeyword);
  const writingItems = useMemo(() => getWritingItems(), []);
  const travelItems = useMemo(() => getTravelItems(), []);
  const workItems = useMemo(() => getWorkItems(), []);
  const writingTags = useMemo(() => collectTags(writingItems), [writingItems]);
  const travelTags = useMemo(() => collectTags(travelItems), [travelItems]);
  const currentSectionType = route?.type ?? listRoute?.type ?? (sectionHash === 'writing' || sectionHash === 'travel' || sectionHash === 'works' ? sectionHash : null);
  const writingTag = currentSectionType === 'writing' ? hashTag : null;
  const travelTag = currentSectionType === 'travel' ? hashTag : null;
  const effectiveKeyword = isSearchRoute ? keywordInput : hashKeyword;
  const writingKeywordItems = useMemo(() => filterWritingByKeyword(writingItems, effectiveKeyword), [writingItems, effectiveKeyword]);
  const travelKeywordItems = useMemo(() => filterTravelByKeyword(travelItems, effectiveKeyword), [travelItems, effectiveKeyword]);
  const workKeywordItems = useMemo(() => filterWorkByKeyword(workItems, effectiveKeyword), [workItems, effectiveKeyword]);
  const writingScopedItems = useMemo(() => filterByTag(writingKeywordItems, writingTag), [writingKeywordItems, writingTag]);
  const travelScopedItems = useMemo(() => filterByTag(travelKeywordItems, travelTag), [travelKeywordItems, travelTag]);

  useEffect(() => {
    setKeywordInput(hashKeyword);
  }, [hashKeyword]);

  const updateHashWithoutJump = (nextHash: string) => {
    const nextPath = buildPageTransitionKey(nextHash);
    const stack = navStackRef.current;
    const currentIndex = navIndexRef.current;
    const currentPath = stack[currentIndex];
    if (nextPath !== currentPath) {
      const nextStack = stack.slice(0, currentIndex + 1);
      nextStack.push(nextPath);
      navStackRef.current = nextStack;
      navIndexRef.current = nextStack.length - 1;
      setPageDirection('forward');
    }
    const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;
    window.history.replaceState(null, '', nextUrl);
    setHash(nextHash);
  };

  const onSearchChange = (nextKeyword: string) => {
    setKeywordInput(nextKeyword);
    if (isSearchRoute) {
      return;
    }
    if (currentSectionType === 'writing') {
      const nextHash = buildSectionHref('writing', { tag: writingTag, keyword: nextKeyword });
      if (nextHash !== hash) {
        updateHashWithoutJump(nextHash);
      }
      return;
    }
    if (currentSectionType === 'travel') {
      const nextHash = buildSectionHref('travel', { tag: travelTag, keyword: nextKeyword });
      if (nextHash !== hash) {
        updateHashWithoutJump(nextHash);
      }
      return;
    }
    const nextHash = buildSearchHref(nextKeyword);
    if (nextHash !== hash) {
      updateHashWithoutJump(nextHash);
    }
  };

  const onSearchPageBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.hash = '#top';
  };

  let detailContent: ReactNode = null;
  if (route?.type === 'writing') {
    const sourceItems = writingScopedItems.some((entry) => entry.slug === route.slug) ? writingScopedItems : writingItems;
    const currentIndex = sourceItems.findIndex((entry) => entry.slug === route.slug);
    const item = currentIndex >= 0 ? sourceItems[currentIndex] : undefined;
    if (item && currentIndex >= 0) {
      const meta = [item.updatedAt ? `更新于 ${item.updatedAt}` : '', item.category, ...item.tags.map((tag) => `#${tag}`)].filter(Boolean) as string[];
      const backHref = route.page
        ? buildListPageHref('writing', route.page, { tag: writingTag, keyword: effectiveKeyword })
        : buildSectionHref('writing', { tag: writingTag, keyword: effectiveKeyword });
      const prevEntry = sourceItems[currentIndex - 1];
      const nextEntry = sourceItems[currentIndex + 1];
      const buildWritingDetailHref = (slug: string) =>
        withQuery(`#/writing/${slug}${route.page ? `/page/${route.page}` : ''}`, { tag: writingTag, keyword: effectiveKeyword });
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
      const backHref = route.page
        ? buildListPageHref('travel', route.page, { tag: travelTag, keyword: effectiveKeyword })
        : buildSectionHref('travel', { tag: travelTag, keyword: effectiveKeyword });
      const prevEntry = sourceItems[currentIndex - 1];
      const nextEntry = sourceItems[currentIndex + 1];
      const buildTravelDetailHref = (slug: string) =>
        withQuery(`#/travel/${slug}${route.page ? `/page/${route.page}` : ''}`, { tag: travelTag, keyword: effectiveKeyword });
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
          <a className="detail-back" href={buildSectionHref('writing', { tag: writingTag, keyword: effectiveKeyword })}>返回</a>
          <Writing
            config={config}
            items={pagedItems}
            listPage={page}
            activeTag={writingTag}
            availableTags={writingTags}
            tagHrefBuilder={(tag) => buildListPageHref('writing', 1, { tag, keyword: effectiveKeyword })}
            detailTag={writingTag}
          />
        </section>
        <Pagination
          type="writing"
          page={page}
          total={writingScopedItems.length}
          pageSize={pageSize}
          activeTag={writingTag}
          keyword={effectiveKeyword}
        />
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
          <a className="detail-back" href={buildSectionHref('travel', { tag: travelTag, keyword: effectiveKeyword })}>返回</a>
          <Travel
            config={config}
            items={pagedItems}
            listPage={page}
            activeTag={travelTag}
            availableTags={travelTags}
            tagHrefBuilder={(tag) => buildListPageHref('travel', 1, { tag, keyword: effectiveKeyword })}
            detailTag={travelTag}
          />
        </section>
        <Pagination type="travel" page={page} total={travelScopedItems.length} pageSize={pageSize} activeTag={travelTag} keyword={effectiveKeyword} />
      </>
    );
  }

  useEffect(() => {
    if (route || listRoute) return;
    const sectionId = parseSectionHash(hash);
    if (!sectionId) return;
    const element = document.getElementById(sectionId);
    if (!element) return;
    const behavior: ScrollBehavior = shouldInstantSectionJump(previousHashRef.current, sectionId) ? 'auto' : 'smooth';
    requestAnimationFrame(() => {
      element.scrollIntoView({ behavior, block: 'start' });
    });
  }, [hash, route, listRoute]);

  useEffect(() => {
    if (!listRoute) return;
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, [listRoute?.type, listRoute?.page]);

  useEffect(() => {
    previousHashRef.current = hash;
  }, [hash]);

  return (
    <div className="site-shell">
      <CustomCursor />
      <MouseAura />
      <div className="mesh mesh-a" />
      <div className="mesh mesh-b" />
      <div className="mesh mesh-c" />
      <Header config={config} onSearchClick={() => (window.location.hash = buildSearchHref(keywordInput))} />
      <main>
        <div key={pageTransitionKey} className={`page-transition page-transition-${pageDirection}`}>
          {detailContent ? (
            detailContent
          ) : isSearchRoute ? (
            <GlobalSearchPage
              keyword={keywordInput}
              onKeywordChange={onSearchChange}
              onBack={onSearchPageBack}
              writingItems={writingKeywordItems}
              travelItems={travelKeywordItems}
              workItems={workKeywordItems}
            />
          ) : listContent ? (
            listContent
          ) : (
            <>
              <Hero config={config} />
              <Works config={config} items={workItems.slice(0, 6)} moreHref="#/works/page/1" moreLabel="浏览全部作品" />
              <Writing
                config={config}
                items={writingKeywordItems.slice(0, 6)}
                moreHref={buildListPageHref('writing', 1, { keyword: effectiveKeyword })}
                moreLabel="浏览全部文章"
              />
              <Travel
                config={config}
                items={travelKeywordItems.slice(0, 6)}
                moreHref={buildListPageHref('travel', 1, { keyword: effectiveKeyword })}
                moreLabel="浏览全部游记"
              />
              <Photography config={config} />
              <FriendLinks config={config} />
            </>
          )}
        </div>
      </main>
      <Footer config={config} />
    </div>
  );
}

export default App;
