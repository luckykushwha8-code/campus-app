export function serializeEvent(event: any, currentUserId?: string | null) {
  return {
    id: String(event._id),
    slug: event.slug,
    title: event.title,
    description: event.description || "",
    image: event.image || "",
    location: event.location,
    startDate: new Date(event.startDate).toISOString(),
    organizer: {
      name: event.organizerName,
      avatar: event.creatorAvatarUrl || "",
    },
    attendees: event.attendeeIds?.length || 0,
    isRegistered: currentUserId ? event.attendeeIds?.includes(currentUserId) : false,
    isOwner: currentUserId ? String(event.creatorId || "") === currentUserId : false,
  };
}
