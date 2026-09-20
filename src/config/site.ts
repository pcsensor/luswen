export const SITE = {
  name: "luswen",
  description: "Justin 关于设计、工程与数字生活的独立笔记。",
  locale: "zh-CN",
  author: {
    name: "Justin",
  },
  navigation: [
    { label: "文章", href: "/#articles" },
    { label: "归档", href: "/archive/" },
    { label: "标签", href: "/tags/" },
    { label: "关于", href: "/about/" },
  ],
} as const;

export type SiteConfig = typeof SITE;
