import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const files = form.getAll("files");
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const urls: string[] = [];
    for (const f of files) {
      if (typeof f === "string") continue;
      const file = f as File;
      const type = file.type || "";
      if (!type.startsWith("image/")) {
        continue;
      }
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const ext = path.extname(safeName) || ".bin";
      const base = path.basename(safeName, ext);
      const filename = `${base}-${Date.now()}${ext}`;
      const fullPath = path.join(uploadsDir, filename);
      await fs.writeFile(fullPath, buffer);
      urls.push(`/uploads/${filename}`);
    }

    if (urls.length === 0) {
      return NextResponse.json({ error: "No valid image files" }, { status: 400 });
    }
    return NextResponse.json({ urls });
  } catch (err) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
