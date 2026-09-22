# luswen 架构与工程约束

## 1. 目标

本项目是一个内容优先、静态输出的个人博客。架构优先保证：

1. 内容不绑定页面实现，可长期迁移。
2. 站点级信息有单一数据源。
3. 依赖始终单向，避免循环与隐式耦合。
4. 页面默认无客户端运行时，只有明确的交互才发送脚本。
5. SEO、可访问性和订阅能力属于基础设施，不由单篇文章重复实现。
6. 质量由自动门禁（架构检查、类型检查、单元测试）守住，不依赖个人记忆。

## 2. 目录与职责

```text
src/
├── config/       # 站点级常量；不依赖其他本地层
├── lib/          # 内容查询与纯逻辑；只依赖 config
├── components/   # 小型展示组件；依赖 config、lib
├── layouts/      # 页面骨架与横切能力；依赖 components、config、lib
├── pages/        # 路由入口与页面组合；依赖以上各层
├── content/      # Markdown/MDX 内容；仅在必要时引用展示组件
└── styles/       # 全局设计令牌与排版规则
```

自动检查脚本位于 `scripts/check-architecture.mjs`，在 `npm run check` 和 `npm run build` 中执行。

单元测试使用 Vitest，与被测模块同目录（`src/**/*.test.ts`），只覆盖 `src/lib/` 中不依赖 `astro:content` 的纯函数；由 `npm run test` 执行，并包含在 `npm run check` 中。

## 3. 允许的依赖方向

```text
pages → layouts → components → lib → config
  └──────────────→ components / lib / config
content ─────────→ components（仅 MDX 展示组件）
```

硬性约束：

- `config` 不依赖任何本地模块。
- `lib` 不依赖组件、布局或页面，也不访问 DOM；可使用第三方纯函数库（如 Fuse.js）。
- `components` 不导入页面或布局。
- `layouts` 不导入页面。
- `pages` 负责路由数据装配，不沉淀可复用业务逻辑。
- `content` 不导入页面、布局或查询逻辑。
- 跨层导入使用 `@/` 别名；同层紧邻文件可以使用相对路径。

## 4. 数据流

```text
Markdown / MDX
      ↓ schema 校验
Content Collection
      ↓ src/lib/posts.ts（查询）+ post-utils.ts（纯函数）
页面路由
      ↓
布局 + 展示组件
      ↓
静态 HTML / XML / CSS
```

- 内容结构由 `src/content.config.ts` 定义。
- `src/lib/posts.ts` 只做内容查询（`lib` 层唯一在运行时使用 `astro:content` 的模块）；排序、分页、标签聚合、相邻文章和阅读时长等纯函数在 `src/lib/post-utils.ts`，两者对外统一从 `@/lib/posts` 导入。
- 页面不得直接复制排序、过滤、分页或 URL 拼装规则。
- HTML 页面、RSS、Sitemap 与 `/search.json` 共享同一内容查询层，避免结果不一致。

## 5. 横切能力

### SEO

`Seo.astro` 统一生成标题、描述、Canonical、Open Graph、X Card 和 JSON-LD。文章页面通过 `PostLayout.astro` 传入文章时间、分类和标签。

### 主题

颜色通过 `src/styles/global.css` 的 CSS 自定义属性管理。主题切换只保存设备级偏好到 `localStorage`，不引入服务端状态。

### 导航

主导航定义在 `src/config/site.ts`。Header 和 Footer 消费同一站点配置或稳定路由，不在多个页面复制品牌文字。

### 搜索

- 构建期由 `src/pages/search.json.ts` 调用 `buildSearchIndex()` 生成 `/search.json` 索引（标题、标签、摘要、正文纯文本）。
- `/search/` 页面通过 `SearchBox.astro` 在浏览器端加载索引并用 Fuse.js 查询；脚本限制在组件内部，无服务端依赖。
- 索引构建与查询工厂位于 `src/lib/search.ts`，均为纯函数，可单测。

### 评论

