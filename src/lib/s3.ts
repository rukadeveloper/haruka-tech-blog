import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const env = (name: string) => {
  const v = process.env[name];
  if (!v) throw new Error(`${name} 환경변수가 설정되지 않았습니다.`);
  return v;
};

let client: S3Client | undefined;

/** S3 에 파일을 올리고 브라우저용 주소를 돌려준다. */
export async function uploadToS3(key: string, body: Buffer, contentType: string): Promise<string> {
  const bucket = env("AWS_S3_BUCKET");
  const region = env("AWS_REGION");
  client ??= new S3Client({
    region,
    credentials: { accessKeyId: env("AWS_ACCESS_KEY_ID"), secretAccessKey: env("AWS_SECRET_ACCESS_KEY") },
  });
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  // CloudFront 등 커스텀 도메인을 쓰면 AWS_S3_PUBLIC_URL 로 지정
  const base = (process.env.AWS_S3_PUBLIC_URL ?? `https://${bucket}.s3.${region}.amazonaws.com`).replace(/\/$/, "");
  return `${base}/${key}`;
}
