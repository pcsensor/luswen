# luswen

Justin 的个人博客。内容优先、静态输出，基于 Astro、Tailwind CSS、Content Collections 和 MDX。

## 特性

- **静态输出**：构建产出纯 HTML/XML，无服务端运行时
- **内容驱动**：Markdown/MDX + Zod Schema 校验，`draft` 草稿不进入任何公开输出
- **SEO 与订阅**：Canonical、Open Graph、JSON-LD、RSS、Sitemap、robots.txt
- **站内搜索**：构建期 JSON 索引 + Fuse.js，零第三方搜索服务
- **发现路径**：标签、归档、首页分页
- **主题切换**：明暗模式，偏好仅存于本地
- **评论**：giscus（默认关闭，填参数即可启用）
- **工程保障**：架构边界检查 + 类型检查 + 单元测试，全部挂在 `build` 之前

## 快速开始

前置要求：Node.js 20+ 与 npm。

```bash
npm install
npm run dev        # http://localhost:4321
```

## 常用命令

```bash
npm run dev        # 本地开发服务器
npm test           # 单元测试（Vitest）
npm run check      # 架构边界 + Astro 类型检查 + 单元测试
npm run build      # 完整检查并生成静态站点（输出到 dist/）
npm run preview    # 预览生产构建
```

## 目录结构

```text
src/
├── config/        # 站点常量与评论配置
├── lib/           # 内容查询（posts.ts）与纯函数（post-utils.ts、search.ts 等）
├── components/    # 展示组件（搜索、评论、分页、卡片等）
├── layouts/       # 页面骨架与横切能力（SEO、文章布局）
├── pages/         # 路由与构建期端点（RSS、Sitemap、search.json）
├── content/posts/ # 文章
└── styles/        # 设计令牌与排版规则
```

## 写文章

在 `src/content/posts/` 中新增 `.md` 或 `.mdx` 文件。元数据字段、写作约定和发布流程见 [内容模型](docs/content-model.md)。

## 常用配置

| 要改什么 | 改哪里 |
| --- | --- |
| 站点名称、作者、导航 | `src/config/site.ts` 的 `SITE` |
| 启用/配置评论 | `src/config/site.ts` 的 `COMMENTS`（见 [架构文档](docs/architecture.md)「横切能力 · 评论」） |
| 部署域名 | `astro.config.mjs` 的 `site`（影响 canonical、RSS、Sitemap） |
| 每页文章数 | `src/lib/post-utils.ts` 的 `POSTS_PER_PAGE` |

## 文档

- [从零学习教程](TUTORIAL.md) —— 面向新手：跑起来、写文章、读懂代码、常见任务
- [架构与工程约束](docs/architecture.md) —— 分层规则、横切能力、质量门禁、决策记录
- [内容模型与写作规范](docs/content-model.md) —— frontmatter、URL、发布检查
- [贡献指南](CONTRIBUTING.md) —— 开发流程与提交前检查
