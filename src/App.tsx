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
import { getTravelItems, getWritingItems } from './lib/content';
import { DetailPage } from './sections/DetailPage';

function parseHash(hash: string) {
  const match = hash.match(/^#\/(writing|travel)\/([^/]+)$/);
  if (!match) return null;
  return { type: match[1] as 'writing' | 'travel', slug: decodeURIComponent(match[2]) };
}

function parseSectionHash(hash: string) {
  const match = hash.match(/^#([a-zA-Z0-9_-]+)$/);
  if (!match) return null;
  return match[1];
}

function App() {
  const config = useSiteConfig();
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const route = useMemo(() => parseHash(hash), [hash]);
  const writingItems = useMemo(() => getWritingItems(), []);
  const travelItems = useMemo(() => getTravelItems(), []);

  let detailContent: ReactNode = null;
  if (route?.type === 'writing') {
    const item = writingItems.find((entry) => entry.slug === route.slug);
    if (item) {
      const meta = [item.category, ...item.tags.map((tag) => `#${tag}`)].filter(Boolean) as string[];
      detailContent = (
        <DetailPage
          title={item.title}
          markdown={item.markdown}
          backHref="#writing"
          backLabel="返回文章列表"
          meta={meta}
        />
      );
    }
  }
  if (route?.type === 'travel') {
    const item = travelItems.find((entry) => entry.slug === route.slug);
    if (item) {
      const meta = [item.date, ...item.tags.map((tag) => `#${tag}`)].filter(Boolean) as string[];
      detailContent = (
        <DetailPage
          title={item.city}
          markdown={item.markdown}
          backHref="#travel"
          backLabel="返回游记列表"
          meta={meta}
        />
      );
    }
  }

  useEffect(() => {
    if (route) return;
    const sectionId = parseSectionHash(hash);
    if (!sectionId) return;
    const element = document.getElementById(sectionId);
    if (!element) return;
    requestAnimationFrame(() => {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [hash, route]);

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
        ) : (
          <>
            <Hero config={config} />
            <Works config={config} />
            <Writing config={config} />
            <Travel config={config} />
            <Photography config={config} />
          </>
        )}
      </main>
      <Footer config={config} />
    </div>
  );
}

export default App;
