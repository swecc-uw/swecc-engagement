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
  useColorModeValue as chakraUseColorModeValue,
  Spinner,
} from '@chakra-ui/react';
import { CalendarIcon, StarIcon, TriangleUpIcon } from '@chakra-ui/icons';

import api from '../services/api';
import { getCohortStats } from '../services/cohort';

const CohortStatsDashboard = () => {
  // State for dashboard data
  const [stats, setStats] = useState({
    applications: 0,
    onlineAssessments: 0,
    interviews: 0,
    offers: 0,
    dailyChecks: 0,
    streak: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for tooltip
  const [tooltip, setTooltip] = useState({
    show: false,
    content: '',
    x: 0,
    y: 0,
    width: 0,
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const data = await getCohortStats();

        // TODO: we should support multiple components
        if (data && data.length > 0 && data[0].stats) {
          setStats(data[0].stats);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(JSON.stringify(err));
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  // SVG fitness rings component with fixed tooltips
  const FitnessRings = () => {
    const centerX = 150;
    const centerY = 150;
    const ringWidth = 20;
    const svgRef = useRef(null);

    // Calculate radii for nested rings
    const outerRadius = 120;
    const radiusDecrement = ringWidth + 10;

    // Define rings configuration
    const rings = [
      {
        name: 'Applications',
        value: stats.applications,
        total: Math.max(stats.applications, 50),
        color: '#fc0d1b',
        radius: outerRadius,
        tooltip: `Applications: ${stats.applications.toLocaleString()} total applications submitted`,
      },
      {
        name: 'Assessments',
        value: stats.onlineAssessments,
        total: stats.applications,
        color: '#ffcc01',
        radius: outerRadius - radiusDecrement,
        tooltip: `Assessments: ${stats.onlineAssessments.toLocaleString()} out of ${stats.applications.toLocaleString()} applications (${
          conversionRates.assessmentRate
        }%)`,
      },
      {
        name: 'Interviews',
        value: stats.interviews,
        total: stats.onlineAssessments,
        color: '#00d77a',
        radius: outerRadius - radiusDecrement * 2,
        tooltip: `Interviews: ${stats.interviews.toLocaleString()} out of ${stats.onlineAssessments.toLocaleString()} assessments (${
          conversionRates.interviewRate
        }%)`,
      },
      {
        name: 'Offers',
        value: stats.offers,
        total: stats.interviews,
        color: '#0b84fe',
        radius: outerRadius - radiusDecrement * 3,
        tooltip: `Offers: ${stats.offers.toLocaleString()} out of ${stats.interviews.toLocaleString()} interviews (${
          conversionRates.offerRate
        }%)`,
      },
    ];

    // Calculate text width for tooltip based on content
    const getTextWidth = (text: string) => {
      return text.length * 7; // Approximate width based on characters
    };

    interface Ring {
      name: string;
      value: number;
      total: number;
      color: string;
      radius: number;
      tooltip: string;
    }

    interface Tooltip {
      show: boolean;
      content: string;
      x: number;
      y: number;
      width: number;
    }

    const handleShowTooltip = (ring: Ring) => {
      const tooltipWidth = getTextWidth(ring.tooltip);
      setTooltip({
        show: true,
        content: ring.tooltip,
        x: centerX,
        y: centerY - ring.radius,
        width: tooltipWidth,
      });
    };

    const handleHideTooltip = () => {
      setTooltip({ show: false, content: '', x: 0, y: 0, width: 0 });
    };

    return (
      <svg width="300" height="300" viewBox="0 0 300 300" ref={svgRef}>
        {rings.map((ring, index) => {
          const radius = ring.radius;
          const circumference = 2 * Math.PI * radius;
          const dashoffset =
            circumference * (1 - ring.value / Math.max(ring.total, 1));

          return (
            <g key={index}>
              {/* Background ring */}
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke={chakraUseColorModeValue('#e2e8f0', '#2D3748')}
                strokeWidth={ringWidth}
              />
              {/* Progress ring with hover effects */}
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
                onMouseEnter={() => handleShowTooltip(ring)}
                onMouseLeave={handleHideTooltip}
                style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
                opacity={0.9}
              />
            </g>
          );
        })}

        {/* Fixed Position Tooltip */}
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
    <Box
      bg={chakraUseColorModeValue('gray.50', 'gray.700')}
      p={6}
      borderRadius="lg"
      boxShadow="lg"
    >
      <Heading as="h1" size="xl" textAlign="center" mb={6}>
        Cohort Dashboard
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
                  Current Streak
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
              <FitnessRings />
              <Text textAlign="center" mt={2} fontSize="sm" color="gray.500">
                Hover over rings for details
              </Text>
            </Flex>
            <Box w={{ base: 'full', md: '50%' }} mt={{ base: 4, md: 0 }}>
              <VStack spacing={4} align="stretch">
                {[
                  {
                    name: 'Applications',
                    color: '#fc0d1b',
                    value: stats.applications,
                  },
                  {
                    name: 'Assessments',
                    color: '#ffcc01',
                    value: stats.onlineAssessments,
                  },
                  {
                    name: 'Interviews',
                    color: '#00d77a',
                    value: stats.interviews,
                  },
                  { name: 'Offers', color: '#0b84fe', value: stats.offers },
                ].map((item, index) => (
                  <Flex key={index} align="center">
                    <Box
                      w="4"
                      h="4"
                      borderRadius="full"
                      mr={2}
                      bg={item.color}
                    ></Box>
                    <Text fontSize="sm" fontWeight="medium">
                      {item.name}
                    </Text>
                    <Text ml="auto" fontWeight="bold">
                      {item.value.toLocaleString()}
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
              bg={chakraUseColorModeValue('gray.50', 'gray.600')}
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
    </Box>
  );
};

export default CohortStatsDashboard;