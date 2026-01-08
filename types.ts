export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  githubLink: string;
}

export interface Skill {
  name: string;
  level: number; // 1-100
  category: 'Language' | 'Framework' | 'Tool';
}

export interface ContentData {
  heroTagline: string;
  aboutText: string;
  email: string;
  githubUsername: string;
  linkedinUrl: string;
  instagramUrl: string;
  heroImage?: string; // New field for the hero image URL/Base64
}

export interface GitHubStats {
  repos: number;
  followers: number;
  following: number;
  totalStars: number;
  lastPush: string | null;
  totalCommits: number;
  contributionMap: Record<string, number>; // Format: "YYYY-MM-DD": count
}

export interface UserState {
  isAdmin: boolean;
  uid?: string;
}

export interface AccessLog {
  id: string;
  timestamp: number;
  email: string;
  ip: string;
  status: 'SUCCESS' | 'FAILURE';
  userAgent: string;
}