import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Spinner,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Progress,
  Code,
  IconButton,
  HStack,
  ScaleFade,
} from '@chakra-ui/react';
import { Copy, CheckCircle, LogOut, RefreshCw } from 'lucide-react';
import { devPrint } from './utils/RandomUtils';
import { useAuth } from '../hooks/useAuth';

interface DiscordVerificationProps {
  checkVerified: () => Promise<boolean>;
  onVerificationSuccess: () => void;
}

const DiscordVerification: React.FC<DiscordVerificationProps> = ({
  checkVerified,
  onVerificationSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasCopied, setHasCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [verificationFailed, setVerificationFailed] = useState(false);
  const toast = useToast();
  const { logout } = useAuth();

  // refs for cleanup
  const checkIntervalRef = useRef<NodeJS.Timeout>();
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  const attemptCount = useRef(0);
  const MAX_ATTEMPTS = 3;
  const CHECK_INTERVAL = 5000; // 5s between checks
  const PROGRESS_INTERVAL = 400;

  const clearIntervals = () => {
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  useEffect(() => {
    const giveUp = () => {
      clearIntervals();
      setIsPolling(false);
      setVerificationFailed(true);
      setIsLoading(false);
      setProgress(0);
      attemptCount.current = 0;
    };

    if (isPolling) {
      setProgress(0);
      attemptCount.current = 0;

      // verify check
      checkIntervalRef.current = setInterval(async () => {
        try {
          attemptCount.current += 1;
          const isVerified = await checkVerified();

          if (isVerified) {
            clearIntervals();
            setIsPolling(false);
            setShowSuccess(true);
            setTimeout(onVerificationSuccess, 1500);
          } else if (attemptCount.current >= MAX_ATTEMPTS) {
            giveUp();
          }
        } catch (error) {
          devPrint(error);
          giveUp();
        }
      }, CHECK_INTERVAL);

      // progress animation
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 2;
          return newProgress >= 100 ? 0 : newProgress;
        });
      }, PROGRESS_INTERVAL);
    }

    return clearIntervals;
  }, [checkVerified, isPolling, onVerificationSuccess]);

  useEffect(() => {
    if (verificationFailed) {
      toast({
        title: 'Verification Timeout',
        description: 'Please try running the command again',
        status: 'error',
        duration: 5000,
        isClosable: true,
        render: ({ onClose }) => (
          <Alert
            status="error"
            variant="solid"
            borderRadius="md"
            onClick={onClose}
            cursor="pointer"
            bg="red.500"
          >
            <AlertIcon />
            <Box flex="1">
              <AlertTitle fontWeight="bold" color="white">
                Verification Timeout
              </AlertTitle>
              <AlertDescription color="whiteAlpha.900">
                Please try running the command again
              </AlertDescription>
            </Box>
          </Alert>
        ),
      });
    }
  }, [verificationFailed, toast]);

  const startChecking = async () => {
    setIsLoading(true);
    setIsPolling(true);
    setVerificationFailed(false);

    toast({
      title: 'Checking Verification',
      description: `Checking status for ${MAX_ATTEMPTS * 5} seconds`,
      status: 'info',
      duration: 4000,
      isClosable: true,
      render: ({ onClose }) => (
        <Alert
          status="info"
          variant="solid"
          borderRadius="md"
          onClick={onClose}
          cursor="pointer"
          bg="blue.500"
        >
          <AlertIcon />
          <Box flex="1">
            <AlertTitle fontWeight="bold" color="white">
              Checking Verification
            </AlertTitle>
            <AlertDescription color="whiteAlpha.900">
              Checking status for {MAX_ATTEMPTS * 5} seconds
            </AlertDescription>
          </Box>
        </Alert>
      ),
    });
  };

  const copyCommand = () => {
    navigator.clipboard.writeText(`/verify`);
    setHasCopied(true);

    toast({
      status: 'success',
      duration: 2000,
      render: ({ onClose }) => (
        <Alert
          status="success"
          variant="solid"
          borderRadius="md"
          onClick={onClose}
          cursor="pointer"
          bg="green.500"
        >
          <AlertIcon />
          <Box flex="1">
            <AlertTitle fontWeight="bold" color="white">
              Command Copied
            </AlertTitle>
            <AlertDescription color="whiteAlpha.900">
              Paste in Discord server
            </AlertDescription>
          </Box>
        </Alert>
      ),
    });

    setTimeout(() => setHasCopied(false), 1500);
  };

  const handleLogout = () => {
    clearIntervals();
    setIsPolling(false);
    logout();
  };

  if (showSuccess) {
    return (
      <ScaleFade initialScale={0.9} in={true}>
        <Alert
          status="success"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          bg="white"
          borderRadius="xl"
          boxShadow="xl"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Verification Successful!
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            Your account has been verified
          </AlertDescription>
        </Alert>
      </ScaleFade>
    );
  }

  return (
    <Box
      borderRadius="xl"
      bg="white"
      boxShadow="xl"
      p={8}
      maxW="md"
      mx="auto"
      position="relative"
      overflow="hidden"
    >
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" align="center">
          <Heading as="h1" size="lg">
            Discord Verification
          </Heading>
          <Button
            leftIcon={<LogOut size={18} />}
            variant="ghost"
            colorScheme="gray"
            size="sm"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </HStack>

        <Alert
          status="info"
          variant="subtle"
          borderRadius="md"
          flexDirection="column"
          alignItems="start"
          px={4}
          py={3}
        >
          <AlertTitle mb={1} fontSize="md">
            Verification Required
          </AlertTitle>
          <AlertDescription fontSize="sm">
            Please complete Discord verification to access your account
          </AlertDescription>
        </Alert>

        <VStack spacing={4} align="stretch">
          <Box
            bg="gray.50"
            p={4}
            borderRadius="md"
            border="1px"
            borderColor="gray.200"
            position="relative"
          >
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Step 1: Copy the verification command
            </Text>
            <Box
              display="flex"
              alignItems="center"
              bg="gray.100"
              p={2}
              borderRadius="md"
              border="1px"
              borderColor="gray.300"
            >
              <Code flex="1" fontSize="md" bg="transparent">
                /verify
              </Code>
              <IconButton
                icon={
                  hasCopied ? <CheckCircle size={18} /> : <Copy size={18} />
                }
                aria-label="Copy command"
                size="sm"
                colorScheme={hasCopied ? 'green' : 'gray'}
                variant="ghost"
                onClick={copyCommand}
              />
            </Box>
          </Box>

          <Box
            bg="gray.50"
            p={4}
            borderRadius="md"
            border="1px"
            borderColor="gray.200"
          >
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Step 2: Run the command in Discord
            </Text>
            <Text fontSize="sm" color="gray.600">
              Paste and send the command in any channel, and then enter your
              username
            </Text>
          </Box>

          <Box
            bg="gray.50"
            p={4}
            borderRadius="md"
            border="1px"
            borderColor="gray.200"
          >
            <Text fontSize="sm" fontWeight="medium" mb={2}>
              Step 3: Start verification check
            </Text>
            <Button
              onClick={startChecking}
              colorScheme={verificationFailed ? 'yellow' : 'blue'}
              size="md"
              width="full"
              disabled={isLoading}
              leftIcon={
                isLoading ? (
                  <Spinner size="sm" />
                ) : verificationFailed ? (
                  <RefreshCw size={18} />
                ) : undefined
              }
            >
              {isLoading
                ? 'Checking...'
                : verificationFailed
                ? 'Try Again'
                : 'Start Checking'}
            </Button>
          </Box>
        </VStack>

        {isPolling && (
          <Box>
            <Text fontSize="sm" color="gray.600" mb={2}>
              Attempt {attemptCount.current} of {MAX_ATTEMPTS}
            </Text>
            <Progress
              value={progress}
              size="xs"
              colorScheme="blue"
              borderRadius="full"
              isAnimated
              hasStripe
              sx={{
                '& > div:first-of-type': {
                  transitionProperty: 'width',
                  transitionDuration: '0.3s',
                },
              }}
            />
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default DiscordVerification;