- 采用 giscus（基于 GitHub Discussions），供应商参数集中在 `src/config/site.ts` 的 `COMMENTS`。
- 未填写 `enabled: true` 与 repo 参数时，页面不渲染任何评论相关标记，也不加载第三方脚本。
- 启用方式：在 [giscus.app](https://giscus.app) 填入仓库生成 `repo`、`repoId`、`category`、`categoryId`，写入 `COMMENTS` 后重新构建。
- `Comments.astro` 负责注入脚本并把站点明暗主题同步给 giscus iframe；评论以 pathname 映射到对应文章。

### 机器可读输出

- `/rss.xml`：文章订阅。
- `/sitemap.xml`：固定页面、分页页、文章和标签页。
- `/search.json`：站内搜索索引，构建期生成，仅由 `/search/` 消费。
- `/robots.txt`：搜索引擎抓取策略和 Sitemap 位置。

## 6. 内容边界

- 文章使用 Markdown；只有确实需要组件时才使用 MDX。
- 文章不得读取运行时环境变量、文件系统或站点私有配置。
- Frontmatter 必须通过 Schema；未知的临时字段不得直接进入页面。
- `draft: true` 的内容不得出现在页面、RSS 或 Sitemap。
- URL 由文件名和集中式 helper 生成，不在文章正文硬编码站内绝对地址。

## 7. 可访问性约束

- 正文默认字号不低于 16px；常用标签不低于 14px，辅助元数据不低于 12px。
- 所有交互必须可由键盘触发并具有可见焦点。
- 页面必须只有一个主标题，并使用语义化 landmark。
- 装饰图使用空替代文本；承载信息的图片必须提供准确描述。
- 动画必须尊重 `prefers-reduced-motion`。
- 颜色不能成为传递状态的唯一方式。

## 8. 性能与客户端脚本

- 默认生成静态 HTML。
- 不为纯展示组件启用客户端 hydration。
- 客户端脚本仅用于主题切换、站内搜索、评论主题同步等明确交互，且限制在对应组件内部。
- 新增第三方脚本前必须说明用途、隐私影响、失败降级和加载策略。
- 图片应声明尺寸，避免布局偏移；大图进入项目前应评估格式和体积。

## 9. 扩展方式

### 新增站点级信息

先扩展 `src/config/site.ts`，再由组件消费；不要直接散落到页面。

### 新增内容派生能力

例如分类统计、系列文章或相关推荐，应先在 `src/lib/post-utils.ts`（或 `lib/` 下同层新模块）添加可单测的纯函数，再由页面调用；确需访问 Content Collection 的查询函数放 `src/lib/posts.ts`，并为新纯函数补测试。

### 新增页面

页面只做三件事：读取路由参数、调用 `lib` 获取数据、组合布局和组件。复杂展示先拆成组件。

### 新增交互

优先使用原生 HTML。只有原生语义无法满足时才增加客户端状态，并将脚本限制在对应组件内部。

## 10. 质量门禁

每次发布前必须满足：

1. `npm run check` 通过（架构边界、`astro check`、单元测试三道门禁）。
2. `npm run build` 成功生成所有 HTML 与 XML 路由。
3. `npm run preview` 下关键路由可访问：首页（含分页）、至少一篇文章、404、搜索、RSS、Sitemap 和 robots.txt。
4. 桌面端和移动端没有横向溢出、遮挡或不可达导航。
5. Git 工作区只包含本次任务相关变更。

## 11. 决策记录

- 采用静态输出：博客内容更新频率低，静态文件更快、更易部署，也减少运行时故障面。
- 不引入 CMS：内容保留在仓库内，版本历史清晰；以后需要多人协作时可在内容边界替换数据源。
- 不引入搜索服务：站内搜索采用构建期 JSON 索引 + Fuse.js（`src/lib/search.ts`），零外部服务、零服务端；若未来文章规模显著增长，可替换为 Pagefind 而不影响内容边界。
- 评论选用 giscus：数据存放在自有 GitHub 仓库的 Discussions 中，无广告、无追踪脚本，与隐私优先的立场一致；供应商参数集中在 `COMMENTS` 配置，替换供应商时只改 `Comments.astro` 与其配置。
