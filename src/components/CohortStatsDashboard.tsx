import { useState, useRef, useEffect } from 'react';
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Button,
  ButtonGroup,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { CalendarIcon, StarIcon, TriangleUpIcon } from '@chakra-ui/icons';
import { format } from 'date-fns';

import api from '../services/api';
import { getCohortStats, getCohorts } from '../services/cohort';
import { CohortView } from '../types';
import { useAuth } from '../hooks/useAuth';

interface Ring {
  name: string;
  value: number;
  total: number;
  color: string;
  radius: number;
  tooltip: string;
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
        const dashoffset =
          circumference * (1 - ring.value / Math.max(ring.total, 1));

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
              style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
              opacity={0.9}
            />
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
  allCohorts,
  selectedCohortId,
  onCohortSelect,
}: {
  cohorts: CohortView[];
  allCohorts: CohortView[];
  selectedCohortId: string;
  onCohortSelect: (id: string) => void;
}) => (
  <Box mb={6} overflowX="auto">
    <Wrap spacing={3} justify="center">
      <WrapItem>
        <Button
          colorScheme="blue"
          variant={selectedCohortId === 'all' ? 'solid' : 'ghost'}
          onClick={() => onCohortSelect('all')}
          size="md"
          borderRadius="full"
          px={6}
          _active={{
            transform: 'scale(0.95)',
          }}
          fontWeight={selectedCohortId === 'all' ? 'bold' : 'medium'}
        >
          All Cohorts
        </Button>
      </WrapItem>
      {cohorts.map((cohort) => (
        <WrapItem key={cohort.id}>
          <Button
            colorScheme="blue"
            variant={selectedCohortId === cohort.id.toString() ? 'solid' : 'ghost'}
            onClick={() => onCohortSelect(cohort.id.toString())}
            size="md"
            borderRadius="full"
            px={6}
            _active={{
              transform: 'scale(0.95)',
            }}
            fontWeight={selectedCohortId === cohort.id.toString() ? 'bold' : 'medium'}
          >
            {cohort.name}
            <Badge 
              ml={2} 
              colorScheme="blue"
              borderRadius="full"
              px={2}
            >
              {cohort.members.length}
            </Badge>
          </Button>
        </WrapItem>
      ))}
      {cohorts.length === 0 && (
        <WrapItem>
          <Text fontSize="md" color="gray.500" ml={2}>
            You are not currently part of any cohorts
          </Text>
        </WrapItem>
      )}
    </Wrap>
  </Box>
);

