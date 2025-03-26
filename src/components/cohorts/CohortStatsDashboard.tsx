import {
  Box,
  Text,
  useColorModeValue,
  Badge,
  Button,
  Wrap,
  WrapItem,
  Heading,
} from '@chakra-ui/react';

import { CohortView } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useCohortStats } from '../../hooks/useCohortStats';
import ApplicationStats from './ApplicationStats';
import MyCohortView from './MyCohortView';
import CohortList from './CohortList';

// Cohort Selection Bar Component
const CohortSelectionBar = ({
  cohorts,
  selectedCohortId,
  onCohortSelect,
}: {
  cohorts: CohortView[];
  allCohorts: CohortView[];
  selectedCohortId: string;
  onCohortSelect: (id: string) => void;
}) => {
  const buttonStyles = {
    size: 'md',
    borderRadius: 'md',
    px: 6,
    _active: { opacity: 0.8 },
    transition: 'all 0.2s',
    fontWeight: 'bold',
  };

  return (
    <Box mb={6} overflowX="auto">
      <Wrap spacing={3} justify="center">
        <WrapItem>
          <Button
            {...buttonStyles}
            colorScheme="blue"
            variant={selectedCohortId === 'all' ? 'solid' : 'ghost'}
            onClick={() => onCohortSelect('all')}
            _hover={{ bg: selectedCohortId === 'all' ? 'blue.600' : 'blue.50' }}
          >
            <Text as="span" opacity={selectedCohortId === 'all' ? 1 : 0.8}>
              All Cohorts
            </Text>
          </Button>
        </WrapItem>
        {cohorts.map((cohort) => (
          <WrapItem key={cohort.id}>
            <Button
              {...buttonStyles}
              colorScheme="blue"
              variant={
                selectedCohortId === cohort.id.toString() ? 'solid' : 'ghost'
              }
              onClick={() => onCohortSelect(cohort.id.toString())}
              _hover={{
                bg:
                  selectedCohortId === cohort.id.toString()
                    ? 'blue.600'
                    : 'blue.50',
              }}
            >
              <Text
                as="span"
                opacity={selectedCohortId === cohort.id.toString() ? 1 : 0.8}
              >
                {cohort.name}
              </Text>
              <Badge ml={2} colorScheme="blue" borderRadius="full" px={2}>
                {cohort.members?.length || 0}
              </Badge>
            </Button>
          </WrapItem>
        ))}
        {!cohorts?.length && (
          <WrapItem>
            <Text fontSize="md" color="gray.500" ml={2}>
              You are not currently part of any cohorts
            </Text>
          </WrapItem>
        )}
      </Wrap>
    </Box>
  );
};

// Base layout wrapper
const CohortDashboardLayout = ({
  children,
  cohorts,
  allCohorts,
  selectedCohortId,
  onCohortSelect,
}: {
  children: React.ReactNode;
  cohorts: CohortView[];
  allCohorts: CohortView[];
  selectedCohortId: string;
  onCohortSelect: (id: string) => void;
}) => (
  <Box
    bg={useColorModeValue('gray.50', 'gray.700')}
    p={6}
    borderRadius="lg"
    boxShadow="lg"
  >
    <CohortSelectionBar
      cohorts={cohorts}
      allCohorts={allCohorts}
      selectedCohortId={selectedCohortId}
      onCohortSelect={onCohortSelect}
    />
    {children}
  </Box>
);

const CohortStatsDashboard = () => {
  const { member } = useAuth();

  const {
    stats,
    averageStats,
    allCohorts,
    userCohorts,
    selectedCohortId,
    loading,
    error,
    setSelectedCohortId,
    conversionRates,
  } = useCohortStats(member?.id);

  return (
    <CohortDashboardLayout
      cohorts={userCohorts || []}
      allCohorts={allCohorts || []}
      selectedCohortId={selectedCohortId}
      onCohortSelect={setSelectedCohortId}
    >
      <ApplicationStats
        loading={loading}
        error={error}
        stats={stats}
        selectedCohortId={selectedCohortId}
        averageStats={averageStats}
        conversionRates={conversionRates}
      />
      {selectedCohortId === 'all' ? (
        <CohortList cohorts={allCohorts} />
      ) : (
        <MyCohortView
          cohort={allCohorts.find((c) => String(c.id) === selectedCohortId)}
          heading={
            <Heading as="h2" size="lg" mb={6}>
              Members
            </Heading>
          }
        />
      )}
    </CohortDashboardLayout>
  );
};

export default CohortStatsDashboard;
