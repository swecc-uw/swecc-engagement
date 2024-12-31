import { useState, FormEvent } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Box,
  Button,
  VStack,
  HStack,
  Input,
  Text,
  Card,
  CardBody,
  CardHeader,
  Heading,
  FormControl,
  FormLabel,
  useColorModeValue,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { Calendar, Clock, Key, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../localization';
import {
  useAttendanceSessions,
  isSessionActive,
} from '../../hooks/useAttendanceSessions';

import { AttendanceSession } from '../../types';


interface SessionCardProps {
  session: AttendanceSession;
  borderColor: string;
  cardBg: string;
}

function SessionCard({ session, borderColor, cardBg }: SessionCardProps) {
  return (
    <Box
      key={session.sessionId}
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

export default function AdminSessionPage() {
  const [title, setTitle] = useState('');
  const [key, setKey] = useState('');
  const [expiresDate, setExpiresDate] = useState<Date | null>(null);
  const { sessions, loading, error, createSession } = useAttendanceSessions();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const activeSessions = sessions.filter(isSessionActive);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!expiresDate) {
      return;
    }

    const success = await createSession(title, key, expiresDate);
    if (success) {
      setTitle('');
      setKey('');
      setExpiresDate(null);
    }
  };

  return (
    <Box p={4}>
      <VStack spacing={6} align="stretch">
        <Button
          as={Link}
          to="/admin"
          colorScheme="blue"
          leftIcon={<ArrowBackIcon />}
          w="fit-content"
          mb="16px"
        >
          Go Back
        </Button>

        <Heading size="lg">Attendance Sessions</Heading>

        <Card>
          <CardHeader>
            <HStack>
              <Calendar size={25} />
              <Text>Create New Session</Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>Title</FormLabel>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Session title"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Key</FormLabel>
                  <Input
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="Attendance key"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Expires</FormLabel>
                  <DatePicker
                    selected={expiresDate}
                    onChange={(date: Date | null) => setExpiresDate(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={5}
                    timeCaption="time"
                    dateFormat="MMMM d, yyyy h:mm aa"
                    minDate={new Date()}
                    customInput={<Input placeholder="Select date and time" />}
                    className="chakra-input css-1kp110w"
                  />
                </FormControl>

                <Button type="submit" colorScheme="blue" isLoading={loading}>
                  Create Session
                </Button>
              </VStack>
            </form>
            {error && (
              <Text color="red.500" mt={4}>
                {error}
              </Text>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <HStack>
              <Users size={20} />
              <Text>Active Sessions</Text>
            </HStack>
          </CardHeader>
          <CardBody>
            {loading ? (
              <Text>Loading sessions...</Text>
            ) : activeSessions.length === 0 ? (
              <Text>No active sessions found.</Text>
            ) : (
              <VStack spacing={4} align="stretch">
                {activeSessions.map((session) => (
                  <SessionCard
                    key={session.sessionId}
                    session={session}
                    borderColor={borderColor}
                    cardBg={cardBg}
                  />
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
