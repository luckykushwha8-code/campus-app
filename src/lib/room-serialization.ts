export function serializeRoom(room: any, currentUserId?: string | null) {
  return {
    id: String(room._id),
    slug: room.slug,
    name: room.name,
    description: room.description || "",
    type: room.type,
    membersCount: room.memberIds?.length || 0,
    isJoined: currentUserId ? room.memberIds?.includes(currentUserId) : false,
    isOwner: currentUserId ? String(room.creatorId || "") === currentUserId : false,
    creatorName: room.creatorName || "Campus member",
    createdAt: room.createdAt,
  };
}
