import { VStack, HStack, Text, Box, Heading } from '@chakra-ui/react';
import { Key, Clock, Users } from 'lucide-react';
import { formatDate } from '../../localization';
import { AttendanceSession } from '../../types';
import { SessionStatus } from './SessionStatus';

interface SessionCardProps {
  session: AttendanceSession;
  borderColor: string;
  cardBg: string;
}

export function SessionCard({
  session,
  borderColor,
  cardBg,
}: SessionCardProps) {
  return (
    <Box
      key={session.sessionId}
      p={4}
      borderWidth="1px"
      borderRadius="md"
      borderColor={borderColor}
      bg={cardBg}
      cursor="pointer"
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
  );
}
