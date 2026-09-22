# luswen 博客从零学习教程

> **适合谁**：几乎没写过代码，或写过一点但没接触过 Astro / 静态博客的你。
> **学完你能**：独立写文章、改样式、新建页面、读懂项目里每一段代码、出错知道怎么查。
> **怎么用**：按章节顺序跟做；每章末尾有小练习。附录术语表可随时查阅。

参考文档（教程讲"为什么"，参考文档管"细则"）：

- [README](README.md) —— 快速开始与命令
- [内容模型](docs/content-model.md) —— 写文章的字段规范
- [架构文档](docs/architecture.md) —— 分层规则与决策记录
- [贡献指南](CONTRIBUTING.md) —— 开发流程

---

## 第 0 章 开始之前

### 0.1 环境准备（一次性）

| 需要什么 | 怎么装 | 怎么验证 |
| --- | --- | --- |
| Node.js 20+（自带 npm） | 到 nodejs.org 下载 LTS 版 | 终端输入 `node -v`，显示 v20 以上 |
| 代码编辑器 | 推荐 VS Code | 打开项目文件夹 |
| 终端 | macOS 自带「终端」，Windows 用 Git Bash | 能敲命令回车执行 |

### 0.2 五个必懂概念（小白版）

1. **静态网站 vs 动态网站**
   动态网站每次访问都由服务器现场计算；静态网站是**提前把所有页面生成好一堆 HTML 文件**，访问时直接发文件。本项目就是静态博客——`npm run build` 会生成 `dist/` 文件夹，里面全是现成网页，扔到任何静态托管服务就能上线，没有服务器要维护。

2. **npm 与依赖**
   npm 是 Node.js 的包管理器。`package.json` 是项目清单，写明用了哪些第三方库；`npm install` 就是按清单把库下载到 `node_modules/`（此目录已被 `.gitignore` 忽略，不用提交）。

3. **命令行脚本**
   `package.json` 的 `scripts` 字段是一些快捷命令。比如 `npm run dev` 实际执行的是 `astro dev`。你只需要记住 `npm run xxx` 这种形式。

4. **Markdown**
   用纯文本写文章的格式，靠符号表结构：`#` 是标题、`**字**` 是加粗、`-` 是列表。文章就存在 `src/content/posts/` 里，扩展名 `.md`。

5. **两个时间点：构建期 vs 浏览器端**
   - **构建期**：你电脑上运行 `npm run build` 的时候。排序、生成搜索索引、拼 URL 都在这时做完。
   - **浏览器端**：读者打开网页时。本项目默认只发纯 HTML，只有**主题切换、搜索、评论**三处会加载少量 JavaScript。
     理解这个区分，是读懂本项目所有设计的钥匙。

---

## 第 1 章 让项目跑起来

### 1.1 三条命令

```bash
npm install    # 首次运行：下载依赖（之后不用再跑）
npm run dev    # 启动开发服务器
# 浏览器打开 http://localhost:4321 ，看到首页即成功
# 按 Ctrl+C 停止服务器
```

### 1.2 看懂 .astro 文件

用 VS Code 打开 `src/pages/index.astro`，它分三段：

```astro
---                                  ← ① 逻辑区（普通 JS/TS，构建时运行一次）
import BaseLayout from "@/layouts/BaseLayout.astro";
const posts = await getPublishedPosts();
---
<section>...{posts.length}...</section>  ← ② 模板区（生成到 HTML 里）
<style>                               ← ③ 样式区（本项目较少用，样式在 global.css）
</style>
```

**练习 1**：把首页大标题里的「观察，思考，」改成你自己的一句话，保存，看浏览器自动刷新。

---

## 第 2 章 写你的第一篇文章

### 2.1 新建文件

在 `src/content/posts/` 新建 `my-first-post.md`，粘贴：

```markdown
---
title: 我的第一篇文章
description: 这是我学习写博客的第一篇文章，用来测试整个流程。
published: 2026-09-22
category: 随笔
tags:
  - 学习
draft: true
---

正文从这里开始。这是 **Markdown** 语法，双星号表示加粗。

## 二级标题

- 列表项一
- 列表项二
```

保存后回浏览器：首页还**看不到**它——因为 `draft: true`（草稿不进入任何公开输出）。把 `draft` 改成 `false`，它会同时出现在：首页、归档、标签页、搜索、RSS、Sitemap。

### 2.2 字段速查表

