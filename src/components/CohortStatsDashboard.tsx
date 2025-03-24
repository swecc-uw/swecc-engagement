import { useState, useRef } from 'react';
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
  Badge,
  Button,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { CalendarIcon, StarIcon, TriangleUpIcon } from '@chakra-ui/icons';

import { CohortView } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useCohortStats } from '../hooks/useCohortStats';

interface Ring {
  name: string;
  value: number;
  total: number;
  color: string;
  radius: number;
  tooltip: string;
  exceedsAverage?: boolean;
}

interface TooltipState {
  show: boolean;
  content: string;
  x: number;
  y: number;
  width: number;
}

// Fitness Rings Component
const FitnessRings = ({
  rings,
  tooltip,
  onShowTooltip,
  onHideTooltip,
}: {
  rings: Ring[];
  tooltip: TooltipState;
  onShowTooltip: (ring: Ring) => void;
  onHideTooltip: () => void;
}) => {
  const centerX = 150;
  const centerY = 150;
  const ringWidth = 20;
  const svgRef = useRef(null);
  const bgColor = useColorModeValue('#e2e8f0', '#2D3748');

  return (
    <svg width="300" height="300" viewBox="0 0 300 300" ref={svgRef}>
      {rings.map((ring, index) => {
        const radius = ring.radius;
        const circumference = 2 * Math.PI * radius;
        const normalizedValue = ring.exceedsAverage
          ? (ring.value % ring.total) / ring.total
          : ring.value / ring.total;
        const dashoffset = circumference * (1 - normalizedValue);

        return (
          <g key={index}>
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke={bgColor}
              strokeWidth={ringWidth}
            />
            <circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke={ring.color}
              strokeWidth={ringWidth}
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${centerX} ${centerY})`}
              onMouseEnter={() => onShowTooltip(ring)}
              onMouseLeave={onHideTooltip}
              style={{
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                filter: ring.exceedsAverage
                  ? 'brightness(1.3) drop-shadow(0 0 4px rgba(255,255,255,0.5))'
                  : 'none',
                opacity: 0.9,
              }}
            />
            {ring.exceedsAverage && (
              <text
                x={centerX}
                y={centerY - radius}
                fill="white"
                fontSize="12"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))',
                  paintOrder: 'stroke',
                  stroke: ring.color,
                  strokeWidth: '3px',
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                }}
              >
                {Math.floor(ring.value / ring.total)}x
              </text>
            )}
          </g>
        );
      })}

      {tooltip.show && (
        <g>
          <rect
            x={centerX - tooltip.width / 2}
            y={tooltip.y - 30}
            width={tooltip.width}
            height="24"
            rx="5"
            fill="rgba(0,0,0,0.75)"
          />
          <text
            x={centerX}
            y={tooltip.y - 18}
            textAnchor="middle"
            alignmentBaseline="middle"
            fill="white"
            fontSize="12"
          >
            {tooltip.content}
          </text>
        </g>
      )}
    </svg>
  );
};

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
                {cohort.members.length}
              </Badge>
            </Button>
          </WrapItem>
        ))}
        {!cohorts.length && (
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
    <Heading as="h1" size="xl" textAlign="center" mb={6}>
      Your Cohorts
    </Heading>
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
  const bgColor = useColorModeValue('gray.50', 'gray.600');
  const ringsBgColor = useColorModeValue('gray.50', 'gray.700');

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
          : averageStats.applications,
      color: '#fc0d1b',
      radius: 120,
      tooltip: `Applications: ${stats.applications.toLocaleString()} ${
        selectedCohortId !== 'all'
          ? `(${(
              (stats.applications / averageStats.applications) *
              100
            ).toFixed(1)}% of average)`
          : 'total applications submitted'
      }`,
      exceedsAverage:
        selectedCohortId !== 'all' &&
        stats.applications > averageStats.applications,
    },
    {
      name: 'Assessments',
      value: stats.onlineAssessments,
      total:
        selectedCohortId === 'all'
          ? stats.applications
          : averageStats.onlineAssessments,
      color: '#ffcc01',
      radius: 90,
      tooltip: `Assessments: ${stats.onlineAssessments.toLocaleString()} ${
        selectedCohortId !== 'all'
          ? `(${(
              (stats.onlineAssessments / averageStats.onlineAssessments) *
              100
            ).toFixed(1)}% of average)`
          : `out of ${stats.applications.toLocaleString()} applications (${
              conversionRates.assessmentRate
            }%)`
      }`,
      exceedsAverage:
        selectedCohortId !== 'all' &&
        stats.onlineAssessments > averageStats.onlineAssessments,
    },
    {
      name: 'Interviews',
      value: stats.interviews,
      total:
        selectedCohortId === 'all'
          ? stats.onlineAssessments
          : averageStats.interviews,
      color: '#00d77a',
      radius: 60,
      tooltip: `Interviews: ${stats.interviews.toLocaleString()} ${
        selectedCohortId !== 'all'
          ? `(${((stats.interviews / averageStats.interviews) * 100).toFixed(
              1
            )}% of average)`
          : `out of ${stats.onlineAssessments.toLocaleString()} assessments (${
              conversionRates.interviewRate
            }%)`
      }`,
      exceedsAverage:
        selectedCohortId !== 'all' &&
        stats.interviews > averageStats.interviews,
    },
    {
      name: 'Offers',
      value: stats.offers,
      total:
        selectedCohortId === 'all' ? stats.interviews : averageStats.offers,
      color: '#0b84fe',
      radius: 30,
      tooltip: `Offers: ${stats.offers.toLocaleString()} ${
        selectedCohortId !== 'all'
          ? `(${((stats.offers / averageStats.offers) * 100).toFixed(
              1
            )}% of average)`
          : `out of ${stats.interviews.toLocaleString()} interviews (${
              conversionRates.offerRate
            }%)`
      }`,
      exceedsAverage:
        selectedCohortId !== 'all' && stats.offers > averageStats.offers,
    },
  ];

  const handleShowTooltip = (ring: Ring) => {
    setTooltip({
      show: true,
      content: ring.tooltip,
      x: 150,
      y: 150 - ring.radius,
      width: ring.tooltip.length * 7,
    });
  };

  const handleHideTooltip = () => {
    setTooltip({ show: false, content: '', x: 0, y: 0, width: 0 });
  };

  const renderDashboardContent = () => {
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
                  <Text
                    textAlign="center"
                    mt={2}
                    fontSize="sm"
                    color="gray.500"
                  >
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

  return (
    <CohortDashboardLayout
      cohorts={userCohorts}
      allCohorts={allCohorts}
      selectedCohortId={selectedCohortId}
      onCohortSelect={setSelectedCohortId}
    >
      {renderDashboardContent()}
    </CohortDashboardLayout>
  );
};

export default CohortStatsDashboard;
