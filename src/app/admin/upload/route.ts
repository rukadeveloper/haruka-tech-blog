import fs from "node:fs";
import path from "node:path";
import { isAdmin } from "@/lib/auth";

const ALLOWED = new Set(["png", "jpg", "jpeg", "gif", "webp"]);
const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await isAdmin())) return Response.json({ error: "unauthorized" }, { status: 401 });

  const file = (await request.formData()).get("file");
  if (!(file instanceof File)) return Response.json({ error: "파일이 없습니다." }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED.has(ext)) return Response.json({ error: "이미지 파일만 업로드할 수 있습니다." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "10MB 이하만 업로드할 수 있습니다." }, { status: 400 });

  const dir = path.join(process.cwd(), "public", "images", "uploads");
  fs.mkdirSync(dir, { recursive: true });
  const name = `${Date.now()}.${ext}`;
  fs.writeFileSync(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return Response.json({ url: `/images/uploads/${name}` });
}
