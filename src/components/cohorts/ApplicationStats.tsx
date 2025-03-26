import { CalendarIcon, StarIcon, TriangleUpIcon } from '@chakra-ui/icons';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Card as ChakraCard,
  CardBody,
  Center,
  VStack,
  useColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { CohortStats, ConversionRates } from '../../hooks/useCohortStats';
import FitnessRings from './FitnessRings';
import { useState } from 'react';

export interface Ring {
  name: string;
  value: number;
  total: number;
  color: string;
  radius: number;
  tooltip: string;
  exceedsAverage?: boolean;
}

const EPS = 0.0000001;

export interface TooltipState {
  show: boolean;
  content: string;
  x: number;
  y: number;
  width: number;
}

interface ApplicationStatsProps {
  loading: boolean;
  error: string | null;
  selectedCohortId: string;
  stats: CohortStats;
  averageStats: CohortStats;
  conversionRates: ConversionRates;
}

const ApplicationStats = ({
  loading,
  error,
  selectedCohortId,
  stats,
  averageStats,
  conversionRates,
}: ApplicationStatsProps) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const ringsBgColor = useColorModeValue('gray.50', 'gray.700');

  const safeAvgStats = {
    applications: Math.max(averageStats.applications, EPS),
    onlineAssessments: Math.max(averageStats.onlineAssessments, EPS),
    interviews: Math.max(averageStats.interviews, EPS),
    offers: Math.max(averageStats.offers, EPS),
    dailyChecks: averageStats.dailyChecks,
    streak: averageStats.streak,
  };

  const safePercentage = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
  };

  const [tooltip, setTooltip] = useState<TooltipState>({
    show: false,
    content: '',
    x: 0,
    y: 0,
    width: 0,
  });

  const rings = [
    {
      name: 'Applications',
      value: stats.applications,
      total:
        selectedCohortId === 'all'
          ? Math.max(stats.applications, 50)
          : safeAvgStats.applications,
      color: '#fc0d1b',
      radius: 120,
      tooltip: `Applications: ${stats.applications.toLocaleString()} ${
        selectedCohortId !== 'all'
          ? `(${safePercentage(
              stats.applications,
              safeAvgStats.applications
            )}% of average)`
          : 'total applications submitted'
      }`,
      exceedsAverage:
        selectedCohortId !== 'all' &&
        stats.applications > safeAvgStats.applications,
    },
    {
      name: 'Assessments',
      value: stats.onlineAssessments,
      total:
        selectedCohortId === 'all'
          ? Math.max(stats.applications, 1)
          : safeAvgStats.onlineAssessments,
      color: '#ffcc01',
      radius: 90,
      tooltip: `Assessments: ${stats.onlineAssessments.toLocaleString()} ${
        selectedCohortId !== 'all'
          ? `(${safePercentage(
              stats.onlineAssessments,
              safeAvgStats.onlineAssessments
            )}% of average)`
          : `out of ${stats.applications.toLocaleString()} applications (${
              conversionRates.assessmentRate
            }%)`
      }`,
      exceedsAverage:
        selectedCohortId !== 'all' &&
        stats.onlineAssessments > safeAvgStats.onlineAssessments,
    },
    {
      name: 'Interviews',
      value: stats.interviews,
      total:
        selectedCohortId === 'all'
          ? Math.max(stats.onlineAssessments, 1)
          : safeAvgStats.interviews,
      color: '#00d77a',
      radius: 60,
      tooltip: `Interviews: ${stats.interviews.toLocaleString()} ${
        selectedCohortId !== 'all'
          ? `(${safePercentage(
              stats.interviews,
              safeAvgStats.interviews
            )}% of average)`
          : `out of ${stats.onlineAssessments.toLocaleString()} assessments (${
              conversionRates.interviewRate
            }%)`
      }`,
      exceedsAverage:
        selectedCohortId !== 'all' &&
        stats.interviews > safeAvgStats.interviews,
    },
    {
      name: 'Offers',
      value: stats.offers,
      total:
        selectedCohortId === 'all'
          ? Math.max(stats.interviews, 1)
          : safeAvgStats.offers,
      color: '#0b84fe',
      radius: 30,
      tooltip: `Offers: ${stats.offers.toLocaleString()} ${
        selectedCohortId !== 'all'
          ? `(${safePercentage(stats.offers, safeAvgStats.offers)}% of average)`
          : `out of ${stats.interviews.toLocaleString()} interviews (${
              conversionRates.offerRate
            }%)`
      }`,
      exceedsAverage:
        selectedCohortId !== 'all' && stats.offers > safeAvgStats.offers,
    },
  ];

  const handleShowTooltip = (ring: Ring) => {
    const svg = document.querySelector('svg');
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const width = 150;
    const x = rect.left + rect.width / 2 - width / 2;
    const y = rect.top + rect.height / 2;

    setTooltip({ show: true, content: ring.tooltip, x, y, width });
  };

  const handleHideTooltip = () => {
    setTooltip({ ...tooltip, show: false });
  };

  if (loading)
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  if (error)
    return (
      <Center h="400px">
        <Text color="red.500">Error loading data: {error}</Text>
      </Center>
    );

  const cardStyle = {
    p: 3,
    border: '1px',
    borderColor: 'gray.200',
    borderRadius: 'lg',
  };
  const statCardStyle = {
    align: 'center',
    p: 3,
    borderRadius: 'full',
    mr: 4,
  };

  return (
    <>
      <Heading as="h2" size="lg" mb={6}>
        Application Stats
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={6}>
        <ChakraCard>
          <CardBody>
            <Flex align="center">
              <Center {...statCardStyle} bg="blue.100">
                <TriangleUpIcon boxSize={6} color="blue.600" />
              </Center>
              <Box>
                <Text color="gray.500" fontSize="sm">
                  Applications
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {stats.applications.toLocaleString()}
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </ChakraCard>
        <ChakraCard>
          <CardBody>
            <Flex align="center">
              <Center {...statCardStyle} bg="green.100">
                <StarIcon boxSize={6} color="green.600" />
              </Center>
              <Box>
                <Text color="gray.500" fontSize="sm">
                  Offers
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {stats.offers.toLocaleString()}
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </ChakraCard>
        <ChakraCard>
          <CardBody>
            <Flex align="center">
              <Center {...statCardStyle} bg="purple.100">
                <CalendarIcon boxSize={6} color="purple.600" />
              </Center>
              <Box>
                <Text color="gray.500" fontSize="sm">
                  {selectedCohortId === 'all'
                    ? 'Highest Streak'
                    : 'Current Streak'}
                </Text>
                <Text fontSize="2xl" fontWeight="bold">
                  {stats.streak} days
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {stats.dailyChecks} total check-ins
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </ChakraCard>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
        <ChakraCard>
          <CardBody>
            <Heading as="h2" size="md" mb={4}>
              Application Funnel
            </Heading>
            <Flex
              direction={{ base: 'column', md: 'row' }}
              align={{ base: 'center', md: 'flex-start' }}
              justify="center"
              gap={6}
            >
              <Box maxW="300px" w="full">
                <FitnessRings
                  rings={rings}
                  tooltip={tooltip}
                  onShowTooltip={handleShowTooltip}
                  onHideTooltip={handleHideTooltip}
                />
                <Text textAlign="center" mt={2} fontSize="sm" color="gray.500">
                  Hover over rings for details
                </Text>
              </Box>
              <Box w="full" maxW={{ base: '300px', md: '200px' }}>
                <VStack spacing={4} align="stretch" w="full">
                  {rings.map((ring, index) => (
                    <Flex
                      key={index}
                      align="center"
                      p={2}
                      borderRadius="md"
                      bg={ringsBgColor}
                    >
                      <Box
                        w="4"
                        h="4"
                        borderRadius="full"
                        mr={3}
                        bg={ring.color}
                      />
                      <Text fontSize="sm" fontWeight="medium">
                        {ring.name}
                      </Text>
                      <Text ml="auto" fontWeight="bold">
                        {ring.value.toLocaleString()}
                      </Text>
                    </Flex>
                  ))}
                </VStack>
              </Box>
            </Flex>
          </CardBody>
        </ChakraCard>

        <ChakraCard>
          <CardBody>
            <Heading as="h2" size="md" mb={4}>
              Conversion Rates
            </Heading>
            <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
              <Box {...cardStyle}>
                <Text fontSize="sm" color="gray.500">
                  Application → Assessment
                </Text>
                <Text fontSize="xl" fontWeight="bold">
                  {conversionRates.assessmentRate}%
                </Text>
              </Box>
              <Box {...cardStyle}>
                <Text fontSize="sm" color="gray.500">
                  Assessment → Interview
                </Text>
                <Text fontSize="xl" fontWeight="bold">
                  {conversionRates.interviewRate}%
                </Text>
              </Box>
              <Box {...cardStyle}>
                <Text fontSize="sm" color="gray.500">
                  Interview → Offer
                </Text>
                <Text fontSize="xl" fontWeight="bold">
                  {conversionRates.offerRate}%
                </Text>
              </Box>
              <Box {...cardStyle} bg={bgColor}>
                <Text fontSize="sm" color="gray.500">
                  Overall Success Rate
                </Text>
                <Text fontSize="xl" fontWeight="bold">
                  {conversionRates.overallRate}%
                </Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </ChakraCard>
      </SimpleGrid>
    </>
  );
};

export default ApplicationStats;
