// cohort dashboard specific types
// keeping this file separate so shared types aren't cluttered

export interface Cohort {
  id: number;
  name: string;
  level: string;
  stats: CohortStats;
}

export interface CohortStats {
  applications: number;
  onlineAssessments: number;
  interviews: number;
  offers: number;
  dailyChecks: number;
  streak: number;
}

export interface ConversionRates {
  assessmentRate: string;
  interviewRate: string;
  offerRate: string;
  overallRate: string;
}

export interface Ring {
  name: string;
  value: number;
  total: number;
  color: string;
  radius: number;
  tooltip: string;
  exceedsAverage?: boolean;
}

export interface TooltipState {
  show: boolean;
  content: string;
  x: number;
  y: number;
  width: number;
}

export type AggregateType = 'total' | 'average' | 'max';
