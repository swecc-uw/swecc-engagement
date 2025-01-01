import {
  VStack,
  HStack,
  Text,
  Box,
  Heading,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
  Flex,
  Spacer,
} from '@chakra-ui/react';
import { Key, Clock, Users } from 'lucide-react';
import { formatDate } from '../../localization';
import { AttendanceSession } from '../../types';
import { SessionStatus } from './SessionStatus';
import { Link } from 'react-router-dom';
import { ExternalLinkIcon } from '@chakra-ui/icons';

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
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box
      key={session.sessionId}
      p={4}
      borderWidth="1px"
      borderRadius="md"
      borderColor={borderColor}
      bg={cardBg}
      cursor="pointer"
      onClick={onOpen}
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

      <Modal size={'lg'} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Text fontSize="large">{session.title}</Text>
              <SessionStatus expires={new Date(session.expires)} />
            </HStack>
            <Divider mt={1} />
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="center">
              <Heading fontSize="lg">
                Attendees ({session.attendees.length} total)
              </Heading>
              <Box
                maxH="200px"
                borderWidth="1px"
                borderRadius="md"
                borderColor={borderColor}
                overflowY="auto"
                w="70%"
              >
                {session.attendees.map((attendee, idx) => {
                  return (
                    <Flex
                      key={idx}
                      h="10%"
                      paddingBlock={2}
                      justify="center"
                      align="center"
                      as={Link}
                      to={`/directory/${attendee.id}`}
                      borderBottomWidth="1px"
                      borderColor={borderColor}
                    >
                      <Text>
                        {attendee.username} <ExternalLinkIcon mb={0.5} />
                      </Text>
                    </Flex>
                  );
                })}
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter mt={4} borderTopWidth="1px" borderTopColor={borderColor}>
            <HStack
              w="100%"
              mb={4}
              justify="space-between"
              align="center"
              spacing={2}
            >
              <HStack>
                <Key size={16} />
                <Text>{session.key}</Text>
              </HStack>
              <HStack>
                <Clock size={16} />
                <Text>{formatDate(session.expires, true)}</Text>
              </HStack>
              <Spacer />
              <Button size="md" onClick={onClose} mr={3}>
                Close
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
