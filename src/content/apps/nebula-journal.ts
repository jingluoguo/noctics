import type { WorkItem } from '../../site.config';

const app: WorkItem = {
  name: 'Nebula Journal',
  desc: '关系与事件管理应用，强调信息密度与情绪化表达。',
  stack: 'Flutter · GetX · SQLite',
  updatedAt: '2026-04-20',
  logo: '/app-logos/nebula-journal.svg',
  website: 'https://example.com/nebula-journal',
  platforms: [
    { name: 'iOS 下载', url: 'https://apps.apple.com/' },
    { name: 'Android 下载', url: 'https://play.google.com/store' }
  ]
};

export default app;
