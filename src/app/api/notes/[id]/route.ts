import { connectDB } from "@/lib/db";
import { Types } from "mongoose";
import { getRequestUserId } from "@/lib/request-auth";
import { NoteModel } from "@/models/Note";

export async function GET(req: Request, { params }: any) {
  try {
    await connectDB();
    const id = params?.id;
    if (!id) {
      return new Response(JSON.stringify({ ok: false, error: "Missing note id." }), { status: 400 });
    }
    if (!Types.ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ ok: false, error: "Note not found." }), { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action") || "view";

    const note = await NoteModel.findById(id);
    if (!note) {
      return new Response(JSON.stringify({ ok: false, error: "Note not found." }), { status: 404 });
    }

    if (action === "download") {
      note.downloads += 1;
    } else {
      note.views += 1;
    }
    await note.save();

    return Response.redirect(note.fileUrl, 302);
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to open note right now." }), { status: 500 });
  }
}

export async function PUT(req: Request, { params }: any) {
  try {
    await connectDB();
    const userId = await getRequestUserId(req);
    if (!userId) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
    }

    const id = params?.id;
    if (!id) {
      return new Response(JSON.stringify({ ok: false, error: "Missing note id." }), { status: 400 });
    }
    if (!Types.ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ ok: false, error: "Note not found." }), { status: 404 });
    }

    const body = await req.json();
    const title = String(body.title || "").trim();
    const subject = String(body.subject || "").trim();
    const description = String(body.description || "").trim();

    if (!title || !subject) {
      return new Response(JSON.stringify({ ok: false, error: "Title and subject are required." }), { status: 400 });
    }

    const note = await NoteModel.findById(id);
    if (!note) {
      return new Response(JSON.stringify({ ok: false, error: "Note not found." }), { status: 404 });
    }

    if (String(note.authorId) !== userId) {
      return new Response(JSON.stringify({ ok: false, error: "Forbidden" }), { status: 403 });
    }

    note.title = title;
    note.subject = subject;
    note.description = description;
    await note.save();

    return new Response(
      JSON.stringify({
        ok: true,
        note: {
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
          isOwner: true,
        },
      }),
      { status: 200 }
    );
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to update this note right now." }), { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: any) {
  try {
    await connectDB();
    const userId = await getRequestUserId(req);
    if (!userId) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
    }

    const id = params?.id;
    if (!id) {
      return new Response(JSON.stringify({ ok: false, error: "Missing note id." }), { status: 400 });
    }
    if (!Types.ObjectId.isValid(id)) {
      return new Response(JSON.stringify({ ok: false, error: "Note not found." }), { status: 404 });
    }

    const note = await NoteModel.findById(id);
    if (!note) {
      return new Response(JSON.stringify({ ok: false, error: "Note not found." }), { status: 404 });
    }

    if (String(note.authorId) !== userId) {
      return new Response(JSON.stringify({ ok: false, error: "Forbidden" }), { status: 403 });
    }

    await NoteModel.findByIdAndDelete(id);
    return new Response(JSON.stringify({ ok: true, id }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to delete this note right now." }), { status: 500 });
  }
}
