
export interface SpeciesClassification {
  kingdom: string;
  family: string;
  genus: string;
  species: string;
}

export interface PossibleMatch {
  commonName: string;
  scientificName: string;
  probability: number;
}

export interface LowConfidenceDetails {
  possibleMatches: PossibleMatch[];
  suggestions: string[];
}

export interface CareInstructions {
  light: string;
  water: string;
  soil: string;
  fertilizer: string;
  growthConditions?: string;
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
  toxicityDetails?: string;
  matchScore: number;
  confidenceScore?: number;
  speciesClassification?: SpeciesClassification;
  medicinalOrAgriculturalUses?: string;
  similarPlants: SimilarPlant[];
  healthAssessment?: HealthAssessment;
  lowConfidenceDetails?: LowConfidenceDetails | null;
  analysis_history?: Array<PlantData & { date: string; image: string }>;
  is_liked?: boolean;
}

export interface IdentificationState {
  status: 'idle' | 'camera' | 'analyzing' | 'success' | 'error';
  image: string | null;
  data: PlantData | null;
  error: string | null;
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

export interface UserProfile {
  name: string;
  email: string;
  image: string | null;
  joinedDate: string;
  level: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'expert'; // Added expert
  timestamp: Date;
  isError?: boolean;
  image?: string;
}

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