| 字段 | 必填 | 作用 | 不填会怎样 |
| --- | --- | --- | --- |
| `title` | ✅ | 文章标题 | 构建报错 |
| `description` | ✅ | 列表/SEO/RSS 里的一句话摘要（40–100 字为宜） | 构建报错 |
| `published` | ✅ | 发布日期，决定排序（新的在前） | 构建报错 |
| `category` | ✅ | 宽分类（如「工程」「随笔」） | 构建报错 |
| `tags` | ✅ | 细主题标签，至少 1 个，会聚合成标签页 | 构建报错 |
| `updated` | | 实质更新时填 | 正常 |
| `readingTime` | | 阅读时长覆盖值 | **自动按正文估算**（中文 350 字/分钟） |
| `featured` | | `true` 时首页大卡片置顶 | 默认 `false` |
| `draft` | | `true` = 草稿，完全隐身 | 默认 `false` |

这些字段由 `src/content.config.ts` 里的 **Schema**（填写规范）强制校验——**少填或格式错，构建直接失败并告诉你哪错了**。这是防错的第一道关卡。

### 2.3 文件名就是 URL

`my-first-post.md` → 网址 `/posts/my-first-post/`。所以文件名用小写英文加连字符，**发布后不要改名**（改了链接就断了）。

**练习 2**：写一篇草稿，先确认全站隐身，再发布；然后给它 `featured: true`，观察首页第一张大卡片（注意：同时只留一篇精选）。

---

## 第 3 章 项目是怎么组织的

### 3.1 目录地图

```text
src/
├── config/site.ts      # 站点信息：名字、作者、导航、评论参数（改全局信息来这里）
├── lib/                # 纯逻辑：查询、排序、分页、搜索（不碰页面和浏览器）
│   ├── posts.ts        #   只负责查询文章集合
│   ├── post-utils.ts   #   排序/分页/日期等纯函数（有测试保护）
│   └── search.ts       #   搜索索引与查询
├── components/         # 可复用积木：卡片、页头页脚、搜索框、分页、评论
├── layouts/            # 页面骨架：所有页共用的头尾（BaseLayout）、文章页骨架（PostLayout）
├── pages/              # 路由：文件即 URL（index.astro → /，rss.xml.ts → /rss.xml）
├── content/posts/      # 你的文章（第 2 章的地盘）
└── styles/global.css   # 颜色变量与排版规则
```

### 3.2 分层规则（一句话版）

```text
pages → layouts → components → lib → config
```

**只能向右依赖，不能反着来**。比如 `lib` 不许导入组件，`config` 不许导入任何本地文件。为什么？这样改任何一层都不会牵连全局——改个站点名（config），其他层只是"读取"它，完全不用动。

这不是口头约定：`scripts/check-architecture.mjs` 会在每次 `check`/`build` 时**自动扫描所有 import，违规直接构建失败**。

**练习 3**：故意在 `src/config/site.ts` 顶部加 `import PostCard from "@/components/PostCard.astro";`，跑 `npm run check`，看架构检查报错；看完把这行删掉。

### 3.3 一次访问的生命周期

```text
你写 .md → build 时校验+查询+组合 → dist/ 里一堆 HTML
                                        ↓ 发布到静态托管
读者浏览器 ← 直接收到现成 HTML（毫秒级）+ 少量按需 JS（主题/搜索/评论）
```

---

## 第 4 章 读懂核心代码（跟着数据走）

### 4.1 一篇文章如何变成网页

**第 1 步：校验**（`src/content.config.ts`）

```ts
const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    published: z.coerce.date(),
    tags: z.array(z.string()).min(1),   // ← 至少 1 个标签
    draft: z.boolean().default(false),
    // ...
  }),
});
```

> `z` 是 Zod：用来声明「数据长什么样」。`z.string()` = 必须是字符串，`min(1)` = 至少一个。

**第 2 步：查询**（`src/lib/posts.ts`，全项目唯一查询文章的地方）

```ts
export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection("posts", ({ data }) => !data.draft);  // 过滤草稿
  return sortPostsByDate(posts);                                          // 按日期倒序
}
```

**第 3 步：加工成页面**（`src/pages/posts/[...slug].astro`）

```ts
export async function getStaticPaths() {
  const posts = await getPublishedPosts();
  // 构建时为每篇文章生成一个 HTML 页面
  return posts.map((post) => ({ params: { slug: post.id }, props: { post, posts } }));
}
```

> `getStaticPaths` 是 Astro 的约定：它返回多少条，就生成多少个静态页面。`[...slug]` 是"动态路由"文件名，slug 取自文章文件名。

