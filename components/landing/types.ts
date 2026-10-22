export type Language = 'EN' | 'አማ' | 'ORO';

export interface SkilledWorker {
  id: string;
  name: string;
  trade: string;
  category: string;
  location: string;
  kebele: string;
  rating: number;
  completedJobs: number;
  faydaVerified: boolean;
  faydaIdNumber?: string;
  proStatus: boolean;
  skills: string[];
  startingRate: number;
  avatar: string;
  phone: string;
}

export interface SkilledFile {
  id: string;
  name: string;
  type: 'folder' | 'document' | 'image' | 'analytics';
  color: string;
  size: string;
  lastUpdated: string;
  author: string;
  description: string;
  tags: string[];
  content?: {
    summary: string;
    sections: { title: string; content: string }[];
    tokens?: { label: string; value: string; colorHex?: string }[];
  };
}

export interface TradeCard {
  id: string;
  title: string;
  category: 'Electrician' | 'Plumber' | 'Painter' | 'House Finishing';
  description: string;
  image: string;
  deliverables: string[];
  impactMetric: string;
  details: string;
}

export interface SkillArticle {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  excerpt: string;
  content: string[];
  author: {
    name: string;
    role: string;
    avatar: string;
  };
}

export interface StudioWorkerMatch {
  id: string;
  label: string;
  prompt: string;
  category: string;
  workerName: string;
  trade: string;
  location: string;
  rate: number;
  rating: number;
  matchScore: number;
  outputTitle: string;
  outputBody: string;
  tags: string[];
}
