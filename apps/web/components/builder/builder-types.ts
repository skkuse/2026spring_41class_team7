export type BuilderPhase = 'select' | 'generating' | 'editing';

export type AssessmentSummary = {
  id: string;
  repoUrl: string;
  repoOwner: string;
  repoName: string;
  assessmentType: string;
  overallScore: number;
  model: string;
  generatedAt: string;
  createdAt: string;
};

export type ScorecardRow = {
  criterion: string;
  score: number;
  status: 'Strong' | 'Partial' | 'Missing';
  confidence: 'High' | 'Medium' | 'Low';
  rationale: string;
};

export type AssessmentDetail = AssessmentSummary & {
  scores: Record<string, number>;
  scorecard: ScorecardRow[];
  findings: string[];
  gapsAndRisks: string[];
  nextSteps: string[];
  executiveSummary: string;
  contextChars: number;
};

export type PortfolioHighlight = {
  title: string;
  description: string;
};

export type PortfolioSectionData = {
  assessmentId: string;
  repoOwner: string;
  repoName: string;
  overallScore: number;
  headline: string;
  summary: string;
  role: string;
  duration: string;
  techStack: string[];
  highlights: PortfolioHighlight[];
  impact: string;
};

export type PortfolioSection = {
  id: string;
  data: PortfolioSectionData | null;
  generating: boolean;
};

export type BuilderProps = {
  phase: BuilderPhase;

  // Select phase
  assessments: AssessmentSummary[];
  listLoading: boolean;
  orderedIds: string[];
  carouselIdx: number;
  setCarouselIdx: (i: number) => void;
  currentCarouselSummary: AssessmentSummary | undefined;
  currentCarouselDetail: AssessmentDetail | undefined;
  detailLoading: boolean;

  // Editing phase
  sections: PortfolioSection[];
  onSectionChange: (id: string, patch: Partial<PortfolioSectionData>) => void;

  // Actions
  onToggle: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onBuild: () => void;
  onSave: () => void;
  onExport: () => void;
  onReset: () => void;
};
