import type { WorkItem } from '../../site.config';

const app: WorkItem = {
  name: 'Orbit Focus',
  desc: '轻量习惯追踪与复盘工具，关注反馈速度与动效细节。',
  stack: 'Flutter · Dart · Riverpod',
  logo: '/app-logos/orbit-focus.svg',
  website: 'https://example.com/orbit-focus',
  platforms: [
    { name: 'TestFlight', url: 'https://testflight.apple.com/' },
    { name: '官网下载', url: 'https://example.com/orbit-focus/download' }
  ]
};

export default app;
