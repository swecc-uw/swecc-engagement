import { useNavigate } from 'react-router-dom';
import MemberProfileEdit from '../components/MemberProfileEdit';
import MemberProfileView from '../components/MemberProfileView';
import { useAuth } from '../hooks/useAuth';
import { Member } from '../types';
import {
  Box,
  Button,
  Container,
  Text,
  VStack,
  Stack,
  HStack,
  useColorModeValue,
  Icon,
  ButtonGroup,
  Card,
  CardHeader,
  CardBody,
  Skeleton,
  Flex,
  Divider,
  As,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import LeetcodeProfile from '../components/LeetcodeProfile';
import GitHubCalendar, { Activity, ThemeInput } from 'react-github-calendar';
import { updateMemberProfile } from '../services/member';
import { devPrint } from '../components/utils/RandomUtils';
import {
  FaEdit,
  FaSignOutAlt,
  FaGithub,
  FaCode,
  FaChartBar,
  FaUser,
} from 'react-icons/fa';
import { getToday } from '../localization';

const selectLastHalfYear = (contributions: Activity[]) => {
  const today = getToday();
  const currentYear = today.getUTCFullYear();
  const currentMonth = today.getUTCMonth();
  const shownMonths = 6;

  return contributions.filter((activity) => {
    const date = new Date(activity.date);
    const monthOfDay = date.getUTCMonth();

    return (
      date.getUTCFullYear() === currentYear &&
      monthOfDay > currentMonth - shownMonths &&
      monthOfDay <= currentMonth
    );
  });
};

interface WidgetCardProps {
  icon: As;
  title: string;
  children: React.ReactNode;
}

const WidgetCard: React.FC<WidgetCardProps> = ({ icon, title, children }) => {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <Card
      variant="outline"
      borderColor={borderColor}
      bg={bgColor}
      shadow="lg"
      borderRadius="xl"
      h="full"
    >
      <CardHeader pb={2}>
        <HStack spacing={2}>
          <Icon as={icon} color="blue.500" boxSize={5} />
          <Text fontSize="lg" fontWeight="bold">
            {title}
          </Text>
        </HStack>
      </CardHeader>
      <Divider />
      <CardBody>{children}</CardBody>
    </Card>
  );
};

const Widgets: React.FC<{ member: Member }> = ({ member }) => {
  const [isGithubLoading, setIsGithubLoading] = useState(true);
  const chartBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const githubTheme: ThemeInput = {
    dark: ['#f0f0f0', '#dcd0ff', '#c4a3ff', '#a876ff', '#8a00d4'],
    light: ['#333333', '#62419d', '#7139bf', '#822df2', '#8a00d4'],
  };

  useEffect(() => {
    const delay6s = setTimeout(() => {
      setIsGithubLoading(false);
    }, 6000);

    return () => clearTimeout(delay6s);
  }, []);

  if (!member.github && !member.leetcode) {
    return null;
  }

  return (
    <Card
      variant="outline"
      borderColor={borderColor}
      borderRadius="xl"
      shadow="lg"
      w="full"
      maxW="4xl"
    >
      <CardHeader>
        <HStack spacing={2}>
          <Icon as={FaChartBar} color="blue.500" boxSize={5} />
          <Text fontSize="lg" fontWeight="bold">
            Activity Overview
          </Text>
        </HStack>
      </CardHeader>
      <Divider />
      <CardBody>
        <Stack
          direction={{ base: 'column', lg: 'row' }}
          spacing={6}
          w="full"
          align="stretch"
        >
          {member.leetcode && (
            <Box flex="1">
              <WidgetCard icon={FaCode} title="LeetCode Stats">
                <LeetcodeProfile username={member.leetcode.username} />
              </WidgetCard>
            </Box>
          )}
          {member.github && (
            <Box flex="1">
              <WidgetCard icon={FaGithub} title="GitHub Contributions">
                <Skeleton isLoaded={!isGithubLoading} borderRadius="lg">
                  <Box bg={chartBg} p={4} borderRadius="lg" overflowX="auto">
                    <GitHubCalendar
                      username={member.github.username}
                      transformData={selectLastHalfYear}
                      theme={githubTheme}
                      year={new Date().getFullYear()}
                      labels={{
                        totalCount:
                          '{{count}} contributions in the last 6 months',
                      }}
                    />
                  </Box>
                </Skeleton>
              </WidgetCard>
            </Box>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
};

const MemberProfilePage: React.FC = () => {
  const { logout, member: authMember } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [member, setMember] = useState<Member>();
  const [isSaving, setIsSaving] = useState(false);
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const onSave = async (updatedMember: Partial<Member>) => {
    setIsSaving(true);
    try {
      await updateMemberProfile(updatedMember);
      setIsEditing(false);
      setMember((prev) =>
        prev && updatedMember ? { ...prev, ...updatedMember } : prev
      );
    } catch (error) {
      devPrint('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (authMember) {
      setMember(authMember);
    }
  }, [authMember]);

  if (!member) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <Box minH="calc(100vh - 64px)" py={8}>
      <Container maxW="container.xl" px={{ base: 4, md: 8 }} centerContent>
        <VStack spacing={6} align="stretch" maxW="4xl" w="full">
          {/* header */}
          <Card
            variant="outline"
            borderColor={borderColor}
            borderRadius="xl"
            shadow="lg"
          >
            <CardHeader>
              <Flex
                justify="space-between"
                align="center"
                wrap={{ base: 'wrap', md: 'nowrap' }}
                gap={4}
              >
                <HStack spacing={3}>
                  <Icon as={FaUser} boxSize={6} color="blue.500" />
                  <Text fontSize="lg" fontWeight="bold">
                    Your Profile
                  </Text>
                </HStack>
                <ButtonGroup spacing={3} size={{ base: 'sm', md: 'md' }}>
                  <Button
                    leftIcon={<Icon as={FaEdit} />}
                    colorScheme="blue"
                    onClick={() => setIsEditing((prev) => !prev)}
                    isLoading={isSaving}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                  <Button
                    leftIcon={<Icon as={FaSignOutAlt} />}
                    colorScheme="red"
                    variant="ghost"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </ButtonGroup>
              </Flex>
            </CardHeader>
          </Card>

          {/* profile info */}
          {isEditing ? (
            <MemberProfileEdit member={member} onSave={onSave} />
          ) : (
            <MemberProfileView member={member} />
          )}

          {/* activity widgets */}
          {!isEditing && <Widgets member={member} />}
        </VStack>
      </Container>
    </Box>
  );
};

export default MemberProfilePage;
