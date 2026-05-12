# GitHub Pages 部署说明

## 1) 仓库设置

1. 打开仓库 `Settings` → `Pages`
2. `Build and deployment` 选择 `Source: GitHub Actions`

## 2) 推送触发部署

- 将代码推送到 `main` 分支。
- 工作流 `.github/workflows/deploy-pages.yml` 会自动构建并发布 `dist/`。

## 3) 域名与路径

当前工作流按仓库地址配置为：

- `VITE_SITE_URL=https://jingluoguo.github.io/noctics`
- Vite `base=/noctics/`

如果你改仓库名或改成用户主页仓库（`jingluoguo.github.io`），需要同步改：

- `vite.config.ts` 的 `base` 条件值
- `deploy-pages.yml` 里的 `VITE_SITE_URL`

## 4) 内容更新流程

后续你只需要：

1. 新增或修改 `src/content/**` 下内容
2. `git push`

其余（`rss.xml`、`sitemap.xml`、静态站发布）自动完成。
