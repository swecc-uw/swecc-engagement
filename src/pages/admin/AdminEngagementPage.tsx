import { ArrowBackIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Text,
  SimpleGrid,
} from '@chakra-ui/react';
import React from 'react';
import { Link } from 'react-router-dom';
import { useAttendanceSessions } from '../../hooks/useAttendanceSessions';
import { useColorModeValue } from '@chakra-ui/react';
import { Key, Clock, Users } from 'lucide-react';
import { formatDate } from '../../localization';
import { SessionStatus } from '../../components/admin/SessionStatus';
import { getStats, StatsDisplay } from '../../services/stats/engagement';

interface Props {}

export const AdminEngagementPage: React.FC<Props> = () => {
  const { sessions, loading } = useAttendanceSessions();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const stats: StatsDisplay[] = getStats(sessions);

  return (
    <Box>
      <VStack align={'flex-start'}>
        <Button as={Link} to="/admin" leftIcon={<ArrowBackIcon />} mb={2}>
          Go back
        </Button>
        <Heading>Engagement Metrics</Heading>
        {stats.map(({ label, value }, idx) => {
          return (
            <Box key={idx}>
              <HStack>
                <Text fontWeight="semibold">{label}: </Text>
                <Text>{value}</Text>
              </HStack>
            </Box>
          );
        })}
        <Heading>All Sessions</Heading>
        {loading ? (
          <Text>Loading sessions...</Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} dir="row">
            {sessions.map((session) => (
              <Box
                key={session.sessionId}
                p={4}
                borderWidth="1px"
                borderRadius="md"
                borderColor={borderColor}
                bg={cardBg}
                cursor={'pointer'}
              >
                <VStack align="stretch" spacing={2}>
                  <Heading size="sm">{session.title}</Heading>
                  <HStack>
                    <Key size={16} />
                    <Text>{session.key}</Text>
                    <SessionStatus expires={new Date(session.expires)} />
                  </HStack>
                  <HStack>
                    <Clock size={16} />
                    <Text>{formatDate(session.expires, true)}</Text>
                  </HStack>
                  <HStack>
                    <Users size={16} />
                    <Text>{session.attendees.length} attendees</Text>
                  </HStack>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Box>
  );
};
