import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const env = (name: string) => {
  const v = process.env[name];
  if (!v) throw new Error(`${name} 환경변수가 설정되지 않았습니다.`);
  return v;
};

let client: S3Client | undefined;
const s3 = () =>
  (client ??= new S3Client({
    region: env("AWS_REGION"),
    credentials: { accessKeyId: env("AWS_ACCESS_KEY_ID"), secretAccessKey: env("AWS_SECRET_ACCESS_KEY") },
  }));

/** 버킷은 비공개로 두고 /media/<key> 로 서버가 대신 내려준다. */
export const mediaUrl = (key: string) => `/media/${key}`;

export async function uploadToS3(key: string, body: Buffer, contentType: string): Promise<void> {
  await s3().send(
    new PutObjectCommand({
      Bucket: env("AWS_S3_BUCKET"),
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

export async function getFromS3(key: string) {
  return s3().send(new GetObjectCommand({ Bucket: env("AWS_S3_BUCKET"), Key: key }));
}
