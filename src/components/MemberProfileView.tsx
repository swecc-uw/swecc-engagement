import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Avatar,
  Link,
  Badge,
  useColorModeValue,
  SimpleGrid,
  Divider,
  Stack,
  Icon,
  Flex,
  Tooltip,
  Button,
  useClipboard,
  useToast,
  As,
} from '@chakra-ui/react';
import {
  FaGithub,
  FaLinkedin,
  FaExternalLinkAlt,
  FaDiscord,
  FaCode,
  FaCalendar,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaEnvelope,
  FaClock,
  FaIdBadge,
  FaUsers,
  FaCopy,
} from 'react-icons/fa';
import { Member } from '../types';
import { resolveName } from './utils/RandomUtils';
import { formatDate } from '../localization';
import { GITHUB_PROFILE_BASE_URL, LEETCODE_PROFILE_BASE_URL } from '../constants';

const stripEmptySocials = (member: Member) => {
  if (member.leetcode?.username?.length == 0) {
    member.leetcode = undefined;
  }

  if (member.github?.username?.length == 0) {
    member.github = undefined;
  }

  if (member.linkedin?.username?.length == 0) {
    member.linkedin = undefined;
  }

  return member;
};
interface MemberProfileViewProps {
  member: Member;
}

const MemberProfileView: React.FC<MemberProfileViewProps> = ({ member }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconColor = useColorModeValue('gray.600', 'gray.400');
  const hoverColor = useColorModeValue('blue.500', 'blue.300');
  const sectionBg = useColorModeValue('gray.50', 'gray.700');

  const toast = useToast();
  const { onCopy: onDiscordCopy } = useClipboard(member.discordId?.toString());
  const { onCopy: onEmailCopy } = useClipboard(member.email);

  if (!member) {
    return null;
  }

  member = stripEmptySocials(member);

  const SocialLink = ({
    icon,
    label,
    href,
    username,
  }: {
    icon: unknown;
    label: string;
    href: string;
    username: string;
  }) => (
    <Tooltip label={label}>
      <Link
        href={href}
        isExternal
        _hover={{ color: hoverColor, textDecoration: 'none' }}
        display="flex"
        alignItems="center"
        gap={2}
      >
        <Icon as={icon as As} boxSize={5} />
        <Box as="span" fontSize="sm">
          {username}
        </Box>
      </Link>
    </Tooltip>
  );

  const InfoItem = ({
    icon,
    label,
    value,
  }: {
    icon: unknown;
    label: string;
    value: string | React.ReactNode;
  }) => (
    <Flex align="start" gap={2}>
      <Icon as={icon as As} color={iconColor} mt={1} />
      <Box>
        <Box
          as="span"
          fontWeight="semibold"
          fontSize="sm"
          color="gray.500"
          display="block"
        >
          {label}
        </Box>
        <Box mt={1}>{value}</Box>
      </Box>
    </Flex>
  );

  return (
    <Box
      bg={bgColor}
      borderRadius="xl"
      boxShadow="xl"
      border="1px"
      borderColor={borderColor}
      overflow="hidden"
      maxW="4xl"
      w="full"
    >
      {/* header */}
      <Box px={8} py={6}>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={8}
          align="center"
        >
          <Avatar
            size="2xl"
            name={resolveName(member)}
            src={member.profilePictureUrl}
            bg="blue.500"
          />
          <VStack align={{ base: 'center', md: 'start' }} spacing={3} flex="1">
            <Box>
              <Box fontSize="3xl" fontWeight="bold" lineHeight="shorter">
                {member.firstName} {member.lastName}
              </Box>
              <Box color="gray.500" fontSize="md">
                @{member.username}
              </Box>
            </Box>
            <HStack spacing={2} flexWrap="wrap">
              <Badge colorScheme="purple" fontSize="sm">
                {member.role}
              </Badge>
              {member.groups?.map((group) => (
                <Badge key={group.name} colorScheme="blue" fontSize="sm">
                  {group.name}
                </Badge>
              ))}
            </HStack>
          </VStack>
        </Stack>
      </Box>

      <Divider />

      {/* contact */}
      <Box px={8} py={6} bg={sectionBg}>
        <Box fontSize="lg" fontWeight="bold" mb={4}>
          Contact Information
        </Box>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <HStack spacing={2}>
            <Icon as={FaEnvelope} color={iconColor} />
            <Box flex="1">{member.email}</Box>
            <Button
              size="sm"
              leftIcon={<FaCopy />}
              onClick={() => {
                onEmailCopy();
                toast({
                  title: 'Email copied',
                  status: 'success',
                  duration: 2000,
                });
              }}
            >
              Copy
            </Button>
          </HStack>
          <HStack spacing={2}>
            <Icon as={FaDiscord} color={iconColor} />
            <Box flex="1">{member.discordUsername}</Box>
            <Button
              size="sm"
              leftIcon={<FaCopy />}
              onClick={() => {
                onDiscordCopy();
                toast({
                  title: 'Discord ID copied',
                  status: 'success',
                  duration: 2000,
                });
              }}
            >
              Copy ID
            </Button>
          </HStack>
        </SimpleGrid>
      </Box>

      <Divider />

      {/* profile info */}
      <Box px={8} py={6}>
        <Box fontSize="lg" fontWeight="bold" mb={4}>
          Profile Details
        </Box>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <VStack align="start" spacing={4}>
            <InfoItem
              icon={FaIdBadge}
              label="I am member number..."
              value={`#${member.id}`}
            />
            <InfoItem
              icon={FaClock}
              label="Member Since"
              value={formatDate(member.created, true)}
            />
            {member.major && (
              <InfoItem
                icon={FaGraduationCap}
                label="Major"
                value={member.major}
              />
            )}
            {member.gradDate && (
              <InfoItem
                icon={FaCalendar}
                label="Expected Graduation"
                value={formatDate(member.gradDate)}
              />
            )}
          </VStack>

          <VStack align="start" spacing={4}>
            {member.local && (
              <InfoItem
                icon={FaMapMarkerAlt}
                label="Location"
                value={member.local}
              />
            )}
            {member.groups && (
              <InfoItem
                icon={FaUsers}
                label="Groups"
                value={
                  <HStack spacing={2} flexWrap="wrap">
                    {member.groups.map((group, i) => (
                      <Badge key={i} colorScheme="green">
                        {group.name}
                      </Badge>
                    ))}
                  </HStack>
                }
              />
            )}
            {member.bio && (
              <Box>
                <Box
                  as="span"
                  fontWeight="semibold"
                  fontSize="sm"
                  color="gray.500"
                  display="block"
                >
                  Bio
                </Box>
                <Box mt={1}>{member.bio}</Box>
              </Box>
            )}
          </VStack>
        </SimpleGrid>
      </Box>

      <Divider />

      {/* social */}
      <Box px={8} py={6}>
        <Box fontSize="lg" fontWeight="bold" mb={4}>
          External Profiles & Links
        </Box>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {member.github?.username && (
            <SocialLink
              icon={FaGithub}
              label="GitHub Profile"
              href={`${GITHUB_PROFILE_BASE_URL}${member.github.username}`}
              username={member.github.username}
            />
          )}
          {member.linkedin?.username && (
            <SocialLink
              icon={FaLinkedin}
              label="LinkedIn Profile"
              href={member.linkedin.username}
              username={member.linkedin.username}
            />
          )}
          {member.leetcode?.username && (
            <SocialLink
              icon={FaCode}
              label="LeetCode Profile"
              href={`${LEETCODE_PROFILE_BASE_URL}${member.leetcode.username}`}
              username={member.leetcode.username}
            />
          )}
          {member.resumeUrl && (
            <SocialLink
              icon={FaExternalLinkAlt}
              label="Resume"
              href={
                member.resumeUrl.startsWith('http')
                  ? member.resumeUrl
                  : `https://${member.resumeUrl}`
              }
              username="View Resume"
            />
          )}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default MemberProfileView;
