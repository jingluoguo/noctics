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
  cover?: string;
  date?: string;
  updatedAt?: string;
  tags?: string[];
};

export type PhotoItem = {
  title: string;
  image?: string;
  tone: 'cool' | 'warm' | 'violet' | 'blue' | 'teal' | 'ice';
  h: 'tall' | 'mid' | 'short';
};

export type WritingArticle = {
  title: string;
  markdown: string;
  summary?: string;
  cover?: string;
  category?: string;
  updatedAt?: string;
  tags?: string[];
};

export type FriendLinkItem = {
  name: string;
  url: string;
  desc?: string;
  avatar?: string;
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
      coverAspectRatio?: string;
      items: WritingArticle[];
    };
    travel: {
      id: string;
      title: string;
      coverAspectRatio?: string;
      items: TravelItem[];
    };
    photography: {
      id: string;
      title: string;
      items: PhotoItem[];
    };
    links: {
      id: string;
      title: string;
      items: FriendLinkItem[];
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
      coverAspectRatio: '16 / 9',
      items: [] as WritingArticle[]
    },
    travel: {
      id: 'travel',
      title: '个人游记',
      coverAspectRatio: '16 / 9',
      items: [] as TravelItem[]
    },
    photography: {
      id: 'photo',
      title: '摄影作品',
      items: [] as PhotoItem[]
    },
    links: {
      id: 'links',
      title: '友情链接',
      items: [
        {
          name: 'OpenAI',
          url: 'https://openai.com/',
          desc: 'AI 技术与产品前沿',
          avatar: 'https://openai.com/favicon.ico'
        },
        {
          name: 'Vite',
          url: 'https://vite.dev/',
          desc: '现代前端构建工具',
          avatar: 'https://vite.dev/logo.svg'
        }
      ] as FriendLinkItem[]
    }
  },
  footer: {
    rightText: 'Build quietly, ship beautifully.'
  }
};
