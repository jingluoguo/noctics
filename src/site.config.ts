export type NavItem = {
  label: string;
  href: string;
};

export type WorkItem = {
  name: string;
  desc: string;
  stack: string;
};

export type TravelItem = {
  city: string;
  note: string;
};

export type PhotoItem = {
  title: string;
  tone: 'cool' | 'warm' | 'violet' | 'blue' | 'teal' | 'ice';
  h: 'tall' | 'mid' | 'short';
};

export const siteConfig = {
  brand: {
    name: 'Jingluo'
  },
  nav: [
    { label: '文章', href: '#writing' },
    { label: '作品', href: '#works' },
    { label: '游记', href: '#travel' },
    { label: '摄影', href: '#photo' }
  ] as NavItem[],
  hero: {
    id: 'top',
    eyebrow: 'MOBILE ENGINEER · WRITER · VISUAL STORYTELLER',
    title: '把复杂留给自己，把体验留给用户。',
    subtitle: '技术文章、作品、游记与摄影的精选归档。',
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
        'Flutter 中复杂表单与状态管理实践',
        '从 0 到 1 设计高质量移动端信息架构'
      ]
    },
    travel: {
      id: 'travel',
      title: '个人游记',
      items: [
        { city: 'Kyoto', note: '在雨夜里拍下安静街道，重新理解“留白”。' },
        { city: 'Istanbul', note: '晨光与海风之间，记录城市的多重纹理。' }
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
} as const;
