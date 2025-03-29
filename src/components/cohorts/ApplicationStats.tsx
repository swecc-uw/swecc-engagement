import { CalendarIcon, StarIcon, TriangleUpIcon } from '@chakra-ui/icons';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Card,
  CardBody,
  Center,
  VStack,
  useColorModeValue,
  Skeleton,
  Tooltip,
  Badge,
} from '@chakra-ui/react';
import { memo, useState, useCallback } from 'react';
import FitnessRings from './FitnessRings';
import {
  CohortStats,
  ConversionRates,
  Ring,
  TooltipState,
  AggregateType,
} from './cohortDashboardTypes';
import { getSafeStats, safePercentage, formatNumber } from './cohortDashboardUtils';

interface ApplicationStatsProps {
  loading: boolean;
  error: string | null;
  selectedCohortId: string;
  stats: CohortStats;
  averageStats: CohortStats;
  conversionRates: ConversionRates;
  aggregateType?: AggregateType;
}

const ApplicationStats = ({
  loading,
  error,
  selectedCohortId,
  stats,
  averageStats,
  conversionRates,
  aggregateType = 'total',
}: ApplicationStatsProps) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
  const accentColor = useColorModeValue('blue.600', 'blue.300');
  const errorBgColor = useColorModeValue('red.50', 'red.900');
  const errorBorderColor = useColorModeValue('red.300', 'red.700');
  const errorTextColor = useColorModeValue('red.500', 'red.300');
  const errorDetailColor = useColorModeValue('red.600', 'red.200');
  const iconBlueColor = useColorModeValue('blue.600', 'blue.300');
  const iconGreenColor = useColorModeValue('green.600', 'green.300');
  const iconPurpleColor = useColorModeValue('purple.600', 'purple.300');
  const blueHoverBorderColor = useColorModeValue('blue.200', 'blue.600');
  const yellowHoverBorderColor = useColorModeValue('yellow.200', 'yellow.600');
  const greenHoverBorderColor = useColorModeValue('green.200', 'green.600');
  const cardBlueBgColor = useColorModeValue('blue.100', 'blue.900');
  const cardGreenBgColor = useColorModeValue('green.100', 'green.900');
  const cardPurpleBgColor = useColorModeValue('purple.100', 'purple.900');
  const accentBgHover = useColorModeValue(
    `rgba(66, 153, 225, 0.1)`,
    `rgba(144, 205, 244, 0.3)`
  );

  const safeAvgStats = getSafeStats(averageStats);

  const [tooltip, setTooltip] = useState<TooltipState>({
    show: false,
    content: '',
    x: 0,
    y: 0,
    width: 0,
  });

  const [containerWidth, setContainerWidth] = useState<number>(0);

  const containerRef = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      setContainerWidth(node.getBoundingClientRect().width);
    }
  }, []);

  const flexDirection = containerWidth > 700 ? 'row' : 'column';

  const handleShowTooltip = useCallback((ring: Ring) => {
    const svg = document.querySelector('svg');
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const width = 150;
    const x = rect.left + rect.width / 2 - width / 2;
    const y = rect.top + rect.height / 2;

    setTooltip({ show: true, content: ring.tooltip, x, y, width });
  }, []);

  const handleHideTooltip = useCallback(() => {
    setTooltip((prev) => ({ ...prev, show: false }));
  }, []);

  const rings: Ring[] = [
    {
      name: 'Applications',
      value: stats.applications,
      total:
        selectedCohortId === 'all'
          ? Math.max(stats.applications, 50)
          : safeAvgStats.applications,
      color: '#fc0d1b',
      radius: 120,
      tooltip: `Applications: ${formatNumber(stats.applications)} ${
        selectedCohortId !== 'all'
          ? `(${safePercentage(
              stats.applications,
              safeAvgStats.applications
            )}% of average)`
          : aggregateType === 'total'
          ? 'total applications submitted'
          : aggregateType === 'average'
          ? 'average applications per cohort'
          : 'maximum applications in any cohort'
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
      tooltip: `Assessments: ${formatNumber(stats.onlineAssessments)} ${
        selectedCohortId !== 'all'
          ? `(${safePercentage(
              stats.onlineAssessments,
              safeAvgStats.onlineAssessments
            )}% of average)`
          : `out of ${formatNumber(stats.applications)} applications (${
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
      tooltip: `Interviews: ${formatNumber(stats.interviews)} ${
        selectedCohortId !== 'all'
          ? `(${safePercentage(
              stats.interviews,
              safeAvgStats.interviews
            )}% of average)`
          : `out of ${formatNumber(stats.onlineAssessments)} assessments (${
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
      tooltip: `Offers: ${formatNumber(stats.offers)} ${
        selectedCohortId !== 'all'
          ? `(${safePercentage(stats.offers, safeAvgStats.offers)}% of average)`
          : `out of ${formatNumber(stats.interviews)} interviews (${
              conversionRates.offerRate
            }%)`
      }`,
      exceedsAverage:
        selectedCohortId !== 'all' && stats.offers > safeAvgStats.offers,
    },
  ];

  const cardStyle = {
    p: 3,
    border: '1px',
    borderColor: borderColor,
    borderRadius: 'lg',
    transition: 'all 0.2s',
    _hover: { transform: 'translateY(-2px)', shadow: 'md' },
  };

  const statCardStyle = {
    align: 'center',
    p: 3,
    borderRadius: 'full',
    mr: 4,
    transition: 'all 0.2s ease',
  };

  if (loading) {
    return (
      <Box>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={6}>
          {[1, 2, 3].map((i) => (
            <Card key={i} bg={cardBgColor}>
              <CardBody>
                <Skeleton height="80px" />
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
        <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
          <Card bg={cardBgColor}>
            <CardBody>
              <Skeleton height="300px" />
            </CardBody>
          </Card>
          <Card bg={cardBgColor}>
            <CardBody>
              <Skeleton height="300px" />
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>
    );
  }

  if (error) {
    return (
      <Center h="400px">
        <Card
          p={6}
          bgColor={errorBgColor}
          borderColor={errorBorderColor}
          borderWidth="1px"
        >
          <CardBody>
            <Flex direction="column" align="center">
              <Text
                fontSize="lg"
                fontWeight="bold"
                color={errorTextColor}
                mb={2}
              >
                Error loading data
              </Text>
              <Text color={errorDetailColor}>{error}</Text>
            </Flex>
          </CardBody>
        </Card>
      </Center>
    );
  }

  return (
    <Box>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={6}>
        <Card bg={cardBgColor}>
          <CardBody>
            <Flex align="center">
              <Center
                {...statCardStyle}
                bg={cardBlueBgColor}
                _hover={{ transform: 'scale(1.05)' }}
              >
                <TriangleUpIcon boxSize={6} color={iconBlueColor} />
              </Center>
              <Box>
                <Text color={secondaryTextColor} fontSize="sm">
                  Applications
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                  {formatNumber(stats.applications)}
                </Text>
                {selectedCohortId === 'all' && (
                  <Text fontSize="xs" color={secondaryTextColor}>
                    {aggregateType === 'total'
                      ? 'Total across all cohorts'
                      : aggregateType === 'average'
                      ? 'Average per cohort'
                      : 'Maximum in any cohort'}
                  </Text>
                )}
                {stats.applications > safeAvgStats.applications &&
                  selectedCohortId !== 'all' && (
                    <Badge colorScheme="green" mt={1}>
                      Above average
                    </Badge>
                  )}
              </Box>
            </Flex>
          </CardBody>
        </Card>
        <Card bg={cardBgColor}>
          <CardBody>
            <Flex align="center">
              <Center
                {...statCardStyle}
                bg={cardGreenBgColor}
                _hover={{ transform: 'scale(1.05)' }}
              >
                <StarIcon boxSize={6} color={iconGreenColor} />
              </Center>
              <Box>
                <Text color={secondaryTextColor} fontSize="sm">
                  Offers
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                  {formatNumber(stats.offers)}
                </Text>
                {selectedCohortId === 'all' && (
                  <Text fontSize="xs" color={secondaryTextColor}>
                    {aggregateType === 'total'
                      ? 'Total across all cohorts'
                      : aggregateType === 'average'
                      ? 'Average per cohort'
                      : 'Maximum in any cohort'}
                  </Text>
                )}
                {stats.offers > safeAvgStats.offers &&
                  selectedCohortId !== 'all' && (
                    <Badge colorScheme="green" mt={1}>
                      Above average
                    </Badge>
                  )}
              </Box>
            </Flex>
          </CardBody>
        </Card>
        <Card bg={cardBgColor}>
          <CardBody>
            <Flex align="center">
              <Center
                {...statCardStyle}
                bg={cardPurpleBgColor}
                _hover={{ transform: 'scale(1.05)' }}
              >
                <CalendarIcon boxSize={6} color={iconPurpleColor} />
              </Center>
              <Box>
                <Text color={secondaryTextColor} fontSize="sm">
                  {selectedCohortId === 'all' ? 'Streak' : 'Current Streak'}
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                  {stats.streak} days
                </Text>
                <Text fontSize="xs" color={secondaryTextColor}>
                  {selectedCohortId === 'all'
                    ? aggregateType === 'total'
                      ? 'Sum of all cohort streaks'
                      : aggregateType === 'average'
                      ? 'Average streak length'
                      : 'Longest streak'
                    : `${stats.dailyChecks} total check-ins`}
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
        <Card bg={cardBgColor}>
          <CardBody ref={containerRef}>
            <Heading as="h2" size="md" mb={4} color={textColor}>
              Application Funnel
            </Heading>
            <Flex
              direction={flexDirection}
              align="center"
              justify="center"
              gap={6}
              wrap={flexDirection === 'row' ? 'wrap' : 'nowrap'}
            >
              <Box
                maxW={flexDirection === 'row' ? '50%' : '300px'}
                w={flexDirection === 'row' ? 'auto' : 'full'}
                minW="250px"
              >
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
                  color={secondaryTextColor}
                >
                  Hover over rings for details
                </Text>
              </Box>
              <Box
                w={flexDirection === 'row' ? 'auto' : 'full'}
                maxW={
                  flexDirection === 'row'
                    ? '50%'
                    : { base: '300px', md: '200px' }
                }
                flexGrow={flexDirection === 'row' ? 1 : 0}
              >
                <VStack spacing={4} align="stretch" w="full">
                  {rings.map((ring, index) => (
                    <Tooltip
                      key={index}
                      label={ring.tooltip}
                      placement="right"
                      hasArrow
                    >
                      <Flex
                        align="center"
                        p={2}
                        borderRadius="md"
                        bg={bgColor}
                        _hover={{
                          shadow: 'md',
                          transform: 'translateX(2px)',
                        }}
                        transition="all 0.2s"
                        cursor="pointer"
                      >
                        <Box
                          w="4"
                          h="4"
                          borderRadius="full"
                          mr={3}
                          bg={ring.color}
                        />
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color={textColor}
                        >
                          {ring.name}
                        </Text>
                        <Text ml="auto" fontWeight="bold" color={textColor}>
                          {formatNumber(ring.value)}
                        </Text>
                        {ring.exceedsAverage && (
                          <Badge
                            ml={2}
                            colorScheme="green"
                            fontSize="xs"
                            variant="outline"
                          >
                            +
                          </Badge>
                        )}
                      </Flex>
                    </Tooltip>
                  ))}
                </VStack>
              </Box>
            </Flex>
          </CardBody>
        </Card>

        <Card bg={cardBgColor}>
          <CardBody>
            <Heading as="h2" size="md" mb={4} color={textColor}>
              Conversion Rates
            </Heading>
            <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
              <Box
                {...cardStyle}
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'md',
                  borderColor: blueHoverBorderColor,
                }}
              >
                <Text fontSize="sm" color={secondaryTextColor}>
                  Application → Assessment
                </Text>
                <Text fontSize="xl" fontWeight="bold" color={textColor}>
                  {conversionRates.assessmentRate}%
                </Text>
              </Box>
              <Box
                {...cardStyle}
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'md',
                  borderColor: yellowHoverBorderColor,
                }}
              >
                <Text fontSize="sm" color={secondaryTextColor}>
                  Assessment → Interview
                </Text>
                <Text fontSize="xl" fontWeight="bold" color={textColor}>
                  {conversionRates.interviewRate}%
                </Text>
              </Box>
              <Box
                {...cardStyle}
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'md',
                  borderColor: greenHoverBorderColor,
                }}
              >
                <Text fontSize="sm" color={secondaryTextColor}>
                  Interview → Offer
                </Text>
                <Text fontSize="xl" fontWeight="bold" color={textColor}>
                  {conversionRates.offerRate}%
                </Text>
              </Box>
              <Box
                {...cardStyle}
                bg={bgColor}
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'md',
                  bg: accentBgHover,
                }}
              >
                <Text fontSize="sm" color={secondaryTextColor}>
                  Overall Success Rate
                </Text>
                <Text fontSize="xl" fontWeight="bold" color={accentColor}>
                  {conversionRates.overallRate}%
                </Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

export default memo(ApplicationStats);
