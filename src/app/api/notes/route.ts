import type { SortOrder } from "mongoose";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getBearerToken, getServerSession } from "@/lib/server-auth";
import { uploadDocumentToCloudinary, isMediaStorageConfigured } from "@/lib/media-storage";
import { NoteModel } from "@/models/Note";
import { UserModel } from "@/models/User";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set(["application/pdf"]);

function serializeNote(note: any) {
  return {
    id: String(note._id),
    title: note.title,
    description: note.description || "",
    subject: note.subject,
    fileUrl: note.fileUrl,
    fileName: note.fileName,
    fileType: note.fileType,
    fileSize: note.fileSize,
    uploadedBy: { name: note.authorName },
    downloads: note.downloads || 0,
    views: note.views || 0,
    createdAt: note.createdAt,
    isOwner: false,
  };
}

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const tab = searchParams.get("tab") || "all";
    const userId = searchParams.get("userId") || "";

    const query: Record<string, unknown> = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (tab === "my" && userId) {
      query.authorId = userId;
    }

    const sort: Record<string, SortOrder> =
      tab === "popular"
        ? { downloads: -1, views: -1, createdAt: -1 }
        : { createdAt: -1 };

    const notes = await NoteModel.find(query).sort(sort).limit(50).lean();

    return new Response(
      JSON.stringify({
        ok: true,
        notes: notes.map((note) => ({
          ...serializeNote(note),
          isOwner: userId ? note.authorId === userId : false,
        })),
      }),
      { status: 200 }
    );
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to load notes right now." }), { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    const bearerToken = getBearerToken(req);
    const bearerPayload = bearerToken ? (verifyToken(bearerToken) as { userId?: string } | null) : null;
    const userId = session?.userId || bearerPayload?.userId;

    if (!userId) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
    }

    if (!isMediaStorageConfigured()) {
      return new Response(
        JSON.stringify({ ok: false, error: "Document storage is not configured yet. Add Cloudinary credentials to enable uploads." }),
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const title = String(formData.get("title") || "").trim();
    const subject = String(formData.get("subject") || "").trim();
    const description = String(formData.get("description") || "").trim();

    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ ok: false, error: "Please choose a PDF file to upload." }), { status: 400 });
    }

    if (!title || !subject) {
      return new Response(JSON.stringify({ ok: false, error: "Title and subject are required." }), { status: 400 });
    }

    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      return new Response(JSON.stringify({ ok: false, error: "Only PDF notes are supported right now." }), { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ ok: false, error: "Please upload a PDF smaller than 5MB." }), { status: 400 });
    }

    await connectDB();
    const user = await UserModel.findById(userId).lean();
    if (!user) {
      return new Response(JSON.stringify({ ok: false, error: "User not found." }), { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadedFile = await uploadDocumentToCloudinary(buffer, "campuslink/notes", file.name, file.type);

    const note = await NoteModel.create({
      authorId: userId,
      authorName: user.name || user.email.split("@")[0],
      title,
      description,
      subject,
      fileUrl: uploadedFile.url,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

    return new Response(JSON.stringify({ ok: true, note: serializeNote(note.toObject()) }), { status: 201 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to upload note right now." }), { status: 500 });
  }
}
