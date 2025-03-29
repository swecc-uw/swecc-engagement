import {
  Box,
  Heading,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';

import { useCohortDashboard } from './useCohortDashboard';
import ApplicationStats from './ApplicationStats';
import CohortSelectionBar from './CohortSelectionBar';
import AggregateStatsSelector from './AggregateStatsSelector';
import { useState, useEffect, useCallback } from 'react';
import { AggregateType } from './cohortDashboardTypes';

interface CohortDashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  isLoading: boolean;
}

const CohortDashboardLayout = ({
  children,
  title,
}: CohortDashboardLayoutProps) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  return (
    <Box
      bg={bgColor}
      p={{ base: 4, md: 6 }}
      borderRadius="lg"
      boxShadow="lg"
      transition="all 0.3s ease"
    >
      <Heading as="h2" size="lg" mb={6} color={textColor}>
        {title}
      </Heading>
      {children}
    </Box>
  );
};

const CohortStatsDashboard = () => {
  const {
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
  } = useCohortDashboard();

  const [selectedAggregateType, setSelectedAggregateType] =
    useState<AggregateType>('total');

  const alertBgColor = useColorModeValue('red.50', 'red.900');
  const alertTitleColor = useColorModeValue('red.500', 'red.300');
  const alertTextColor = useColorModeValue('red.600', 'red.200');

  const selectedCohort =
    selectedCohortId !== 'all'
      ? userCohorts.find((c) => c.id === parseInt(selectedCohortId, 10))
      : null;

  const handleAggregateTypeChange = useCallback((type: AggregateType) => {
    setSelectedAggregateType(type);
  }, []);

  useEffect(() => {
    if (selectedCohortId !== 'all') {
      setSelectedAggregateType('total');
    }
  }, [selectedCohortId]);

  const displayStats =
    selectedCohortId === 'all'
      ? selectedAggregateType === 'total'
        ? totalStats
        : selectedAggregateType === 'average'
        ? averageStats
        : maxStats
      : stats;

  const comparisonStats =
    selectedCohortId === 'all' ? averageStats : averageStats;

  const dashboardTitle =
    selectedCohortId === 'all'
      ? selectedAggregateType === 'total'
        ? 'Cohort Totals'
        : selectedAggregateType === 'average'
        ? 'Member Averages'
        : selectedAggregateType === 'max'
        ? 'Member Maximums'
        : ''
      : selectedCohort?.name || 'Cohort Statistics';

  return (
    <CohortDashboardLayout title={dashboardTitle} isLoading={loading}>
      <CohortSelectionBar
        cohorts={userCohorts}
        selectedCohortId={selectedCohortId}
        onCohortSelect={setSelectedCohortId}
        loading={loading}
      />

      {selectedCohortId === 'all' && (
        <AggregateStatsSelector
          selectedAggregateType={selectedAggregateType}
          onAggregateTypeChange={handleAggregateTypeChange}
        />
      )}

      {error && (
        <Alert status="error" mb={6} borderRadius="md" bg={alertBgColor}>
          <AlertIcon />
          <AlertTitle color={alertTitleColor}>Error!</AlertTitle>
          <AlertDescription color={alertTextColor}>{error}</AlertDescription>
        </Alert>
      )}

      <ApplicationStats
        loading={loading}
        error={error}
        stats={displayStats}
        selectedCohortId={selectedCohortId}
        averageStats={comparisonStats}
        conversionRates={conversionRates}
        aggregateType={selectedAggregateType}
      />
    </CohortDashboardLayout>
  );
};

export default CohortStatsDashboard;
