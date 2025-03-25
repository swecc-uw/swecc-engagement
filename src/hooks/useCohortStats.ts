import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCohortStats, getCohorts } from '../services/cohort';
import { CohortView } from '../types';
import { devPrint } from '../components/utils/RandomUtils';

const initialStats = {
  applications: 0,
  onlineAssessments: 0,
  interviews: 0,
  offers: 0,
  dailyChecks: 0,
  streak: 0,
};

interface CohortStatsHookResult {
  stats: typeof initialStats;
  averageStats: typeof initialStats;
  allCohorts: CohortView[];
  userCohorts: CohortView[];
  selectedCohortId: string;
  loading: boolean;
  error: string | null;
  setSelectedCohortId: (id: string) => void;
  conversionRates: {
    assessmentRate: string;
    interviewRate: string;
    offerRate: string;
    overallRate: string;
  };
}

export const useCohortStats = (memberId?: number): CohortStatsHookResult => {
  const [selectedCohortId, setSelectedCohortId] = useState<string>('all');

  const statsQuery = useQuery({
    queryKey: ['cohortStats', selectedCohortId],
    queryFn: () =>
      getCohortStats(selectedCohortId === 'all' ? undefined : selectedCohortId),
  });

  const allStatsQuery = useQuery({
    queryKey: ['allCohortStats'],
    queryFn: () => getCohortStats(undefined),
  });

  const cohortsQuery = useQuery({
    queryKey: ['cohorts'],
    queryFn: getCohorts,
  });

  const allCohortsStats = useMemo(() => {
    if (!statsQuery.data || !Array.isArray(statsQuery.data))
      return initialStats;

    if (statsQuery.data.length === 0) return initialStats;

    return statsQuery.data.reduce(
      (acc, data) => ({
        applications: acc.applications + (data.stats?.applications || 0),
        onlineAssessments:
          acc.onlineAssessments + (data.stats?.onlineAssessments || 0),
        interviews: acc.interviews + (data.stats?.interviews || 0),
        offers: acc.offers + (data.stats?.offers || 0),
        streak: Math.max(acc.streak, data.stats?.streak || 0),
        dailyChecks: acc.dailyChecks + (data.stats?.dailyChecks || 0),
      }),
      { ...initialStats }
    );
  }, [statsQuery.data]);

  const stats = useMemo(() => {
    if (!statsQuery.data) return initialStats;

    if (selectedCohortId === 'all' && Array.isArray(statsQuery.data)) {
      return allCohortsStats;
    } else {
      const statsToUse = Array.isArray(statsQuery.data)
        ? statsQuery.data[0]?.stats
        : statsQuery.data?.stats;

      if (!statsToUse) return initialStats;

      return {
        applications: statsToUse.applications || 0,
        onlineAssessments: statsToUse.onlineAssessments || 0,
        interviews: statsToUse.interviews || 0,
        offers: statsToUse.offers || 0,
        dailyChecks: statsToUse.dailyChecks || 0,
        streak: statsToUse.streak || 0,
      };
    }
  }, [selectedCohortId, statsQuery.data, allCohortsStats]);

  const averageStats = useMemo(() => {
    if (!allStatsQuery.data || !Array.isArray(allStatsQuery.data)) {
      devPrint('No all stats data', allStatsQuery);
      return initialStats;
    }

    const totalCohorts = allStatsQuery.data.length;

    if (totalCohorts === 0) {
      devPrint('No cohorts');
      return initialStats;
    }

    const allCohortsTotal = allStatsQuery.data.reduce(
      (acc, data) => ({
        applications: acc.applications + (data.stats?.applications || 0),
        onlineAssessments:
          acc.onlineAssessments + (data.stats?.onlineAssessments || 0),
        interviews: acc.interviews + (data.stats?.interviews || 0),
        offers: acc.offers + (data.stats?.offers || 0),
        dailyChecks: acc.dailyChecks + (data.stats?.dailyChecks || 0),

        streak: Math.max(acc.streak, data.stats?.streak || 0),
      }),
      { ...initialStats }
    );

    devPrint('Calculating average stats from ALL cohorts', allCohortsTotal);

    return {
      applications:
        Math.round(allCohortsTotal.applications / totalCohorts) || 0,
      onlineAssessments:
        Math.round(allCohortsTotal.onlineAssessments / totalCohorts) || 0,
      interviews: Math.round(allCohortsTotal.interviews / totalCohorts) || 0,
      offers: Math.round(allCohortsTotal.offers / totalCohorts) || 0,
      dailyChecks: Math.round(allCohortsTotal.dailyChecks / totalCohorts) || 0,

      streak: allCohortsTotal.streak,
    };
  }, [allStatsQuery.data]);

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

  const conversionRates = useMemo(() => {
    const safePercentage = (numerator: number, denominator: number): string => {
      if (!denominator || denominator === 0) return '0.0';
      const result = (numerator / denominator) * 100;

      return isFinite(result) ? result.toFixed(1) : '0.0';
    };

    return {
      assessmentRate: safePercentage(
        stats.onlineAssessments,
        stats.applications
      ),
      interviewRate: safePercentage(stats.interviews, stats.onlineAssessments),
      offerRate: safePercentage(stats.offers, stats.interviews),
      overallRate: safePercentage(stats.offers, stats.applications),
    };
  }, [stats]);

  const loading =
    statsQuery.isPending || cohortsQuery.isPending || allStatsQuery.isPending;
  const error =
    statsQuery.error || cohortsQuery.error || allStatsQuery.error
      ? 'Failed to load stats'
      : null;

  return {
    stats, // currently selected cohort stats
    averageStats, // average stats over all cohorts
    allCohorts, // ALL cohorts
    userCohorts, // cohorts that the user is a member of
    selectedCohortId,
    loading,
    error,
    setSelectedCohortId,
    conversionRates, // conversion from one stage to the next
  };
};