// Base layout wrapper
const DashboardLayout = ({ 
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
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  
  return (
    <Box
      bg={bgColor}
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
};

const CohortStatsDashboard = () => {
  const { member } = useAuth();
  const [stats, setStats] = useState({
    applications: 0,
    onlineAssessments: 0,
    interviews: 0,
    offers: 0,
    dailyChecks: 0,
    streak: 0,
  });

  const [allCohorts, setAllCohorts] = useState<CohortView[]>([]);
  const [userCohorts, setUserCohorts] = useState<CohortView[]>([]);
  const [selectedCohortId, setSelectedCohortId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    show: false,
    content: '',
    x: 0,
    y: 0,
    width: 0,
  });

  const bgColor = useColorModeValue('gray.50', 'gray.600');

  // Calculate conversion rates
  const conversionRates = {
    assessmentRate:
      stats.applications > 0
        ? ((stats.onlineAssessments / stats.applications) * 100).toFixed(1)
        : 0,
    interviewRate:
      stats.onlineAssessments > 0
        ? ((stats.interviews / stats.onlineAssessments) * 100).toFixed(1)
        : 0,
    offerRate:
      stats.interviews > 0
        ? ((stats.offers / stats.interviews) * 100).toFixed(1)
        : 0,
    overallRate:
      stats.applications > 0
        ? ((stats.offers / stats.applications) * 100).toFixed(1)
        : 0,
  };

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [statsData, cohortsData] = await Promise.all([
          getCohortStats(selectedCohortId === 'all' ? undefined : selectedCohortId),
          getCohorts(),
        ]);

        if (statsData) {
          if (selectedCohortId === 'all' && Array.isArray(statsData)) {
            // When viewing all cohorts, find the highest streak and sum up other stats
            const highestStreak = Math.max(...statsData.map(data => data.stats?.streak || 0));
            const totalCheckins = statsData.reduce((sum, data) => sum + (data.stats?.dailyChecks || 0), 0);
            const combinedStats = statsData.reduce((acc, data) => ({
              applications: acc.applications + (data.stats?.applications || 0),
              onlineAssessments: acc.onlineAssessments + (data.stats?.onlineAssessments || 0),
              interviews: acc.interviews + (data.stats?.interviews || 0),
              offers: acc.offers + (data.stats?.offers || 0),
              streak: highestStreak,
              dailyChecks: totalCheckins,
            }), {
              applications: 0,
              onlineAssessments: 0,
              interviews: 0,
              offers: 0,
              streak: 0,
              dailyChecks: 0,
            });
            setStats(combinedStats);
          } else {
            const statsToUse = Array.isArray(statsData) ? statsData[0]?.stats : statsData.stats;
            if (statsToUse) {
              setStats(statsToUse);
            } else {
              setStats({
                applications: 0,
                onlineAssessments: 0,
                interviews: 0,
                offers: 0,
                dailyChecks: 0,
                streak: 0,
              });
            }
          }
        }

        setAllCohorts(cohortsData);
        
        // Filter cohorts to only include those where the current user is a member
        const filteredUserCohorts = cohortsData.filter(cohort => 
          cohort.members.some(m => m.id === member?.id)
        );
        setUserCohorts(filteredUserCohorts);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(JSON.stringify(err));
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCohortId, member?.id]);

  const getTextWidth = (text: string) => {
    return text.length * 7;
  };

  const handleShowTooltip = (ring: Ring) => {
    const tooltipWidth = getTextWidth(ring.tooltip);
    setTooltip({
      show: true,
      content: ring.tooltip,
      x: 150,
      y: 150 - ring.radius,
      width: tooltipWidth,
    });
  };

  const handleHideTooltip = () => {
    setTooltip({ show: false, content: '', x: 0, y: 0, width: 0 });
  };

  const rings = [
    {
      name: 'Applications',
      value: stats.applications,
      total: Math.max(stats.applications, 50),
      color: '#fc0d1b',
      radius: 120,
      tooltip: `Applications: ${stats.applications.toLocaleString()} total applications submitted`,
    },
    {
      name: 'Assessments',
      value: stats.onlineAssessments,
      total: stats.applications,
      color: '#ffcc01',
      radius: 90,
      tooltip: `Assessments: ${stats.onlineAssessments.toLocaleString()} out of ${stats.applications.toLocaleString()} applications (${
        conversionRates.assessmentRate
      }%)`,
    },
    {
      name: 'Interviews',
      value: stats.interviews,
      total: stats.onlineAssessments,
      color: '#00d77a',
      radius: 60,
      tooltip: `Interviews: ${stats.interviews.toLocaleString()} out of ${stats.onlineAssessments.toLocaleString()} assessments (${
        conversionRates.interviewRate
      }%)`,
    },
    {
      name: 'Offers',
      value: stats.offers,
      total: stats.interviews,
      color: '#0b84fe',
      radius: 30,
      tooltip: `Offers: ${stats.offers.toLocaleString()} out of ${stats.interviews.toLocaleString()} interviews (${
        conversionRates.offerRate
      }%)`,
    },
  ];

  const renderDashboardContent = () => {
    if (loading) {
      return (
        <Center h="400px">
          <Spinner size="xl" />
        </Center>
      );
    }

    if (error) {
      return (
        <Center h="400px">
          <Text color="red.500">Error loading data: {error}</Text>
        </Center>
      );
    }

    return (
      <>
        <Heading as="h2" size="lg" mb={6}>
          Application Stats
        </Heading>

        {/* Summary Cards */}
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={6}>
          <ChakraCard>
            <CardBody>
              <Flex align="center">
                <Center bg="blue.100" p={3} borderRadius="full" mr={4}>
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
                <Center bg="green.100" p={3} borderRadius="full" mr={4}>
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
                <Center bg="purple.100" p={3} borderRadius="full" mr={4}>
                  <CalendarIcon boxSize={6} color="purple.600" />
                </Center>
                <Box>
                  <Text color="gray.500" fontSize="sm">
                    {selectedCohortId === 'all' ? 'Highest Streak' : 'Current Streak'}
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

        {/* Fitness Rings Chart */}
        <ChakraCard mb={6}>
          <CardBody>
            <Heading as="h2" size="md" mb={4}>
              Application Funnel
            </Heading>
            <Flex direction={{ base: 'column', md: 'row' }} align="center">
              <Flex
                justify="center"
                w={{ base: 'full', md: '50%' }}
                position="relative"
              >
                <FitnessRings
                  rings={rings}
                  tooltip={tooltip}
                  onShowTooltip={handleShowTooltip}
                  onHideTooltip={handleHideTooltip}
                />
                <Text textAlign="center" mt={2} fontSize="sm" color="gray.500">
                  Hover over rings for details
                </Text>
              </Flex>
              <Box w={{ base: 'full', md: '50%' }} mt={{ base: 4, md: 0 }}>
                <VStack spacing={4} align="stretch">
                  {rings.map((ring, index) => (
                    <Flex key={index} align="center">
                      <Box
                        w="4"
                        h="4"
                        borderRadius="full"
                        mr={2}
                        bg={ring.color}
                      ></Box>
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

        {/* Conversion Rates */}
        <ChakraCard>
          <CardBody>
            <Heading as="h2" size="md" mb={4}>
              Conversion Rates
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4}>
              <Box p={3} border="1px" borderColor="gray.200" borderRadius="lg">
                <Text fontSize="sm" color="gray.500">
                  Application → Assessment
                </Text>
                <Text fontSize="xl" fontWeight="bold">
                  {conversionRates.assessmentRate}%
                </Text>
              </Box>
              <Box p={3} border="1px" borderColor="gray.200" borderRadius="lg">
                <Text fontSize="sm" color="gray.500">
                  Assessment → Interview
                </Text>
                <Text fontSize="xl" fontWeight="bold">
                  {conversionRates.interviewRate}%
                </Text>
              </Box>
              <Box p={3} border="1px" borderColor="gray.200" borderRadius="lg">
                <Text fontSize="sm" color="gray.500">
                  Interview → Offer
                </Text>
                <Text fontSize="xl" fontWeight="bold">
                  {conversionRates.offerRate}%
                </Text>
              </Box>
              <Box
                p={3}
                border="1px"
                borderColor="gray.200"
                borderRadius="lg"
                bg={bgColor}
              >
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
      </>
    );
  };

  return (
    <DashboardLayout
      cohorts={userCohorts}
      allCohorts={allCohorts}
      selectedCohortId={selectedCohortId}
      onCohortSelect={setSelectedCohortId}
    >
      {renderDashboardContent()}
    </DashboardLayout>
  );
};

export default CohortStatsDashboard;