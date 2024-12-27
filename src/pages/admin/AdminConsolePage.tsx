import React, { useState, useRef, useEffect } from 'react';
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
  useColorModeValue,
  IconButton,
} from '@chakra-ui/react';
import { Terminal, Trash, Copy, Check } from 'lucide-react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';
import adminCommandRpcClient, {
  CommandEvent,
  ConsoleStream,
} from '../../services/admin/AdminCommandRpc';

export default function AdminTerminalPage() {
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const events = useRef<CommandEvent[]>([]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [eventsKey, setEventsKey] = useState(0);
  const [copiedMap, setCopiedMap] = useState<Record<string, boolean>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [eventCount, setEventCount] = useState(0);

  const promptColor = useColorModeValue('blue.500', 'blue.300');
  const outputBg = useColorModeValue('gray.50', 'gray.800');
  const errorColor = useColorModeValue('red.500', 'red.300');

  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  useEffect(() => {
    events.current = adminCommandRpcClient.getEventHistory?.() || [];
    setEventCount(events.current.length);
    setEventsKey((k) => k + 1);
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [eventsKey]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    });
  };

  const copyToClipboard = async (content: string, eventId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMap((prev) => ({ ...prev, [eventId]: true }));
      setTimeout(() => {
        setCopiedMap((prev) => ({ ...prev, [eventId]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const process = async (input: string): Promise<void> => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      await adminCommandRpcClient.executeCommand(input);
      events.current = adminCommandRpcClient.getEventHistory();
      setInputHistory((prev) => [...prev, input]);
      setHistoryIndex(-1);
      setCurrentInput('');
      setEventsKey((k) => k + 1);
    } catch (error) {
      events.current = adminCommandRpcClient.getEventHistory();
      setEventsKey((k) => k + 1);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (currentInput.trim()) {
          process(currentInput);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (inputHistory.length > 0) {
          const newIndex = historyIndex + 1;
          if (newIndex < inputHistory.length) {
            setHistoryIndex(newIndex);
            setCurrentInput(inputHistory[inputHistory.length - 1 - newIndex]);
          }
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setCurrentInput(inputHistory[inputHistory.length - 1 - newIndex]);
        } else if (historyIndex === 0) {
          setHistoryIndex(-1);
          setCurrentInput('');
        }
        break;
    }
    setEventCount(events.current.length);
  };

  const clearInputHistory = async () => {
    await process('clear');
    events.current = [];
    setInputHistory([]);
    setHistoryIndex(-1);
    setCurrentInput('');
    setEventCount(0);
    setEventsKey((k) => k + 1);
  };

  const EventView = ({ stream, content, timestamp }: CommandEvent) => {
    const eventId = `${timestamp}-${content}`;
    const isCopied = copiedMap[eventId];

    return (
      <HStack align="flex-start" className="group" spacing={2}>
        <Box flex="1">
          {stream === ConsoleStream.Input ? (
            <Text color={promptColor}>$ {content}</Text>
          ) : stream === ConsoleStream.Error ? (
            <Text color={errorColor}>{content}</Text>
          ) : (
            <Text color="gray.700" whiteSpace="pre-wrap">
              {content}
            </Text>
          )}
        </Box>
        <IconButton
          icon={isCopied ? <Check size={20} /> : <Copy size={20} />}
          aria-label="Copy content"
          size="xs"
          variant="ghost"
          opacity={isCopied ? 1 : 0}
          _groupHover={{ opacity: 1 }}
          onClick={() => copyToClipboard(content, eventId)}
          color={isCopied ? 'green.500' : 'gray.500'}
        />
      </HStack>
    );
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

        <HStack justify="space-between">
          <Heading size="lg">Management Console</Heading>
          {eventCount > 0 && (
            <Button
              leftIcon={<Trash size={16} />}
              variant="ghost"
              colorScheme="red"
              size="sm"
              onClick={clearInputHistory}
            >
              Clear History
            </Button>
          )}
        </HStack>

        <Card>
          <CardHeader>
            <HStack>
              <Terminal size={20} />
              <Text>Terminal</Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <Box
              ref={terminalRef}
              height="500px"
              overflowY="auto"
              fontFamily="mono"
              fontSize="sm"
              bg={outputBg}
              p={4}
              borderRadius="md"
            >
              <VStack align="stretch" spacing={2}>
                <div key={eventsKey}>
                  {events.current.map((event, i) => (
                    <EventView key={`${event.timestamp}-${i}`} {...event} />
                  ))}
                </div>
              </VStack>

              <HStack mt={2}>
                <Text color={promptColor}>$</Text>
                <Input
                  ref={inputRef}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  variant="unstyled"
                  placeholder="Enter command..."
                  spellCheck={false}
                  disabled={loading}
                  _disabled={{ opacity: 0.7 }}
                  _focus={{ outline: 'none' }}
                />
              </HStack>
            </Box>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
