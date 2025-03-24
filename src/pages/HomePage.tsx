import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  SimpleGrid,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiUsers, FiCalendar, FiAward, FiActivity } from 'react-icons/fi';
import GravitySimulation from '../components/GravitySimulation';

const HomePage: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');

  return (
    <Box position="relative" minH="100vh" overflow="hidden">
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        zIndex="0"
      >
        <GravitySimulation />
      </Box>

      <Box
        position="relative"
        zIndex="1"
        pt={{ base: '80px', md: '120px' }}
        pb="60px"
        backdropFilter="blur(1px)"
      >
        <Container maxW="container.lg">
          <VStack spacing={10} align="center" textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              color={textColor}
              fontWeight="bold"
              lineHeight="1.2"
              textShadow="0 0 10px rgba(0,0,0,0.2)"
            >
              View your progress, connect with friends, and engage with the club
            </Heading>

            <HStack spacing={5} pt={6}>
              <Button
                colorScheme="blue"
                size="lg"
                leftIcon={<FiUsers />}
                as="a"
                href="https://leaderboard.swecc.org"
              >
                Leaderboards
              </Button>
              <Button
                colorScheme="teal"
                size="lg"
                leftIcon={<FiCalendar />}
                as="a"
                href="https://interview.swecc.org"
              >
                Mock Interviews
              </Button>
              <Button
                colorScheme="teal"
                size="lg"
                leftIcon={<FiUsers />}
                as="a"
                href="/#/cohorts"
              >
                Connect with Friends
              </Button>
              <Button
                colorScheme="teal"
                size="lg"
                leftIcon={<FiUsers />}
                as="a"
                href="/#/directory"
              >
                Explore Members
              </Button>
              <Button
                colorScheme="teal"
                size="lg"
                leftIcon={<FiUsers />}
                as="a"
                href="https://labs.swecc.org"
              >
                Contribute to Open Source
              </Button>
            </HStack>

            <SimpleGrid
              columns={{ base: 1, md: 3 }}
              spacing={10}
              pt={10}
              w="full"
            >
              <Card bg={cardBg} shadow="lg" borderRadius="xl" overflow="hidden">
                <CardBody p={6}>
                  <VStack spacing={4} align="center">
                    <Icon as={FiActivity} boxSize={10} color="blue.500" />
                    <Heading as="h3" size="md">
                      Make Progress in Public
                    </Heading>
                    <Text color={textColor}>
                      Show off your progress and see how you stack up
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} shadow="lg" borderRadius="xl" overflow="hidden">
                <CardBody p={6}>
                  <VStack spacing={4} align="center">
                    <Icon as={FiUsers} boxSize={10} color="teal.500" />
                    <Heading as="h3" size="md">
                      Community
                    </Heading>
                    <Text color={textColor}>
                      Connect with peers and keep eachother accountable
                    </Text>
                  </VStack>
                </CardBody>
              </Card>

              <Card bg={cardBg} shadow="lg" borderRadius="xl" overflow="hidden">
                <CardBody p={6}>
                  <VStack spacing={4} align="center">
                    <Icon as={FiAward} boxSize={10} color="purple.500" />
                    <Heading as="h3" size="md">
                      Engage with SWECC
                    </Heading>
                    <Text color={textColor}>
                      Participate in events and programs to boost your career
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
