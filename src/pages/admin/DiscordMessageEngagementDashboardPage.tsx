import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Input,
  Text,
  Heading,
  useToast,
  Card,
  CardBody,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Progress,
  Badge,
  SimpleGrid,
  Flex,
} from '@chakra-ui/react';
import {
  parseChannelIds,
  parseMemberIds,
  queryMessageStats,
} from '../../services/engagement';
import { StatsResponseRecord } from '../../types';
import { resolveName } from '../../components/utils/RandomUtils';

function ChannelStats({
  channel,
  count,
  progress,
}: {
  channel: string;
  count: number;
  progress: number;
}) {
  return (
    <Box key={channel}>
      <Flex justify="space-between" mb={1}>
        <Text fontWeight="medium">{channel}</Text>
        <Badge colorScheme="blue">{count}</Badge>
      </Flex>
      <Progress value={progress} colorScheme="blue" borderRadius="full" />
    </Box>
  );
}

function MemberStats({
  member,
  total,
  progress,
}: {
  member: StatsResponseRecord['member'];
  total: number;
  progress: number;
}) {
  return (
    <Box key={member.id}>
      <Flex justify="space-between" mb={1}>
        <Text fontWeight="medium">{resolveName(member)}</Text>
        <Badge colorScheme="green">{total}</Badge>
      </Flex>
      <Progress value={progress} colorScheme="green" borderRadius="full" />
    </Box>
  );
}

export default function DiscordMessageEngagementDashboardPage() {
  const [memberIdsInput, setMemberIdsInput] = useState<string>('');
  const [channelIdsInput, setChannelIdsInput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<StatsResponseRecord[]>([]);
  const toast = useToast();

  const aggregatedStats = useMemo(() => {
    if (!stats.length) return null;

    const totalMessages = stats.reduce((acc, record) => {
      return (
        acc + Object.values(record.stats).reduce((sum, count) => sum + count, 0)
      );
    }, 0);

    const channelTotals = stats.reduce((acc, record) => {
      Object.entries(record.stats).forEach(([channel, count]) => {
        acc[channel] = (acc[channel] || 0) + count;
      });
      return acc;
    }, {} as Record<string, number>);

    const memberTotals = stats.map((record) => ({
      member: record.member,
      total: Object.values(record.stats).reduce((sum, count) => sum + count, 0),
    }));

    return {
      totalMessages,
      channelTotals,
      memberTotals,
      maxChannelMessages: Math.max(...Object.values(channelTotals)),
    };
  }, [stats]);

  const handleQuery = async () => {
    setLoading(true);
    try {
      const memberIds = parseMemberIds(memberIdsInput);
      const channelIds = parseChannelIds(channelIdsInput);
      const stats = await queryMessageStats(memberIds, channelIds);
      setStats(stats);
    } catch (e) {
      toast({
        title: 'Failed to query message stats',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <Card mb={6} variant="filled" bg="whiteAlpha.50">
        <CardBody>
          <Stack spacing={6}>
            <Heading size="lg">Discord Message Metrics</Heading>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Box>
                <Text mb={2} fontWeight="medium">
                  Members
                </Text>
                <Input
                  placeholder="Enter member IDs (comma-separated)"
                  value={memberIdsInput}
                  onChange={(e) => setMemberIdsInput(e.target.value)}
                  bg="whiteAlpha.50"
                />
              </Box>
              <Box>
                <Text mb={2} fontWeight="medium">
                  Channels
                </Text>
                <Input
                  placeholder="Enter channel IDs (comma-separated)"
                  value={channelIdsInput}
                  onChange={(e) => setChannelIdsInput(e.target.value)}
                  bg="whiteAlpha.50"
                />
              </Box>
            </SimpleGrid>

            <Button
              onClick={handleQuery}
              isLoading={loading}
              colorScheme="blue"
              size="lg"
            >
              Generate Report
            </Button>
          </Stack>
        </CardBody>
      </Card>

      {aggregatedStats && (
        <Stack spacing={6}>
          <Card variant="filled" bg="whiteAlpha.50">
            <CardBody>
              <StatGroup>
                <Stat>
                  <StatLabel>Total Messages</StatLabel>
                  <StatNumber>{aggregatedStats.totalMessages}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Active Members</StatLabel>
                  <StatNumber>{stats.length}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Active Channels</StatLabel>
                  <StatNumber>
                    {Object.keys(aggregatedStats.channelTotals).length}
                  </StatNumber>
                </Stat>
              </StatGroup>
            </CardBody>
          </Card>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Card variant="filled" bg="whiteAlpha.50">
              <CardBody>
                <Heading size="md" mb={4}>
                  Channel Activity
                </Heading>
                <Stack spacing={4}>
                  {Object.entries(aggregatedStats.channelTotals)
                    .sort(([, a], [, b]) => b - a)
                    .map(([channel, count]) => (
                      <ChannelStats
                        key={channel}
                        channel={channel}
                        count={count}
                        progress={
                          (count / aggregatedStats.maxChannelMessages) * 100
                        }
                      />
                    ))}
                </Stack>
              </CardBody>
            </Card>

            <Card variant="filled" bg="whiteAlpha.50">
              <CardBody>
                <Heading size="md" mb={4}>
                  Member Activity
                </Heading>
                <Stack spacing={4}>
                  {aggregatedStats.memberTotals
                    .sort((a, b) => b.total - a.total)
                    .map(({ member, total }) => (
                      <MemberStats
                        key={member.id}
                        member={member}
                        total={total}
                        progress={(total / aggregatedStats.totalMessages) * 100}
                      />
                    ))}
                </Stack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Stack>
      )}
    </Box>
  );
}
