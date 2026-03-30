export type Grade = 'U' | 'P' | 'M' | 'D';

export type TawjihiCalcMode = 'spec-only' | 'shared-only' | 'full-calc';

export type AppStep =
  | 'splash'
  | 'stage'
  // First-year & Tawjihi mode-1 shared steps
  | 'specialization'
  | 'engineering-sub'
  | 'grades'
  | 'shared-question'
  | 'shared'
  | 'results'
  // Tawjihi mode selection
  | 'tawjihi-mode'
  // Tawjihi mode 2 – shared only
  | 'tawjihi-shared-only'
  | 'tawjihi-shared-results'
  // Tawjihi mode 3 – full calc
  | 'full-first-spec'
  | 'full-first-grades'
  | 'full-tawjihi-spec'
  | 'full-tawjihi-sub'
  | 'full-tawjihi-grades'
  | 'full-shared'
  | 'full-results';

export interface Subject {
  name: string;
  hours: number;
}

export interface SubSpecialization {
  id: string;
  name: string;
  subjects: Subject[];
}

export interface Specialization {
  id: string;
  name: string;
  subjects: Subject[];
  subSpecs?: SubSpecialization[];
}

export interface StageData {
  id: string;
  name: string;
  icon: string;
  description: string;
  specializations: Specialization[];
}

export interface SharedGrades {
  arabic: string;
  english: string;
  islamic: string;
  history: string;
}

export interface SpecialtyResults {
  totalPoints: number;
  totalHours: number;
  average100: number;
  average35: number;
  subjectBreakdown: Array<{
    name: string;
    hours: number;
    grade: Grade;
    points: number;
  }>;
}

export interface SharedResults {
  arabicWeighted: number;
  englishWeighted: number;
  islamicWeighted: number;
  historyWeighted: number;
  total30: number;
}

export interface FinalResults {
  specialty: SpecialtyResults;
  shared?: SharedResults;
  finalGrade: number;
  finalPercentage: number;
  hasShared: boolean;
  allowAddShared: boolean;
  stageName: string;
  specName: string;
}

export interface FullCalcResults {
  firstYear: SpecialtyResults;
  firstYearSpecName: string;
  tawjihi: SpecialtyResults;
  tawjihiSpecName: string;
  shared: SharedResults;
  finalGrade: number;
  finalPercentage: number;
}

export interface SavedState {
  step: AppStep;
  // Mode 1 / first-year
  selectedStageId: string | null;
  selectedSpecId: string | null;
  selectedSubSpecId: string | null;
  subjectGrades: Record<string, Grade | null>;
  sharedGrades: SharedGrades;
  wantsShared: boolean | null;
  // Tawjihi
  tawjihiCalcMode: TawjihiCalcMode | null;
  // Full-calc fields
  fullFirstSpecId: string | null;
  fullFirstGrades: Record<string, Grade | null>;
  fullTawjihiSpecId: string | null;
  fullTawjihiSubSpecId: string | null;
  fullTawjihiGrades: Record<string, Grade | null>;
  fullSharedGrades: SharedGrades;
}
