# 内容模型与写作规范

## 文章位置

文章位于 `src/content/posts/`，支持 `.md` 与 `.mdx`。

## Frontmatter

```yaml
---
title: 文章标题
description: 用于列表、SEO 和 RSS 的一句话摘要
published: 2026-09-20
updated: 2026-09-21        # 可选
category: 工程
tags:
  - Astro
  - 前端工程
readingTime: 6 分钟阅读
featured: false            # 可选，默认 false
draft: false               # 可选，默认 false
---
```

约束：

- `title` 应准确描述文章，而不是只追求点击。
- `description` 应能脱离正文独立成立，建议 40–100 个汉字。
- `published` 使用 `YYYY-MM-DD`。
- 内容发生实质变化时填写 `updated`；仅修正错别字不必更新。
- 每篇文章至少有一个 `tag`。
- `category` 是宽分类，`tags` 是具体主题。
- 同一时间只保留少量精选文章；当前首页优先展示最新的 `featured: true` 文章。
- `draft: true` 的文章不会进入任何公开输出。

## 文件名与 URL

文件名使用小写英文和连字符，例如：

```text
designing-for-attention.mdx
```

对应 URL：

```text
/posts/designing-for-attention/
```

发布后不要随意修改文件名。确需修改时，应同步配置重定向后再发布。

## Markdown 与 MDX

- 普通文章优先使用 Markdown。
- 只有需要嵌入受控组件时才使用 MDX。
- MDX 只能导入 `src/components/` 中专为内容设计的组件。
- 不在文章中放数据查询、全局配置修改或浏览器副作用。

## 图片

- 静态图片放在 `public/` 的语义化目录中。
- 写明 `alt`；纯装饰图使用空 `alt`。
- 避免上传未经压缩的原图。
- 不热链不稳定或无使用权的外部图片。

## 发布检查

```bash
npm run check
npm run build
```

然后检查文章标题层级、代码块横向滚动、移动端宽度、标签链接、上一篇/下一篇以及 RSS 输出。
