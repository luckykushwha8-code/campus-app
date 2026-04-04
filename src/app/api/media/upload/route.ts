import { getServerSession } from "@/lib/server-auth";
import { isMediaStorageConfigured, uploadImageToCloudinary } from "@/lib/media-storage";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.userId) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
    }

    if (!isMediaStorageConfigured()) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Image storage is not configured yet. Add Cloudinary credentials to enable uploads.",
        }),
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const kind = formData.get("kind");

    if (!(file instanceof File) || typeof kind !== "string") {
      return new Response(JSON.stringify({ ok: false, error: "Missing upload data" }), { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return new Response(JSON.stringify({ ok: false, error: "Use JPG, PNG, or WEBP images." }), { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ ok: false, error: "Please upload an image smaller than 2MB." }), { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const folder = kind === "cover" ? "campuslink/covers" : "campuslink/avatars";
    const asset = await uploadImageToCloudinary(buffer, folder);

    return new Response(JSON.stringify({ ok: true, asset }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to upload image right now." }), { status: 500 });
  }
}
