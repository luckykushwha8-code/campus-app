import { connectDB } from "@/lib/db";
import { NoteModel } from "@/models/Note";

export async function GET(req: Request, { params }: any) {
  try {
    await connectDB();
    const id = params?.id;
    if (!id) {
      return new Response(JSON.stringify({ ok: false, error: "Missing note id." }), { status: 400 });
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
