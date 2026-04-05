import { connectDB } from "@/lib/db";
import { getRequestUser } from "@/lib/request-auth";
import { deleteMediaFromCloudinary } from "@/lib/media-storage";
import { serializePrivateUser } from "@/lib/user-serialization";
import { MessageModel } from "@/models/Chat";
import { EventModel } from "@/models/Event";
import { UserModel } from "@/models/User";

const TARGET_FIELDS = {
  avatar: {
    url: "avatarUrl",
    publicId: "avatarPublicId",
  },
  cover: {
    url: "coverUrl",
    publicId: "coverPublicId",
  },
} as const;

type MediaTarget = keyof typeof TARGET_FIELDS;

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const user = await getRequestUser(req);
    if (!user?._id) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
    }

    const body = await req.json();
    const target = String(body.target || "") as MediaTarget;
    const action = String(body.action || "");
    const url = String(body.url || "").trim();
    const publicId = String(body.publicId || "").trim();

    if (!(target in TARGET_FIELDS)) {
      return new Response(JSON.stringify({ ok: false, error: "Choose a valid media target." }), { status: 400 });
    }

    if (!["set", "remove"].includes(action)) {
      return new Response(JSON.stringify({ ok: false, error: "Choose a valid media action." }), { status: 400 });
    }

    const freshUser = await UserModel.findById(user._id);
    if (!freshUser) {
      return new Response(JSON.stringify({ ok: false, error: "User not found." }), { status: 404 });
    }

    const fields = TARGET_FIELDS[target];
    const previousPublicId = String((freshUser as any)[fields.publicId] || "");
    const nextValue =
      action === "remove"
        ? { url: "", publicId: "" }
        : { url, publicId };

    if (action === "set" && (!nextValue.url || !nextValue.publicId)) {
      return new Response(JSON.stringify({ ok: false, error: "Uploaded media details are missing." }), { status: 400 });
    }

    (freshUser as any)[fields.url] = nextValue.url;
    (freshUser as any)[fields.publicId] = nextValue.publicId;
    await freshUser.save();

    if (target === "avatar") {
      await Promise.all([
        EventModel.updateMany({ creatorId: String(freshUser._id) }, { $set: { creatorAvatarUrl: nextValue.url } }),
        MessageModel.updateMany({ senderId: String(freshUser._id) }, { $set: { senderAvatar: nextValue.url } }),
      ]);
    }

    if (previousPublicId && previousPublicId !== nextValue.publicId) {
      await deleteMediaFromCloudinary(previousPublicId).catch(() => false);
    }

    return new Response(JSON.stringify({ ok: true, user: serializePrivateUser(freshUser) }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Unable to update profile media right now." }), { status: 500 });
  }
}