**第 4 步：排版输出**：文章内容塞进 `PostLayout`（标题、日期、标签、上一篇/下一篇、评论区），最终成为 `dist/posts/xxx/index.html`。

### 4.2 页面只做三件事

看 `src/pages/index.astro` 的核心：

```astro
---
const posts = await getPublishedPosts();   // ① 取数
---
<BaseLayout>
  <RecentArticles posts={posts} />          // ② 交给组件组合
</BaseLayout>
```

**取数 → 组合，完**。所有排序、分页、精选置顶的逻辑都在 `lib` 和组件里，页面从不自己算——这是全项目的纪律，页面保持薄，逻辑保持可测试。

### 4.3 组件与 Props

组件是「带参数的积木」。以 `PostCard.astro` 为例：

```astro
---
interface Props {          ← 参数声明（TypeScript）
  post: Post;
  featured?: boolean;      ← ? 表示可选
}
const { post, featured = false } = Astro.props;   ← 取出参数
---
<a href={getPostPath(post)} class="...">{post.data.title}</a>
```

使用处：`<PostCard post={post} featured={true} />`。改组件 = 所有用到它的卡片一起变。

### 4.4 样式与主题

两类写法并存：

1. **Tailwind 原子类**（模板里直接写）：`class="mt-12 border-b rule py-6"` —— 每个类干一件事，不写自定义 CSS。
2. **CSS 变量令牌**（`src/styles/global.css`）：颜色不写死，用变量：

```css
:root            { --page: #f4f3ed; --ink: #252824; --accent: #657d68; }  /* 浅色 */
:root[data-theme="dark"] { --page: #171a17; --ink: #eeeee8; --accent: #a5b9a4; }  /* 深色 */
```

**换主题 = 给 `<html>` 加一个 `data-theme="dark"` 属性，整套颜色变量瞬间全换**——这就是为什么改配色只需要改这两组变量。

主题切换的实现（`ThemeToggle.astro`）：
- 点击按钮 → 切换属性 + `localStorage.setItem("theme", ...)` 记住你的偏好
- `BaseLayout` 的 `<head>` 里有 3 行内联脚本，在页面显示前先读 localStorage —— 防止"白屏一下再变黑"的闪烁

### 4.5 SEO 集中管理

`src/components/Seo.astro` 一处生成 `<title>`、description、canonical、Open Graph（分享卡片）、JSON-LD（结构化数据）。新页面只需要：

```astro
<BaseLayout title="关于" description="..." canonicalPath="/about/">
```

SEO 属于基础设施，页面不该自己拼这些标签。

---

## 第 5 章 三大功能怎么工作

### 5.1 站内搜索（构建期 + 浏览器端各一半）

```text
构建期：posts → buildSearchIndex() → /search.json（标题+标签+摘要+正文纯文本）
浏览器：打开 /search/ → 输入时 fetch /search.json → Fuse.js 模糊匹配 → 渲染结果
```

- 相关代码：`src/lib/search.ts`（索引+查询，纯函数）、`src/pages/search.json.ts`（生成端点）、`src/components/SearchBox.astro`（界面+防抖+可访问性）
- 设计取舍：**不用任何搜索服务器/第三方服务**，纯静态也能搜，隐私零负担。文章上万篇前都够用。

### 5.2 首页分页

- `src/lib/post-utils.ts` 里 `POSTS_PER_PAGE = 6`，每页 6 篇
- 流程：`orderFeaturedFirst()`（精选置顶）→ `paginate()`（切页）→ `RecentArticles.astro` 渲染 → `Pagination.astro` 出上下页
- 第 1 页就是首页 `/`，第 2 页起是 `/page/2/`（构建时自动生成，文章不足 7 篇时不会出现这个路由）
- 归档页不分页——它按年份分组，本来就是全量视图

### 5.3 评论（giscus）

- 原理：读者的评论**存在你 GitHub 仓库的 Discussions 里**，giscus 只是个免费的展示层。没有数据库、没有服务器、没有追踪。
- 配置在 `src/config/site.ts` 的 `COMMENTS`；`enabled: false` 时页面**零输出**（不渲染任何标记和脚本）
- 读者用他们自己的 GitHub 账号登录评论，你不持有任何人的凭证
- `Comments.astro` 还负责把站点明暗主题同步给评论 iframe

### 5.4 为什么全项目 JS 这么少

架构原则：**默认生成静态 HTML，不为纯展示组件发脚本**。上一条客户端脚本前要能回答：用途是什么？失败怎么降级？隐私影响？答不出来就不加。

