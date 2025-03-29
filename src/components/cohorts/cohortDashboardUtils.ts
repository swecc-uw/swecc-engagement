import { CohortStats, ConversionRates } from './cohortDashboardTypes';

export const EPS = 0.0000001;

export const getSafeStats = (stats: CohortStats): CohortStats => {
  return {
    applications: Math.max(stats.applications, EPS),
    onlineAssessments: Math.max(stats.onlineAssessments, EPS),
    interviews: Math.max(stats.interviews, EPS),
    offers: Math.max(stats.offers, EPS),
    dailyChecks: stats.dailyChecks,
    streak: stats.streak,
  };
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

export const safePercentage = (value: number, total: number): string => {
  if (!total) return '0.0';
  const result = (value / total) * 100;
  return isFinite(result) ? result.toFixed(1) : '0.0';
};

export const calculateConversionRates = (
  stats: CohortStats
): ConversionRates => {
  return {
    assessmentRate: safePercentage(stats.onlineAssessments, stats.applications),
    interviewRate: safePercentage(stats.interviews, stats.onlineAssessments),
    offerRate: safePercentage(stats.offers, stats.interviews),
    overallRate: safePercentage(stats.offers, stats.applications),
  };
};

export const getAggregateTypeLabel = (type: string): string => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};
