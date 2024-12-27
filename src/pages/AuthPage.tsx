import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthForm from '../components/AuthForm';
import DiscordVerification from '../components/DiscordVerification';
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  Heading,
  Container,
  Spinner,
  Flex,
  Text,
} from '@chakra-ui/react';
import { isCurrentMemberVerified } from '../services/member';

const AuthPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const navigate = useNavigate();
  const {
    isAuthenticated,
    isVerified,
    member,
    login,
    register,
    error: authError,
  } = useAuth();

  // handle navigation on initial auth
  useEffect(() => {
    if (isAuthenticated && isVerified) {
      navigate('/');
    }
  }, [isAuthenticated, isVerified, navigate]);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await login(username, password);
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (
      !(
        discordUsername &&
        username &&
        email &&
        password &&
        firstName &&
        lastName
      )
    ) {
      setError('Please fill out all fields.');
      return;
    }

    setLoading(true);
    const userId = await register(
      firstName,
      lastName,
      username,
      email,
      password,
      discordUsername
    );
    if (!userId) {
      setError(authError || 'An error occurred.');
    }
    setLoading(false);
  };

  const checkVerified = async () => {
    try {
      const verified = await isCurrentMemberVerified();
      return verified;
    } catch (error) {
      setError('An error occurred while checking verification status.');
      return false;
    }
  };

  // show verification if auth but not verified
  if (
    isAuthenticated &&
    !isVerified &&
    member &&
    member.username &&
    member.username !== ''
  ) {
    return (
      <Box py={12}>
        <Container maxW="md">
          <VStack>
            <Box
              borderRadius="lg"
              boxShadow="md"
              p={6}
              width="full"
              position="relative"
            >
              <DiscordVerification
                checkVerified={checkVerified}
                onVerificationSuccess={() => navigate('/')}
              />
              {error && (
                <Text color="red.500" mt={2}>
                  {error}
                </Text>
              )}
            </Box>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box py={12}>
      <Container maxW="md">
        <VStack spacing={8}>
          <Heading as="h1" size="xl">
            Welcome
          </Heading>
          <Box
            borderRadius="lg"
            boxShadow="md"
            p={6}
            width="full"
            position="relative"
          >
            <Tabs
              isFitted
              variant="enclosed"
              index={activeTab}
              onChange={(index) => setActiveTab(index)}
            >
              <TabList mb="1em">
                <Tab>Login</Tab>
                <Tab>Register</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <AuthForm
                    isLogin={true}
                    username={username}
                    email={email}
                    password={password}
                    error={error || authError || ''}
                    onFirstNameChange={(
                      e: React.ChangeEvent<HTMLInputElement>
                    ) => setFirstName(e.target.value)}
                    onLastNameChange={(
                      e: React.ChangeEvent<HTMLInputElement>
                    ) => setLastName(e.target.value)}
                    onUsernameChange={(
                      e: React.ChangeEvent<HTMLInputElement>
                    ) => setUsername(e.target.value)}
                    onEmailChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    onPasswordChange={(
                      e: React.ChangeEvent<HTMLInputElement>
                    ) => setPassword(e.target.value)}
                    onSubmit={handleLogin}
                  />
                </TabPanel>
                <TabPanel>
                  <AuthForm
                    isLogin={false}
                    username={username}
                    password={password}
                    confirmPassword={confirmPassword}
                    discordUsername={discordUsername}
                    error={error || authError || ''}
                    onUsernameChange={(
                      e: React.ChangeEvent<HTMLInputElement>
                    ) => setUsername(e.target.value)}
                    onEmailChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                    onFirstNameChange={(
                      e: React.ChangeEvent<HTMLInputElement>
                    ) => setFirstName(e.target.value)}
                    onLastNameChange={(
                      e: React.ChangeEvent<HTMLInputElement>
                    ) => setLastName(e.target.value)}
                    onPasswordChange={(
                      e: React.ChangeEvent<HTMLInputElement>
                    ) => setPassword(e.target.value)}
                    onConfirmPasswordChange={(
                      e: React.ChangeEvent<HTMLInputElement>
                    ) => setConfirmPassword(e.target.value)}
                    onDiscordUsernameChange={(
                      e: React.ChangeEvent<HTMLInputElement>
                    ) => setDiscordUsername(e.target.value)}
                    onSubmit={handleRegister}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
            {loading && (
              <Flex justify="center" mt={4}>
                <Spinner size="sm" />
              </Flex>
            )}
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default AuthPage;
