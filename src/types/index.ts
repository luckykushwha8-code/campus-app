export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  institutionId?: string;
  department?: string;
  graduationYear?: number;
  isVerified: boolean;
}

export interface Post {
  id: string;
  content: string;
  images?: string[];
  author: User;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
}

export interface Story {
  id: string;
  image: string;
  author: User;
  expiresAt: string;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  type: string;
  membersCount: number;
  isJoined: boolean;
}

export interface Message {
  id: string;
  content: string;
  sender: User;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  image?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  organizer: User;
}

export interface Note {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  subject: string;
  uploadedBy: User;
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  company?: string;
  description: string;
  jobType: string;
  location?: string;
  salary?: string;
  applyLink?: string;
  postedBy: User;
  createdAt: string;
}

export interface LostItem {
  id: string;
  title: string;
  description?: string;
  image?: string;
  location?: string;
  status: string;
  postedBy: User;
  createdAt: string;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  images?: string[];
  category: string;
  condition?: string;
  postedBy: User;
  isSold: boolean;
  createdAt: string;
}
