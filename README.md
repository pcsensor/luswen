# 边界笔记

基于 Astro、Tailwind CSS 4、Content Collections 和 MDX 的个人博客骨架。

## 本地开发

```bash
npm install
npm run dev
```

## 写文章

在 `src/content/posts/` 中新增 `.md` 或 `.mdx` 文件。文章元数据由 `src/content.config.ts` 校验；需要嵌入组件时使用 MDX。

## 构建

```bash
npm run build
```

静态站点输出到 `dist/`。
