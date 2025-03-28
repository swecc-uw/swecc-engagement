import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Avatar,
  Link,
  Badge,
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
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  useColorModeValue,
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
import { Member, ReportType } from '../types';
import { resolveName } from './utils/RandomUtils';
import { formatDate } from '../localization';
import { useAuth } from '../hooks/useAuth';
import { Flag } from 'lucide-react';
import ReportPopup from '../components/ReportPopUp';
import {
  GITHUB_PROFILE_BASE_URL,
  LEETCODE_PROFILE_BASE_URL,
  LINKEDIN_PROFILE_BASE_URL,
} from '../constants';

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
  const borderColorAccent = useColorModeValue('blue.400', 'blue.300');
  const bgHover = useColorModeValue('gray.50', 'gray.700');
  const bgError = useColorModeValue('red.50', 'red.900');
  const iconColor = useColorModeValue('gray.600', 'gray.400');
  const hoverColor = useColorModeValue('blue.500', 'blue.300');
  const sectionBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const labelColor = useColorModeValue('gray.500', 'gray.400');
  const dividerColor = useColorModeValue('gray.200', 'gray.600');

  const toast = useToast();
  const { onCopy: onDiscordCopy } = useClipboard(
    member.discordUsername?.toString()
  );
  const { onCopy: onEmailCopy } = useClipboard(member.email);
  const { member: currentUser } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

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
        color={iconColor}
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
          color={labelColor}
          display="block"
        >
          {label}
        </Box>
        <Box mt={1} color={textColor}>
          {value}
        </Box>
      </Box>
    </Flex>
  );

  return (
    <>
      <Modal
        isCentered
        motionPreset="slideInBottom"
        isOpen={isOpen}
        size="xl"
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent maxH="800px" maxW="700px" bg={bgColor}>
          <ModalCloseButton />
          <ReportPopup
            title="Report User"
            badgeColorScheme="red"
            reasonPlaceholder="Enter reason for reporting this user"
            associatedId={member.id.toString()}
            reporterUserId={currentUser?.id}
            onClose={onClose}
            type={ReportType.Member}
          />
        </ModalContent>
      </Modal>

      <Box
        bg={bgColor}
        borderRadius="xl"
        boxShadow="xl"
        border="1px"
        borderColor={borderColor}
        overflow="hidden"
        maxW="4xl"
        w="full"
        transition="all 0.2s"
        _hover={{
          boxShadow: '2xl',
          transform: 'translateY(-2px)',
        }}
      >
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
              borderWidth="3px"
              borderColor={borderColorAccent}
            />
            <VStack
              align={{ base: 'center', md: 'start' }}
              spacing={3}
              flex="1"
            >
              <HStack width="100%" justify="space-between">
                <Box>
                  <Box
                    fontSize="3xl"
                    fontWeight="bold"
                    lineHeight="shorter"
                    color={textColor}
                  >
                    {member.firstName} {member.lastName}
                  </Box>
                  <Box color={mutedColor} fontSize="md">
                    @{member.username}
                  </Box>
                  {member.preview && (
                    <Box color={mutedColor} fontSize="sm" mt={1}>
                      {member.preview}
                    </Box>
                  )}
                </Box>
                {currentUser && currentUser.id !== member.id && (
                  <Button
                    leftIcon={<Flag size={16} />}
                    colorScheme="red"
                    variant="ghost"
                    size="sm"
                    onClick={onOpen}
                    _hover={{
                      bg: bgError,
                    }}
                  >
                    Report User
                  </Button>
                )}
              </HStack>
              <HStack spacing={2} flexWrap="wrap">
                <Badge colorScheme="purple" fontSize="sm">
                  {member.role}
                </Badge>
                {member.groups?.map((group, i) => (
                  <Badge key={i} colorScheme="blue" fontSize="sm">
                    {group.name}
                  </Badge>
                ))}
              </HStack>
            </VStack>
          </Stack>
        </Box>

        <Divider borderColor={dividerColor} />

        {/* contact */}
        <Box px={8} py={6} bg={sectionBg}>
          <Box fontSize="lg" fontWeight="bold" mb={4} color={textColor}>
            Contact Information
          </Box>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <HStack spacing={2}>
              <Icon as={FaEnvelope} color={iconColor} />
              <Box flex="1" color={textColor}>
                {member.email}
              </Box>
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
                colorScheme="blue"
                variant="outline"
                _hover={{
                  bg: bgHover,
                }}
              >
                Copy
              </Button>
            </HStack>
            <HStack spacing={2}>
              <Icon as={FaDiscord} color={iconColor} />
              <Box flex="1" color={textColor}>
                {member.discordUsername}
              </Box>
              <Button
                size="sm"
                leftIcon={<FaCopy />}
                onClick={() => {
                  onDiscordCopy();
                  toast({
                    title: 'Discord Username copied',
                    status: 'success',
                    duration: 2000,
                  });
                }}
                colorScheme="blue"
                variant="outline"
                _hover={{
                  bg: bgHover,
                }}
              >
                Copy
              </Button>
            </HStack>
          </SimpleGrid>
        </Box>

        <Divider borderColor={dividerColor} />

        {/* profile info */}
        <Box px={8} py={6}>
          <Box fontSize="lg" fontWeight="bold" mb={4} color={textColor}>
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
                    color={labelColor}
                    display="block"
                  >
                    Bio
                  </Box>
                  <Box mt={1} color={textColor}>
                    {member.bio}
                  </Box>
                </Box>
              )}
            </VStack>
          </SimpleGrid>
        </Box>

        <Divider borderColor={dividerColor} />

        {/* social */}
        <Box px={8} py={6}>
          <Box fontSize="lg" fontWeight="bold" mb={4} color={textColor}>
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
                href={`${LINKEDIN_PROFILE_BASE_URL}${member.linkedin.username}`}
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
    </>
  );
};

export default MemberProfileView;
