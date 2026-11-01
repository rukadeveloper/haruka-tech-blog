import { isAdmin } from "@/lib/auth";
import { commitContent, publicFileUrl } from "@/lib/content-store";

const ALLOWED = new Set(["png", "jpg", "jpeg", "gif", "webp"]);
const MAX_BYTES = 4 * 1024 * 1024; // Vercel 함수의 요청 본문 한도(4.5MB)보다 작게

export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "unauthorized" }, { status: 401 });

  const file = (await request.formData()).get("file");
  if (!(file instanceof File)) return Response.json({ error: "파일이 없습니다." }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED.has(ext)) return Response.json({ error: "이미지 파일만 업로드할 수 있습니다." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "4MB 이하만 업로드할 수 있습니다." }, { status: 400 });

  const name = `${Date.now()}.${ext}`;
  const target = `public/images/uploads/${name}`;
  try {
    await commitContent({
      message: `Upload image ${name}`,
      put: { [target]: Buffer.from(await file.arrayBuffer()) },
      deploy: false,
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "업로드에 실패했습니다." }, { status: 500 });
  }
  return Response.json({ url: publicFileUrl(target) });
}
