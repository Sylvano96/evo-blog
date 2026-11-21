export interface ContentBlock {
  id: number;
  titlePara: string;
  content: string;
}

export interface Post {
  id: number;
  title: string;
  category: string;
  status: string;
  image: string;
  contents: ContentBlock[];
  createdAt: string;
  userId: number;
  authorName: string;
}

export interface PostPayload {
  title: string;
  category: string;
  status: string;
  image: string;
  contents: ContentBlock[];
}

export interface Comment {
  id: number;
  pseudo: string;
  comment: string;
  postId: number;
  createdAt: string;
}

export interface Session {
  token: string;
  role: 'admin' | 'redacteur' | string;
  name: string;
  userId: number;
  expiresAt: number;
}

export interface AuthorSummary {
  id: number;
  name: string;
  lastName: string;
  email: string;
  actif: boolean;
  postCount: number;
  lastPostAt: string | null;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface Stats {
  publishedLastMonth: CategoryCount[];
  publishedByCategory: CategoryCount[];
  published: number;
  drafts: number;
  authors: number;
}

export interface MessageResponse {
  message: string;
}

/** Extracts the user-facing message of an API error. */
export function errorMessage(error: any, fallback = 'Une erreur est survenue, réessayez.'): string {
  if (error?.status === 0) {
    return 'Serveur injoignable. Vérifiez que l\'API est démarrée.';
  }
  return error?.error?.message ?? fallback;
}