---

## 第 6 章 质量保障（check / test / build）

### 6.1 三道门禁

```bash
npm run check    # = 架构检查 + 类型检查 + 单元测试
npm run build    # = 先跑 check，全部通过才生成 dist/
```

| 门禁 | 工具 | 拦截什么 |
| --- | --- | --- |
| 架构检查 | `scripts/check-architecture.mjs` | 违规的跨层 import（如 config 导入组件） |
| 类型检查 | `astro check`（TypeScript） | 拼错的字段名、错误的参数类型——运行前就报错 |
| 单元测试 | Vitest（32 个） | 逻辑被改坏（排序、分页、阅读时长……） |

**任何一道挂了，`build` 都不会执行**——坏代码出不了门。

### 6.2 单元测试扫盲

测试 = 提前写好的"自动验收"。看真实例子（`src/lib/post-utils.test.ts`）：

```ts
it("越界页码收敛到有效范围", () => {
  expect(paginate(items, 99).page).toBe(3);   // 13 条数据只有 3 页，传 99 应自动收敛到 3
});
```

格式都是三段：**准备数据 → 执行函数 → `expect` 断言结果**。测试文件和被测代码放一起（`post-utils.ts` ↔ `post-utils.test.ts`），改逻辑时一眼看到要同步改测试。

跑一下：

```bash
npm test              # 全部跑一遍
npm run test:watch    # 保存文件自动重跑（开发时用）
```

**练习 4**：把任意一个 `expect(...)` 里的期望值改错，跑 `npm test` 观察失败输出（会直接指出"期望 vs 实际"），再改回来。

### 6.3 build 与 dist

`npm run build` 成功后，`dist/` 里就是完整的网站：HTML 页面、`rss.xml`、`sitemap.xml`、`search.json`、CSS、图片。本地预览生产效果：

```bash
npm run preview    # http://localhost:4321 ，看的是 dist/ 而非源码
```

---

## 第 7 章 常见修改任务（跟做）

每个任务做完都跑：`npm run check && npm run build`。

### 7.1 改站点名 / 作者 / 导航

只改 `src/config/site.ts` 的 `SITE`。全站的页头、页脚、SEO、RSS 都读它，**不要**去模板里找字改。

### 7.2 加一个导航项

```ts
navigation: [
  { label: "文章", href: "/#articles" },
  // ...
  { label: "项目", href: "/projects/" },   // ← 加这行
],
```

### 7.3 新建一个独立页面（例：/projects/）

1. 新建 `src/pages/projects.astro`，骨架抄 `src/pages/about.astro`：
   ```astro
   ---
   import BaseLayout from "@/layouts/BaseLayout.astro";
   ---
   <BaseLayout title="项目" description="我的项目列表。" canonicalPath="/projects/">
     <section class="shell py-16 md:py-24">
       <h1>项目</h1>
       ...
     </section>
   </BaseLayout>
   ```
2. 按 7.2 加入导航（可选）
3. 加入 sitemap：编辑 `src/pages/sitemap.xml.ts` 的 `staticPaths` 数组
4. 页面里**只有一个 h1**（可访问性硬规则），复用 `shell`、`eyebrow`、`rule` 这些现成样式类保持风格统一

### 7.4 改颜色

`src/styles/global.css` 顶部两组变量（浅色 `:root`、深色 `[data-theme="dark"]`），改对应变量即可全站生效。

### 7.5 调整每页文章数

`src/lib/post-utils.ts` 的 `POSTS_PER_PAGE`。

### 7.6 启用 / 更换评论

`src/config/site.ts` 的 `COMMENTS`（参数获取见 [架构文档](docs/architecture.md)「横切能力 · 评论」）。

---

## 第 8 章 遇到问题怎么办

### 8.1 报错对照表

| 现象 | 多半是 | 怎么办 |
| --- | --- | --- |
| 构建报 `z.object` / `invalid_type` | frontmatter 缺字段或格式错 | 对照 [内容模型](docs/content-model.md) 的字段表补全 |
| 「架构边界检查失败：xxx 不允许依赖 yyy」 | import 方向违反分层 | 按报错提示调整依赖方向，**别去改宽松检查规则** |
| `Cannot find module '@/xxx'` | 路径拼写错 | 用 `@/` 别名指向 `src/`，检查文件名大小写 |
| 文章 404 | 文件名拼错 / `draft: true` 没关 / 路由没重建 | 看文件名、关草稿、重启 dev |
| 搜索没结果 | 文章是草稿，或索引没更新 | 确认 `draft: false`；重建后 `/search.json` 会更新 |
| 测试失败 | 改逻辑时没同步改测试 | 读输出里的 `Expected/Received` 差异，判断谁对 |
| 样式没生效 | 类名拼错，或用了不存在的 CSS 变量 | 对照 `global.css` 里的变量名 |

