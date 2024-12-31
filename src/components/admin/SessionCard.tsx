import { VStack, HStack, Text, Box, Heading } from '@chakra-ui/react';
import { Key, Clock, Users } from 'lucide-react';
import { formatDate } from '../../localization';

interface SessionCardProps {
  session: {
    id: string;
    title: string;
    key: string;
    expires: string;
    attendees: any[];
  };
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
      key={session.id}
      p={4}
      borderWidth="1px"
      borderRadius="md"
      borderColor={borderColor}
      bg={cardBg}
    >
      <VStack align="stretch" spacing={2}>
        <Heading size="sm">{session.title}</Heading>
        <HStack>
          <Key size={16} />
          <Text>{session.key}</Text>
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
