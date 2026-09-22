import { describe, expect, it } from "vitest";
import { escapeXml } from "@/lib/xml";

describe("escapeXml", () => {
  it("转义全部 XML 特殊字符", () => {
    expect(escapeXml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&apos;");
  });

  it("普通文本原样返回", () => {
    expect(escapeXml("普通标题 text")).toBe("普通标题 text");
  });
});
