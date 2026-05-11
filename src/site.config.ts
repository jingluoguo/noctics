export type NavItem = {
  label: string;
  href: string;
};

export type WorkItem = {
  name: string;
  desc: string;
  stack: string;
  updatedAt?: string;
  website?: string;
  logo?: string;
  platforms?: {
    name: string;
    url: string;
  }[];
};

export type TravelItem = {
  city: string;
  note: string;
  summary?: string;
  markdown?: string;
  date?: string;
  updatedAt?: string;
  tags?: string[];
};

export type PhotoItem = {
  title: string;
  tone: 'cool' | 'warm' | 'violet' | 'blue' | 'teal' | 'ice';
  h: 'tall' | 'mid' | 'short';
};

export type WritingArticle = {
  title: string;
  markdown: string;
  summary?: string;
  category?: string;
  updatedAt?: string;
  tags?: string[];
};

export type SiteConfig = {
  brand: {
    name: string;
  };
  seo: {
    title: string;
    icon: string;
  };
  nav: NavItem[];
  hero: {
    id: string;
    profile?: {
      avatar: string;
      nickname: string;
      headline?: string;
      intro?: string;
      socials: {
        label: string;
        icon: string;
        url: string;
      }[];
    };
    primaryAction: {
      label: string;
      href: string;
    };
    showSculpture: boolean;
  };
  sections: {
    works: {
      id: string;
      title: string;
      items: WorkItem[];
    };
    writing: {
      id: string;
      title: string;
      ctaLabel: string;
      items: WritingArticle[];
    };
    travel: {
      id: string;
      title: string;
      items: TravelItem[];
    };
    photography: {
      id: string;
      title: string;
      items: PhotoItem[];
    };
  };
  footer: {
    rightText: string;
  };
};

export const siteConfig: SiteConfig = {
  brand: {
    name: 'DonGuo'
  },
  seo: {
    title: 'DonGuo | Mobile Engineer',
    icon: '/favicon.ico'
  },
  nav: [
    { label: '文章', href: '#writing' },
    { label: '作品', href: '#works' },
    { label: '游记', href: '#travel' },
    { label: '摄影', href: '#photo' }
  ] as NavItem[],
  hero: {
    id: 'top',
    profile: {
      avatar: '/favicon.ico',
      nickname: 'DonGuo',
      headline: 'Mobile Engineer · Writer · Visual Storyteller',
      intro: '移动端工程师，关注体验与叙事。',
      socials: [
        { label: 'GitHub', icon: '🐙', url: 'https://github.com/' },
        { label: 'X', icon: '𝕏', url: 'https://x.com/' },
        { label: '掘金', icon: '掘', url: 'https://juejin.cn/' }
      ]
    },
    primaryAction: {
      label: '查看作品',
      href: '#works'
    },
    showSculpture: true
  },
  sections: {
    works: {
      id: 'works',
      title: 'App 作品',
      items: [
        { name: 'Nebula Journal', desc: '关系与事件管理应用，强调信息密度与情绪化表达。', stack: 'Flutter · GetX · SQLite' },
        { name: 'Orbit Focus', desc: '轻量习惯追踪与复盘工具，关注反馈速度与动效细节。', stack: 'Flutter · Dart · Riverpod' }
      ] as WorkItem[]
    },
    writing: {
      id: 'writing',
      title: '技术文章',
      ctaLabel: '阅读',
      items: [
        {
          title: 'Flutter 中复杂表单与状态管理实践',
          updatedAt: '2026-04-20',
          markdown: `在复杂表单里，我更倾向于把**输入、校验、提交**拆成三个层次。\n\n- 输入层只负责收集状态\n- 校验层只负责规则\n- 提交层只负责副作用\n\n这样表单会更稳定，也更容易复用。`
        },
        {
          title: '从 0 到 1 设计高质量移动端信息架构',
          updatedAt: '2026-04-12',
          markdown: `好的信息架构不是“把内容都放进去”，而是让用户**一眼知道重点在哪里**。\n\n> 少即是多，但不能少到失真。\n\n我会优先保留最关键的层级，再慢慢补充细节。`
        }
      ] as WritingArticle[]
    },
    travel: {
      id: 'travel',
      title: '个人游记',
      items: [
        { city: 'Kyoto', note: '在雨夜里拍下安静街道，重新理解“留白”。', updatedAt: '2026-04-08' },
        { city: 'Istanbul', note: '晨光与海风之间，记录城市的多重纹理。', updatedAt: '2026-03-17' }
      ] as TravelItem[]
    },
    photography: {
      id: 'photo',
      title: '摄影作品',
      items: [
        { title: 'Dawn Geometry', tone: 'cool', h: 'tall' },
        { title: 'Fog & Steel', tone: 'warm', h: 'mid' },
        { title: 'Night Passage', tone: 'violet', h: 'short' },
        { title: 'Quiet Frame', tone: 'blue', h: 'tall' },
        { title: 'Silent Coast', tone: 'teal', h: 'mid' },
        { title: 'City Pulse', tone: 'ice', h: 'short' }
      ] as PhotoItem[]
    }
  },
  footer: {
    rightText: 'Build quietly, ship beautifully.'
  }
};
