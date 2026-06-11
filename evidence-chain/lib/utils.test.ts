import { describe, it, expect } from "vitest";
import {
  calculateSHA256,
  formatFileSize,
  generateStorageKey,
  BIZ_TYPES,
  BIZ_TYPE_LABELS,
  ROLES,
  ROLE_LABELS,
} from "./utils";

describe("calculateSHA256（防篡改哈希）", () => {
  it("空内容哈希应为已知标准值", () => {
    expect(calculateSHA256(Buffer.from(""))).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    );
  });

  it("相同内容哈希一致、不同内容哈希不同", () => {
    const a = calculateSHA256(Buffer.from("合同文本 v1"));
    const b = calculateSHA256(Buffer.from("合同文本 v1"));
    const c = calculateSHA256(Buffer.from("合同文本 v2"));
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("formatFileSize", () => {
  it("格式化常见大小", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(1048576)).toBe("1 MB");
    expect(formatFileSize(52428800)).toBe("50 MB");
  });
});

describe("generateStorageKey", () => {
  it("生成的 key 含业务前缀且保留扩展名", () => {
    const key = generateStorageKey("SALES", "采购订单.pdf");
    expect(key.startsWith("SALES/")).toBe(true);
    expect(key.endsWith(".pdf")).toBe(true);
  });

  it("多次生成不重复", () => {
    const keys = new Set(
      Array.from({ length: 50 }, () => generateStorageKey("ORDER", "a.pdf"))
    );
    expect(keys.size).toBe(50);
  });
});

describe("业务常量完整性", () => {
  it("每个业务类型都有中文名", () => {
    for (const t of BIZ_TYPES) {
      expect(BIZ_TYPE_LABELS[t]).toBeTruthy();
    }
  });

  it("每个角色都有中文名", () => {
    for (const r of ROLES) {
      expect(ROLE_LABELS[r]).toBeTruthy();
    }
  });
});
