import { useState, useEffect } from 'react';
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
  const [stats, setStats] = useState(initialStats);
  const [averageStats, setAverageStats] = useState(initialStats);
  const [{ allCohorts, userCohorts }, setCohortsData] = useState<{
    allCohorts: CohortView[];
    userCohorts: CohortView[];
  }>({ allCohorts: [], userCohorts: [] });
  const [selectedCohortId, setSelectedCohortId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const conversionRates = {
    assessmentRate:
      stats.applications > 0
        ? ((stats.onlineAssessments / stats.applications) * 100).toFixed(1)
        : '0',
    interviewRate:
      stats.onlineAssessments > 0
        ? ((stats.interviews / stats.onlineAssessments) * 100).toFixed(1)
        : '0',
    offerRate:
      stats.interviews > 0
        ? ((stats.offers / stats.interviews) * 100).toFixed(1)
        : '0',
    overallRate:
      stats.applications > 0
        ? ((stats.offers / stats.applications) * 100).toFixed(1)
        : '0',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, cohortsData] = await Promise.all([
          getCohortStats(
            selectedCohortId === 'all' ? undefined : selectedCohortId
          ),
          getCohorts(),
        ]);

        if (statsData) {
          if (selectedCohortId === 'all' && Array.isArray(statsData)) {
            const totalCohorts = statsData.length;
            const avgStats = statsData.reduce(
              (acc, data) => ({
                applications:
                  acc.applications + (data.stats?.applications || 0),
                onlineAssessments:
                  acc.onlineAssessments + (data.stats?.onlineAssessments || 0),
                interviews: acc.interviews + (data.stats?.interviews || 0),
                offers: acc.offers + (data.stats?.offers || 0),
                streak: Math.max(acc.streak, data.stats?.streak || 0),
                dailyChecks: acc.dailyChecks + (data.stats?.dailyChecks || 0),
              }),
              { ...initialStats }
            );

            setAverageStats({
              ...avgStats,
              applications: Math.round(avgStats.applications / totalCohorts),
              onlineAssessments: Math.round(
                avgStats.onlineAssessments / totalCohorts
              ),
              interviews: Math.round(avgStats.interviews / totalCohorts),
              offers: Math.round(avgStats.offers / totalCohorts),
              dailyChecks: Math.round(avgStats.dailyChecks / totalCohorts),
            });
            setStats(avgStats);
          } else {
            const statsToUse = Array.isArray(statsData)
              ? statsData[0]?.stats
              : statsData.stats;
            setStats(statsToUse || initialStats);
          }
        }

        setCohortsData({
          allCohorts: cohortsData,
          userCohorts: cohortsData.filter((cohort) =>
            cohort.members.some((m) => m.id === memberId)
          ),
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCohortId, memberId]);

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
