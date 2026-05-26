// ──────────────────────────────────────────────
// Shared Types — used by both client and server
// ──────────────────────────────────────────────

// ─── Plant Domain ────────────────────────────

export interface CareInstructions {
  light: string;
  water: string;
  soil: string;
  fertilizer: string;
}

export interface SimilarPlant {
  name: string;
  imageAlt: string;
}

export interface HealthAssessment {
  isHealthy: boolean;
  diagnosis: string;
  symptoms: string[];
  causes: string[];
  treatment: string[];
  prevention: string[];
}

export interface PlantData {
  commonName: string;
  scientificName: string;
  description: string;
  careInstructions: CareInstructions;
  funFact: string;
  isToxic: boolean;
  matchScore: number;
  similarPlants: SimilarPlant[];
  healthAssessment?: HealthAssessment;
}

export interface TimelineEntry {
  date: string;
  image: string;
  height?: string;
  note?: string;
}

export interface WateringLog {
  date: string;
  amount?: string;
}

export interface PlantItem {
  id: string;
  name: string;
  scientificName: string;
  date: string;
  image: string;
  tags: string[];
  data: PlantData;
  growthTimeline?: TimelineEntry[];
  wateringHistory?: WateringLog[];
}

// ─── User Domain ─────────────────────────────

export interface UserProfile {
  name: string;
  email: string;
  image: string | null;
  joinedDate: string;
  level: number;
}

// ─── Chat Domain ─────────────────────────────

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'expert';
  timestamp: string; // ISO string for API transport
  isError?: boolean;
  image?: string;
}

// ─── Community Domain ────────────────────────

export interface CommunityPost {
  id: string;
  user: string;
  userAvatar: string;
  image: string;
  caption: string;
  likes: number;
  comments: number;
  timeAgo: string;
  tags: string[];
}

// ─── API Contract Types ──────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  message: string;
  code: string;
  statusCode: number;
  details?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Auth Types ──────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: UserProfile;
  tokens: AuthTokens;
}

// ─── Plant API Types ─────────────────────────

export interface IdentifyRequest {
  mode: 'identify' | 'diagnose';
}

export interface IdentifyResponse {
  plantData: PlantData;
  scanId: string;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  imageBase64?: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
}

// ─── Tools Types ─────────────────────────────

export interface WaterCalculatorRequest {
  plantType: 'tropical' | 'succulent' | 'fern';
  potSize: number;
  season: 'spring' | 'summer' | 'fall' | 'winter';
}

export interface WaterCalculatorResponse {
  frequency: string;
  amount: string;
}
