export const SITE = {
  name: "luswen",
  initials: "LW",
  description: "Justin 关于设计、工程与数字生活的独立笔记。",
  locale: "zh-CN",
  author: {
    name: "Justin",
  },
  navigation: [
    { label: "文章", href: "/#articles" },
    { label: "归档", href: "/archive/" },
    { label: "标签", href: "/tags/" },
    { label: "搜索", href: "/search/" },
    { label: "关于", href: "/about/" },
  ],
} as const;

export type SiteConfig = typeof SITE;

/**
 * 评论配置（giscus，基于 GitHub Discussions）。
 * 填入参数获取方式见 docs/architecture.md「横切能力 · 评论」。
 */
export const COMMENTS = {
  enabled: false,
  /** 例如 "justin/luswen" */
  repo: "",
  repoId: "",
  category: "Announcements",
  categoryId: "",
};
