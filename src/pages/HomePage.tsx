import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Wrap,
  WrapItem,
  Button,
  Card,
  CardBody,
  SimpleGrid,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiBarChart2,
  FiCalendar,
  FiUsers,
  FiCode,
  FiTrendingUp,
  FiMessageCircle,
  FiAward,
} from 'react-icons/fi';
import GravitySimulation from '../components/GravitySimulation';

const HomePage: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.200');
  const headingColor = useColorModeValue('gray.800', 'white');
  const buttonVariant = useColorModeValue('solid', 'solid');
  const cardBorderColor = useColorModeValue('gray.200', 'gray.700');
  const cardShadow = useColorModeValue('lg', 'dark-lg');

  return (
    <Box position="relative" minH="100vh" overflow="hidden">
      <Box
        position="fixed"
        top="0"
        left="0"
        width="100%"
        height="100%"
        zIndex="1"
      >
        <GravitySimulation />
      </Box>

      <Box
        position="relative"
        zIndex="1"
        mt={{ base: '80px', md: '120px' }}
        pb="60px"
        backdropFilter="blur(2px)"
      >
        <Container maxW="container.xl">
          <VStack spacing={12} align="center" textAlign="center">
            <VStack spacing={4}>
              <Heading
                as="h1"
                size="4xl"
                color={headingColor}
                fontWeight="bold"
                lineHeight="1.2"
                textShadow="0 0 10px rgba(0,0,0,0.1)"
              >
                <i>connect, learn, grow</i>
              </Heading>
            </VStack>

            <Wrap spacing={4} justify="center" padding={4}>
              <WrapItem>
                <Button
                  colorScheme="blue"
                  size="lg"
                  leftIcon={<FiBarChart2 />}
                  as="a"
                  href="https://leaderboard.swecc.org"
                  variant={buttonVariant}
                  shadow="md"
                  _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                  transition="all 0.2s"
                >
                  Leaderboards
                </Button>
              </WrapItem>
              <WrapItem>
                <Button
                  colorScheme="teal"
                  size="lg"
                  leftIcon={<FiCalendar />}
                  as="a"
                  href="https://interview.swecc.org"
                  variant={buttonVariant}
                  shadow="md"
                  _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                  transition="all 0.2s"
                >
                  Mock Interviews
                </Button>
              </WrapItem>
              <WrapItem>
                <Button
                  colorScheme="purple"
                  size="lg"
                  leftIcon={<FiUsers />}
                  as="a"
                  href="/#/cohorts"
                  variant={buttonVariant}
                  shadow="md"
                  _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                  transition="all 0.2s"
                >
                  View Your Cohort
                </Button>
              </WrapItem>
              <WrapItem>
                <Button
                  colorScheme="cyan"
                  size="lg"
                  leftIcon={<FiMessageCircle />}
                  as="a"
                  href="/#/directory"
                  variant={buttonVariant}
                  shadow="md"
                  _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                  transition="all 0.2s"
                >
                  Connect with Members
                </Button>
              </WrapItem>
              <WrapItem>
                <Button
                  colorScheme="green"
                  size="lg"
                  leftIcon={<FiCode />}
                  as="a"
                  href="https://labs.swecc.org"
                  variant={buttonVariant}
                  shadow="md"
                  _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                  transition="all 0.2s"
                >
                  SWECC Labs
                </Button>
              </WrapItem>
            </Wrap>

            <SimpleGrid
              columns={{ base: 1, md: 3 }}
              spacing={10}
              pt={8}
              w="full"
            >
              <Card
                bg={cardBg}
                shadow={cardShadow}
                borderRadius="xl"
                overflow="hidden"
                borderWidth="1px"
                borderColor={cardBorderColor}
                _hover={{
                  transform: 'translateY(-5px)',
                  shadow: '2xl',
                  borderColor: 'blue.300',
                }}
                transition="all 0.3s"
              >
                <CardBody p={8}>
                  <VStack spacing={5} align="center">
                    <Icon as={FiTrendingUp} boxSize={12} color="blue.500" />
                    <Heading as="h3" size="md">
                      Track Your Progress
                    </Heading>
                    <Text color={textColor}>
                      Visualize your progress and show off your hard work
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card
                bg={cardBg}
                shadow={cardShadow}
                borderRadius="xl"
                overflow="hidden"
                borderWidth="1px"
                borderColor={cardBorderColor}
                _hover={{
                  transform: 'translateY(-5px)',
                  shadow: '2xl',
                  borderColor: 'teal.300',
                }}
                transition="all 0.3s"
              >
                <CardBody p={8}>
                  <VStack spacing={5} align="center">
                    <Icon as={FiUsers} boxSize={12} color="teal.500" />
                    <Heading as="h3" size="md">
                      Find Community
                    </Heading>
                    <Text color={textColor} textAlign="center">
                      Connect with peers and keep each other accountable
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card
                bg={cardBg}
                shadow={cardShadow}
                borderRadius="xl"
                overflow="hidden"
                borderWidth="1px"
                borderColor={cardBorderColor}
                _hover={{
                  transform: 'translateY(-5px)',
                  shadow: '2xl',
                  borderColor: 'purple.300',
                }}
                transition="all 0.3s"
              >
                <CardBody p={8}>
                  <VStack spacing={5} align="center">
                    <Icon as={FiAward} boxSize={12} color="purple.500" />
                    <Heading as="h3" size="md">
                      Accelerate your Growth
                    </Heading>
                    <Text color={textColor}>
                      Access events, workshops, and programs designed to
                      accelerate your tech career
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
