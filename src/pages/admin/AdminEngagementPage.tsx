import { ArrowBackIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Heading,
  VStack,
  HStack,
  Text,
  SimpleGrid,
  Divider,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import React from 'react';
import { Link } from 'react-router-dom';
import { useAttendanceSessions } from '../../hooks/useAttendanceSessions';
import { useColorModeValue } from '@chakra-ui/react';
import {
  calculateSessionStats,
  SessionStats,
} from '../../services/stats/engagement';
import { SessionPlot } from '../../components/admin/SessionPlot';
import { SessionCard } from '../../components/admin/SessionCard';

export const AdminEngagementPage: React.FC = () => {
  const { sessions, loading } = useAttendanceSessions();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const stats: SessionStats[] = calculateSessionStats(sessions);

  return (
    <Box>
      <VStack align="flex-start">
        <Button as={Link} to="/admin" leftIcon={<ArrowBackIcon />} mb={2}>
          Go back
        </Button>
        <Heading>Engagement Metrics</Heading>
        <Divider />
        {sessions.length && (
          <Grid
            w="100%"
            h="max-content"
            templateColumns="repeat(5, 1fr)"
            gap={6}
          >
            <GridItem colSpan={1}>
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
            </GridItem>
            <GridItem h="100%" colSpan={4}>
              <SessionPlot sessions={sessions} />
            </GridItem>
          </Grid>
        )}
        <Heading mt={4}>All Sessions</Heading>
        <Divider />
        {loading ? (
          <Text>Loading sessions...</Text>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} dir="row">
            {sessions.map((session) => (
              <SessionCard
                key={session.sessionId}
                session={session}
                borderColor={borderColor}
                cardBg={cardBg}
              />
            ))}
          </SimpleGrid>
        )}
      </VStack>
    </Box>
  );
};
