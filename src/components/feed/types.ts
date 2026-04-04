export type FeedPostAuthor = {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  institution?: string;
  isVerified?: boolean;
};

export type FeedComment = {
  id: string;
  postId: string;
  content: string;
  createdAt: string;
  isOwner: boolean;
  canReport?: boolean;
  author: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
  };
};

export type FeedPost = {
  id: string;
  content: string;
  images?: string[];
  author: FeedPostAuthor;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isOwner?: boolean;
  isAnonymous?: boolean;
  canReport?: boolean;
  createdAt: string;
};
