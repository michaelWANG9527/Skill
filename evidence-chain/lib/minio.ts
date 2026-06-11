import * as Minio from "minio";

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "localhost",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin123",
});

const BUCKET = process.env.MINIO_BUCKET || "evidence-docs";

// 确保 bucket 存在
export async function ensureBucket(): Promise<void> {
  const exists = await minioClient.bucketExists(BUCKET);
  if (!exists) {
    await minioClient.makeBucket(BUCKET, "us-east-1");
    // 设置 bucket 策略：只允许内部访问，不公开
    await minioClient.setBucketPolicy(
      BUCKET,
      JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Deny",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${BUCKET}/*`],
            Condition: {
              StringNotEquals: {
                "aws:SourceVpc": ["internal"],
              },
            },
          },
        ],
      })
    );
  }
}

// 上传文件
export async function uploadFile(
  key: string,
  buffer: Buffer,
  mimeType: string,
  size: number
): Promise<void> {
  await ensureBucket();
  await minioClient.putObject(BUCKET, key, buffer, size, {
    "Content-Type": mimeType,
  });
}

// 生成预签名下载 URL（有效期 15 分钟）
export async function getPresignedUrl(
  key: string,
  expiry = 900
): Promise<string> {
  return minioClient.presignedGetObject(BUCKET, key, expiry);
}

// 删除文件
export async function deleteFile(key: string): Promise<void> {
  await minioClient.removeObject(BUCKET, key);
}

// 获取文件流（用于服务端代理下载）
export async function getFileStream(key: string) {
  return minioClient.getObject(BUCKET, key);
}

export { minioClient, BUCKET };