### 8.2 调试三板斧

1. **读完整报错**：第一行是什么错，后面 `at xxx.astro:12` 指向哪个文件哪行——80% 的问题报错已经把答案告诉你了。
2. **分清环境**：dev（`npm run dev`，改了就刷新）还是 preview（`npm run preview`，看的是上次 build 的产物）。"dev 好了 preview 没好"= 忘了重新 build。
3. **浏览器 F12**：Console 看 JS 报错，Network 看请求了没（搜索问题看 `/search.json` 返回了什么）。

---

## 学习路线建议

| 阶段 | 内容 | 产出 |
| --- | --- | --- |
| 第 1 天 | 第 0–2 章 | 跑起项目 + 发布 2 篇文章 |
| 第 1 周 | 第 3–4 章，做 7.1/7.4 任务 | 改出自己喜欢的站名和配色 |
| 第 2 周 | 第 5–7 章，做 7.3 任务 | 新建一个独立页面并上线 |
| 之后 | 第 6 章测试 + 通读 [架构文档](docs/architecture.md) | 给下一个新功能写测试 |

推荐阅读顺序：**本教程 → 内容模型（写作时当手册查）→ 架构文档（理解每个"为什么"）→ 贡献指南（形成习惯）**。

---

## 附录 A 术语表

| 术语 | 一句话解释 |
| --- | --- |
| Astro | 本项目用的框架，特长是生成纯静态网站，按需才发 JS |
| npm / node_modules | 包管理器 / 它下载的依赖目录（不入库） |
| 静态站点 | 构建时生成现成 HTML 文件的网站，无服务器逻辑 |
| Markdown (.md) | 纯文本写文章的格式 |
| MDX (.mdx) | 能在文章里嵌组件的 Markdown 进阶版 |
| Content Collection | Astro 的内容集合：集中存放、校验、查询文章 |
| Schema | 数据填写规范（本项目用 Zod 实现），不符合就构建失败 |
| 组件 / Props | 可复用 UI 积木 / 积木的参数 |
| 布局 (Layout) | 页面公共骨架（头尾、SEO），页面内容填进 slot |
| 路由 | URL 到文件的映射；`src/pages/about.astro` → `/about/` |
| `getStaticPaths` | 构建时告诉 Astro 要生成哪些动态页面 |
| SEO | 搜索引擎优化：标题、描述、结构化数据等 |
| canonical | 规范链接，告诉搜索引擎本页正式地址，防重复收录 |
| JSON-LD | 嵌在页面里的结构化数据，给搜索引擎读懂内容 |
| RSS | 内容订阅格式，读者用阅读器追更 |
| Sitemap | 站点页面清单文件，帮搜索引擎爬全 |
| TypeScript (TS) | 带类型检查的 JavaScript，写错字段名当场报错 |
| 单元测试 | 针对最小逻辑单元的自动验收断言 |
| Vitest | 本项目用的测试运行器 |
| Fuse.js | 浏览器端模糊搜索库（本项目搜索的核心） |
| giscus | 基于 GitHub Discussions 的免费评论系统 |
| localStorage | 浏览器本地存储，本项目用它记住主题偏好 |
| hydration | 让静态 HTML 获得交互能力的过程；本项目尽量避免 |
| Tailwind CSS | 用工具类（如 `mt-4`）代替手写 CSS 的方案 |
| dist/ | 构建产物目录，整个网站的最终文件 |
| 草稿 (draft) | `draft: true` 的文章不进入任何公开输出 |

## 附录 B 命令速查

| 命令 | 作用 | 什么时候用 |
| --- | --- | --- |
| `npm install` | 安装依赖 | 首次克隆项目后 |
| `npm run dev` | 启动开发服务器（热更新） | 写文章、改代码时 |
| `npm test` | 跑全部单元测试 | 改了 `src/lib/` 逻辑后 |
| `npm run test:watch` | 监听模式自动重跑测试 | 专心改纯函数时 |
| `npm run check` | 架构 + 类型 + 测试三道检查 | 每次提交前 |
| `npm run build` | 完整检查并生成 `dist/` | 发布前 |
| `npm run preview` | 预览 `dist/` 生产产物 | build 后目视检查 |
