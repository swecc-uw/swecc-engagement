import {
  Box,
  Link,
  Heading,
  Spinner,
  Grid,
  Flex,
  Icon,
  useColorModeValue,
  IconButton,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react';
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import { VscGitPullRequest, VscGitCommit } from 'react-icons/vsc';
import { FiUsers } from 'react-icons/fi';

type GitHubStatsProps = {
  username: string;
  stats: {
    prs: number;
    commits: number;
    followers: number;
  };
  loading?: boolean;
};

export const GitHubProfile = ({
  username,
  stats,
  loading = false,
}: GitHubStatsProps) => {
  const statBg = useColorModeValue('gray.50', 'gray.700');

  const metrics = [
    {
      label: 'Pull Requests',
      value: stats.prs,
      icon: VscGitPullRequest,
      color: 'purple.500',
    },
    {
      label: 'Commits',
      value: stats.commits,
      icon: VscGitCommit,
      color: 'green.500',
    },
    {
      label: 'Followers',
      value: stats.followers,
      icon: FiUsers,
      color: 'blue.500',
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
        <Heading size="lg" display="flex" alignItems="center" gap={2}>
          <Icon as={FaGithub} />
          {username}&apos;s GitHub
        </Heading>
        <Link href={`https://github.com/${username}`} isExternal>
          <IconButton
            aria-label="External link"
            icon={<FaExternalLinkAlt />}
            size="sm"
            variant="ghost"
          />
        </Link>
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
            <Icon as={metric.icon} w={6} h={6} color={metric.color} mb={2} />
            <StatNumber fontSize="2xl" fontWeight="bold">
              {metric.value.toLocaleString()}
            </StatNumber>
            <StatLabel>{metric.label}</StatLabel>
          </Stat>
        ))}
      </Grid>
    </Box>
  );
};

export default GitHubProfile;
