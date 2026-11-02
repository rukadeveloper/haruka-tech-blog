import { getFromS3 } from "@/lib/s3";

// 업로드한 이미지(images/uploads/*)만 내려준다.
const KEY = /^images\/uploads\/[\w-]+\.(png|jpg|jpeg|gif|webp)$/;

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const key = (await params).key.join("/");
  if (!KEY.test(key)) return new Response("Not found", { status: 404 });

  try {
    const obj = await getFromS3(key);
    if (!obj.Body) return new Response("Not found", { status: 404 });
    return new Response(obj.Body.transformToWebStream(), {
      headers: {
        "Content-Type": obj.ContentType ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    if ((e as { name?: string }).name === "NoSuchKey") return new Response("Not found", { status: 404 });
    console.error(e);
    return new Response("Error", { status: 500 });
  }
}
