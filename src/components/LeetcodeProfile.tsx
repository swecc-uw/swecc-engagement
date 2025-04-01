import {
  Box,
  Link,
  Text,
  Heading,
  Spinner,
  Grid,
  Flex,
  useColorModeValue,
  IconButton,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';
import { FaExternalLinkAlt } from 'react-icons/fa';

type LeetCodeStatsProps = {
  username: string;
  stats: {
    easy: number;
    medium: number;
    hard: number;
  };
  loading?: boolean;
};

export const LeetCodeProfile = ({
  username,
  stats,
  loading = false,
}: LeetCodeStatsProps) => {
  const statBg = useColorModeValue('gray.50', 'gray.700');

  const easyColor = useColorModeValue('green.500', 'green.300');
  const mediumColor = useColorModeValue('orange.500', 'orange.300');
  const hardColor = useColorModeValue('red.500', 'red.300');

  const total = stats.easy + stats.medium + stats.hard;

  const metrics = [
    {
      label: 'Easy',
      value: stats.easy,
      color: easyColor,
    },
    {
      label: 'Medium',
      value: stats.medium,
      color: mediumColor,
    },
    {
      label: 'Hard',
      value: stats.hard,
      color: hardColor,
    },
  ];

  if (loading)
    return (
      <Flex justify="center" align="center" p={12}>
        <Spinner size="xl" />
      </Flex>
    );

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">{username}&apos;s LeetCode</Heading>
        <Flex align="center" gap={4}>
          <Text fontSize="lg" fontWeight="bold">
            Total: {total}
          </Text>
          <Link href={`https://leetcode.com/${username}`} isExternal>
            <IconButton
              aria-label="External link"
              icon={<FaExternalLinkAlt />}
              size="sm"
              variant="ghost"
            />
          </Link>
        </Flex>
      </Flex>

      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        {metrics.map((metric) => (
          <Stat
            key={metric.label}
            px={4}
            py={6}
            bg={statBg}
            borderRadius="lg"
            textAlign="center"
            transition="transform 0.2s"
            _hover={{ transform: 'scale(1.02)' }}
          >
            <StatNumber fontSize="2xl" fontWeight="bold" color={metric.color}>
              {metric.value}
            </StatNumber>
            <StatLabel>{metric.label}</StatLabel>
          </Stat>
        ))}
      </Grid>
    </Box>
  );
};

export default LeetCodeProfile;
