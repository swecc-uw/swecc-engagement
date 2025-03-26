import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCohortStats, getCohorts } from '../services/cohort';
import { CohortView } from '../types';

const initialStats = {
  applications: 0,
  onlineAssessments: 0,
  interviews: 0,
  offers: 0,
  dailyChecks: 0,
  streak: 0,
};

export type CohortStats = typeof initialStats;

export type ConversionRates = {
  assessmentRate: string;
  interviewRate: string;
  offerRate: string;
  overallRate: string;
}
interface CohortStatsHookResult {
  stats: CohortStats;
  averageStats: CohortStats;
  allCohorts: CohortView[];
  userCohorts: CohortView[];
  selectedCohortId: string;
  loading: boolean;
  error: string | null;
  setSelectedCohortId: (id: string) => void;
  conversionRates: ConversionRates;
}

export const useCohortStats = (memberId?: number): CohortStatsHookResult => {
  const [selectedCohortId, setSelectedCohortId] = useState<string>('all');

  const allStatsQuery = useQuery({
    queryKey: ['allCohortStats'],
    queryFn: () =>
      getCohortStats(undefined) as Promise<
        { cohort?: { id: number }; stats?: typeof initialStats }[]
      >,
  });

  const cohortsQuery = useQuery({
    queryKey: ['cohorts'],
    queryFn: () => getCohorts(false),
  });

  const selectedCohortStats = useMemo(() => {
    if (selectedCohortId === 'all' || !allStatsQuery.data) return null;

    const cohortId = parseInt(selectedCohortId, 10);
    return (
      allStatsQuery.data.find(
        (item: { cohort?: { id: number }; stats?: typeof initialStats }) =>
          item.cohort?.id === cohortId
      )?.stats || null
    );
  }, [selectedCohortId, allStatsQuery.data]);

  const allCohortsStats = useMemo(() => {
    const data = allStatsQuery.data;
    if (!data || !Array.isArray(data) || data.length === 0) return initialStats;

    return data.reduce(
      (acc, item) => ({
        applications: acc.applications + (item.stats?.applications || 0),
        onlineAssessments:
          acc.onlineAssessments + (item.stats?.onlineAssessments || 0),
        interviews: acc.interviews + (item.stats?.interviews || 0),
        offers: acc.offers + (item.stats?.offers || 0),
        streak: Math.max(acc.streak, item.stats?.streak || 0),
        dailyChecks: acc.dailyChecks + (item.stats?.dailyChecks || 0),
      }),
      { ...initialStats }
    );
  }, [allStatsQuery.data]);

  const stats = useMemo(() => {
    if (selectedCohortId === 'all') return allCohortsStats;
    if (!selectedCohortStats) return initialStats;

    return {
      applications: selectedCohortStats.applications || 0,
      onlineAssessments: selectedCohortStats.onlineAssessments || 0,
      interviews: selectedCohortStats.interviews || 0,
      offers: selectedCohortStats.offers || 0,
      dailyChecks: selectedCohortStats.dailyChecks || 0,
      streak: selectedCohortStats.streak || 0,
    };
  }, [selectedCohortId, selectedCohortStats, allCohortsStats]);

  const averageStats = useMemo(() => {
    const data = allStatsQuery.data;
    if (!data || !Array.isArray(data) || data.length === 0) return initialStats;

    const totalCohorts = data.length;

    const totals = data.reduce(
      (acc, item) => ({
        applications: acc.applications + (item.stats?.applications || 0),
        onlineAssessments:
          acc.onlineAssessments + (item.stats?.onlineAssessments || 0),
        interviews: acc.interviews + (item.stats?.interviews || 0),
        offers: acc.offers + (item.stats?.offers || 0),
        dailyChecks: acc.dailyChecks + (item.stats?.dailyChecks || 0),
        streak: Math.max(acc.streak, item.stats?.streak || 0),
      }),
      { ...initialStats }
    );

    const result = {
      applications: totals.applications / totalCohorts || 0,
      onlineAssessments: totals.onlineAssessments / totalCohorts || 0,
      interviews: totals.interviews / totalCohorts || 0,
      offers: totals.offers / totalCohorts || 0,
      dailyChecks: totals.dailyChecks / totalCohorts || 0,
      streak: totals.streak,
    };

    return result;
  }, [allStatsQuery.data]);

  const conversionRates = useMemo(() => {
    const safePercentage = (numerator: number, denominator: number): string => {
      if (!denominator) return '0.0';
      const result = (numerator / denominator) * 100;
      return isFinite(result) ? result.toFixed(1) : '0.0';
    };

    const rates = {
      assessmentRate: safePercentage(
        stats.onlineAssessments,
        stats.applications
      ),
      interviewRate: safePercentage(stats.interviews, stats.onlineAssessments),
      offerRate: safePercentage(stats.offers, stats.interviews),
      overallRate: safePercentage(stats.offers, stats.applications),
    };

    return rates;
  }, [stats]);

  const { allCohorts, userCohorts } = useMemo(() => {
    const allCohortsData = cohortsQuery.data || [];
    return {
      allCohorts: allCohortsData,
      userCohorts: memberId
        ? allCohortsData.filter((cohort) =>
            cohort.members?.some((m) => m?.id === memberId)
          )
        : [],
    };
  }, [cohortsQuery.data, memberId]);

  const loading = allStatsQuery.isPending || cohortsQuery.isPending;
  const error =
    allStatsQuery.error || cohortsQuery.error ? 'Failed to load stats' : null;

  return {
    stats,
    averageStats,
    allCohorts,
    userCohorts,
    selectedCohortId,
    loading,
    error,
    setSelectedCohortId,
    conversionRates,
  };
};
