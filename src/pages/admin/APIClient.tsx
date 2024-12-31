import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  VStack,
  HStack,
  Textarea,
  useToast,
  Code,
  Text,
  Badge,
  Card,
  CardBody,
  CardHeader,
  useClipboard,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { Copy, Clock, Trash } from 'lucide-react';
import api from '../../services/api';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { Link } from 'react-router-dom';

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface APIResponse {
  timestamp: string;
  method: HTTPMethod;
  url: string;
  status: number;
  duration: number;
  response: any;
}

export default function APIClient() {
  const [method, setMethod] = useState<HTTPMethod>('GET');
  const [url, setUrl] = useState<string>();
  const [body, setBody] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<APIResponse[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<APIResponse>();
  const toast = useToast();
  const { onCopy } = useClipboard(
    JSON.stringify(selectedResponse?.response, null, 2) || ''
  );

  const handleBodyChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(event.target.value);
  };

  const validateBody = (bodyString?: string): boolean => {
    if (!bodyString) return true;
    if (!bodyString.trim()) return true;
    try {
      JSON.parse(bodyString);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleRequest = async () => {
    if (!url) {
      toast({
        title: 'URL is required',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (!validateBody(body)) {
      toast({
        title: 'Invalid JSON in request body',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    const startTime = performance.now();

    try {
      let response;
      const parsedBody = body ? JSON.parse(body) : undefined;

      switch (method) {
        case 'GET':
          response = await api.get(url);
          break;
        case 'POST':
          response = await api.post(url, parsedBody);
          break;
        case 'PUT':
          response = await api.put(url, parsedBody);
          break;
        case 'DELETE':
          response = await api.delete(url);
          break;
        case 'PATCH':
          response = await api.patch(url, parsedBody);
          break;
      }

      const duration = performance.now() - startTime;
      const apiResponse: APIResponse = {
        timestamp: new Date().toISOString(),
        method,
        url,
        status: response.status,
        duration,
        response: response.data,
      };

      setHistory((prev) => [apiResponse, ...prev]);
      setSelectedResponse(apiResponse);
    } catch (error: any) {
      const duration = performance.now() - startTime;
      const apiResponse: APIResponse = {
        timestamp: new Date().toISOString(),
        method,
        url,
        status: error.response?.status || 500,
        duration,
        response: error.response?.data || error.message,
      };

      setHistory((prev) => [apiResponse, ...prev]);
      setSelectedResponse(apiResponse);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setSelectedResponse(undefined);
  };

  const formatDuration = (duration: number): string => {
    return `${duration.toFixed(0)}ms`;
  };

  const getStatusColor = (status: number): string => {
    if (status >= 200 && status < 300) return 'green';
    if (status >= 300 && status < 400) return 'blue';
    if (status >= 400 && status < 500) return 'orange';
    return 'red';
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
          <Heading size="lg">API Client</Heading>
          {history.length > 0 && (
            <Button
              leftIcon={<Trash size={16} />}
              variant="ghost"
              colorScheme="red"
              size="sm"
              onClick={clearHistory}
            >
              Clear History
            </Button>
          )}
        </HStack>

        <Card>
          <CardBody>
            <VStack spacing={4}>
              <HStack width="full" spacing={4}>
                <FormControl width="200px">
                  <FormLabel>Method</FormLabel>
                  <Select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as HTTPMethod)}
                  >
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>DELETE</option>
                    <option>PATCH</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>URL</FormLabel>
                  <Input
                    placeholder="/api/endpoint"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </FormControl>
              </HStack>

              {method !== 'GET' && method !== 'DELETE' && (
                <FormControl>
                  <FormLabel>Request Body (JSON)</FormLabel>
                  <Textarea
                    value={body}
                    onChange={handleBodyChange}
                    placeholder="{}"
                    height="150px"
                    fontFamily="mono"
                  />
                </FormControl>
              )}

              <Button
                colorScheme="blue"
                onClick={handleRequest}
                isLoading={loading}
                alignSelf="flex-end"
              >
                Send Request
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {history.length > 0 && (
          <Card>
            <CardHeader>
              <Heading size="md">Response History</Heading>
            </CardHeader>
            <CardBody>
              <HStack align="start" spacing={4}>
                <VStack
                  align="stretch"
                  minWidth="200px"
                  maxHeight="500px"
                  overflowY="auto"
                  spacing={2}
                >
                  {history.map((item, index) => (
                    <Card
                      key={index}
                      variant="outline"
                      cursor="pointer"
                      onClick={() => setSelectedResponse(item)}
                      bg={selectedResponse === item ? 'gray.50' : undefined}
                      _hover={{ bg: 'gray.50' }}
                    >
                      <CardBody p={3}>
                        <VStack align="stretch" spacing={2}>
                          <HStack justify="space-between">
                            <Badge>{item.method}</Badge>
                            <Badge colorScheme={getStatusColor(item.status)}>
                              {item.status}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" noOfLines={1}>
                            {item.url}
                          </Text>
                          <HStack fontSize="xs" color="gray.500">
                            <Clock size={12} />
                            <Text>{formatDuration(item.duration)}</Text>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>

                {selectedResponse && (
                  <Box flex={1}>
                    <VStack align="stretch" spacing={4}>
                      <HStack justify="space-between">
                        <HStack>
                          <Badge
                            colorScheme={getStatusColor(
                              selectedResponse.status
                            )}
                          >
                            Status: {selectedResponse.status}
                          </Badge>
                          <Badge variant="outline">
                            {formatDuration(selectedResponse.duration)}
                          </Badge>
                        </HStack>
                        <Tooltip label="Copy Response">
                          <IconButton
                            aria-label="Copy response"
                            icon={<Copy size={16} />}
                            size="sm"
                            onClick={onCopy}
                          />
                        </Tooltip>
                      </HStack>
                      <Box
                        bg="gray.50"
                        p={4}
                        borderRadius="md"
                        maxHeight="400px"
                        overflowY="auto"
                      >
                        <pre style={{ margin: 0 }}>
                          <Code>
                            {JSON.stringify(selectedResponse.response, null, 2)}
                          </Code>
                        </pre>
                      </Box>
                    </VStack>
                  </Box>
                )}
              </HStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
}
