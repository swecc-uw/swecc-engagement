import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCohortDashboardView } from '../../services/cohort';
import { Cohort, CohortStats, ConversionRates } from './cohortDashboardTypes';
import { safePercentage } from './cohortDashboardUtils';

const initialStats: CohortStats = {
  applications: 0,
  onlineAssessments: 0,
  interviews: 0,
  offers: 0,
  dailyChecks: 0,
  streak: 0,
};

interface CohortDashboardHookResult {
  stats: CohortStats;
  averageStats: CohortStats;
  maxStats: CohortStats;
  totalStats: CohortStats;
  userCohorts: Cohort[];
  selectedCohortId: string;
  loading: boolean;
  error: string | null;
  setSelectedCohortId: (id: string) => void;
  conversionRates: ConversionRates;
}

export const useCohortDashboard = (): CohortDashboardHookResult => {
  const [selectedCohortId, setSelectedCohortId] = useState<string>('all');

  const [loading, setLoading] = useState<boolean>(true);

  const dashboardQuery = useQuery({
    queryKey: ['cohortDashboard'],
    queryFn: () => getCohortDashboardView(),

    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (dashboardQuery.isSuccess && dashboardQuery.data) {
      timeoutId = setTimeout(() => {
        setLoading(false);
      }, 300);
    } else if (dashboardQuery.isError) {
      setLoading(false);
    } else if (dashboardQuery.isPending || dashboardQuery.isLoading) {
      setLoading(true);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [
    dashboardQuery.isSuccess,
    dashboardQuery.isError,
    dashboardQuery.isPending,
    dashboardQuery.isLoading,
    dashboardQuery.data,
  ]);

  const selectedCohortStats = useMemo(() => {
    if (selectedCohortId === 'all' || !dashboardQuery.data) return null;

    const cohortId = parseInt(selectedCohortId, 10);
    return (
      dashboardQuery.data?.your_cohorts.find(
        (cohort: { id: number }) => cohort.id === cohortId
      )?.stats || null
    );
  }, [selectedCohortId, dashboardQuery.data]);

  const stats = useMemo(() => {
    if (!dashboardQuery.data) return initialStats;
    if (selectedCohortId === 'all')
      return dashboardQuery.data.cohorts_aggregated_stats_total;
    if (!selectedCohortStats) return initialStats;

    return selectedCohortStats;
  }, [selectedCohortId, selectedCohortStats, dashboardQuery.data]);

  const conversionRates = useMemo(() => {
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

  const error = dashboardQuery.error ? 'Failed to load dashboard data' : null;

  const averageStats =
    dashboardQuery.data?.cohorts_aggregated_stats_avg || initialStats;
  const maxStats =
    dashboardQuery.data?.cohorts_aggregated_stats_max || initialStats;
  const totalStats =
    dashboardQuery.data?.cohorts_aggregated_stats_total || initialStats;
  const userCohorts = dashboardQuery.data?.your_cohorts || [];

  return {
    stats,
    averageStats,
    maxStats,
    totalStats,
    userCohorts,
    selectedCohortId,
    loading,
    error,
    setSelectedCohortId,
    conversionRates,
  };
};
