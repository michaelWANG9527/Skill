import fs from "fs";
import path from "path";
import { Readable } from "stream";

// 文件存储抽象层 — 通过 STORAGE_DRIVER 环境变量切换：
// - local（默认）：存储到本地 ./storage 目录，零依赖，开箱即用
// - minio：存储到 MinIO/S3 兼容对象存储（生产环境，可无缝迁移阿里云 OSS）

const DRIVER = process.env.STORAGE_DRIVER || "local";

const LOCAL_ROOT = path.resolve(
  process.cwd(),
  process.env.LOCAL_STORAGE_PATH || "./storage"
);

// ---------- 本地文件系统驱动 ----------

function localPath(key: string): string {
  // 防止路径穿越：key 只允许字母数字、斜杠、点、横线、下划线
  const safe = key.replace(/[^a-zA-Z0-9/._-]/g, "_");
  const full = path.resolve(LOCAL_ROOT, safe);
  if (!full.startsWith(LOCAL_ROOT)) {
    throw new Error("非法存储路径");
  }
  return full;
}

async function localUpload(key: string, buffer: Buffer): Promise<void> {
  const full = localPath(key);
  await fs.promises.mkdir(path.dirname(full), { recursive: true });
  await fs.promises.writeFile(full, buffer);
}

async function localGetStream(key: string): Promise<Readable> {
  const full = localPath(key);
  await fs.promises.access(full, fs.constants.R_OK);
  return fs.createReadStream(full);
}

async function localDelete(key: string): Promise<void> {
  const full = localPath(key);
  await fs.promises.unlink(full).catch(() => {
    // 文件不存在时静默忽略
  });
}

// ---------- 统一对外接口 ----------

export async function uploadFile(
  key: string,
  buffer: Buffer,
  mimeType: string,
  size: number
): Promise<void> {
  if (DRIVER === "minio") {
    const minio = await import("./minio");
    return minio.uploadFile(key, buffer, mimeType, size);
  }
  return localUpload(key, buffer);
}

export async function getFileStream(key: string): Promise<Readable> {
  if (DRIVER === "minio") {
    const minio = await import("./minio");
    return (await minio.getFileStream(key)) as Readable;
  }
  return localGetStream(key);
}

export async function deleteFile(key: string): Promise<void> {
  if (DRIVER === "minio") {
    const minio = await import("./minio");
    return minio.deleteFile(key);
  }
  return localDelete(key);
}

export function getStorageDriver(): string {
  return DRIVER;
}
