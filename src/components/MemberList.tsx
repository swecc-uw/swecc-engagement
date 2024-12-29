import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Button,
  Flex,
  IconButton,
  Tooltip,
  useColorModeValue,
  Skeleton,
  SkeletonCircle,
  ButtonGroup,
  Center,
  Badge,
  Spacer,
} from '@chakra-ui/react';
import { Github, Linkedin, Code2, MapPin, GraduationCap } from 'lucide-react';
import { Member } from '../types';
import { resolveName } from './utils/RandomUtils';
import { START_PAGE } from '../pages/DirectoryPage';
import {
  GITHUB_PROFILE_BASE_URL,
  LEETCODE_PROFILE_BASE_URL,
  LINKEDIN_PROFILE_BASE_URL,
} from '../constants';

interface MemberListProps {
  members: Member[];
  loading?: boolean;
  currentPage?: number;
  totalPages?: number;
  showPagination?: boolean;
  onPageChange?: (page: number) => void;
}

const MemberCard = ({ member }: { member: Member }) => {
  const bgColor = 'white';
  const borderColor = 'gray.100';
  const textColor = 'gray.600';
  const mutedColor = 'gray.500';
  const hoverBg = 'gray.50';
  const iconColor = 'gray.600';

  const fullName = resolveName(member);

  return (
    <Box
      p={{ base: 4, md: 6 }}
      borderWidth="1px"
      borderRadius="xl"
      borderColor={borderColor}
      bg={bgColor}
      boxShadow="sm"
      _hover={{
        boxShadow: 'md',
        borderColor: 'blue.200',
        bg: hoverBg,
        transform: 'translateY(-2px)',
      }}
      transition="all 0.2s"
      w="100%"
    >
      <Flex direction={{ base: 'column', sm: 'row' }} gap={4}>
        <Avatar
          size={{ base: 'lg', md: 'xl' }}
          name={fullName}
          src={member.profilePictureUrl}
          borderWidth={2}
          borderColor="blue.400"
        />

        <Box flex="1">
          <Flex
            direction={{ base: 'column', md: 'row' }}
            gap={{ base: 2, md: 0 }}
            align={{ base: 'start', md: 'center' }}
            mb={3}
          >
            <Box>
              <Text
                fontWeight="bold"
                fontSize={{ base: 'lg', md: 'xl' }}
                lineHeight="short"
              >
                {fullName}
              </Text>
              <Text color={mutedColor} fontSize="sm">
                @{member.username}
              </Text>
            </Box>
            <Spacer minW={4} />
            <HStack
              spacing={1}
              justify={{ base: 'start', md: 'end' }}
              w={{ base: 'full', md: 'auto' }}
            >
              {member.github?.username && (
                <Tooltip label="GitHub Profile">
                  <IconButton
                    as="a"
                    href={`${GITHUB_PROFILE_BASE_URL}${member.github.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub Profile"
                    icon={<Github size={18} />}
                    variant="ghost"
                    color={iconColor}
                    size="sm"
                    _hover={{ color: 'blue.500', bg: 'blue.50' }}
                  />
                </Tooltip>
              )}
              {member.linkedin?.username && (
                <Tooltip label="LinkedIn Profile">
                  <IconButton
                    as="a"
                    href={`${LINKEDIN_PROFILE_BASE_URL}${member.linkedin.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn Profile"
                    icon={<Linkedin size={18} />}
                    variant="ghost"
                    color={iconColor}
                    size="sm"
                    _hover={{ color: 'blue.500', bg: 'blue.50' }}
                  />
                </Tooltip>
              )}
              {member.leetcode?.username && (
                <Tooltip label="LeetCode Profile">
                  <IconButton
                    as="a"
                    href={`${LEETCODE_PROFILE_BASE_URL}${member.leetcode.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LeetCode Profile"
                    icon={<Code2 size={18} />}
                    variant="ghost"
                    color={iconColor}
                    size="sm"
                    _hover={{ color: 'blue.500', bg: 'blue.50' }}
                  />
                </Tooltip>
              )}
            </HStack>
          </Flex>

          <VStack align="stretch" spacing={2} mb={4}>
            {member.preview && (
              <Text color={textColor} fontSize="sm" noOfLines={2}>
                {member.preview}
              </Text>
            )}
            <Flex
              gap={3}
              flexWrap="wrap"
              color={mutedColor}
              fontSize="sm"
              mt={2}
            >
              {member.major && (
                <HStack>
                  <GraduationCap size={16} />
                  <Text>{member.major}</Text>
                </HStack>
              )}
              {member.local && (
                <HStack>
                  <MapPin size={16} />
                  <Text>{member.local}</Text>
                </HStack>
              )}
            </Flex>
          </VStack>

          <Flex
            gap={3}
            direction={{ base: 'column', sm: 'row' }}
            align={{ base: 'stretch', sm: 'center' }}
          >
            <Link to={`/directory/${member.id}`} style={{ flex: 1 }}>
              <Button
                size="sm"
                colorScheme="blue"
                width={{ base: '100%', sm: 'auto' }}
              >
                View Full Profile
              </Button>
            </Link>
            <HStack spacing={2} justify={{ base: 'start', sm: 'end' }}>
              {member.role && (
                <Badge colorScheme="purple" fontSize="xs">
                  {member.role}
                </Badge>
              )}
              {member.groups?.map((group) => (
                <Badge key={group.name} colorScheme="blue" fontSize="xs">
                  {group.name}
                </Badge>
              ))}
            </HStack>
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

const LoadingCard = () => {
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <Box
      p={{ base: 4, md: 6 }}
      borderWidth="1px"
      borderRadius="xl"
      borderColor={borderColor}
      bg={bgColor}
      w="100%"
    >
      <Flex direction={{ base: 'column', sm: 'row' }} gap={4}>
        <SkeletonCircle size={{ base: '12', md: '16' }} />
        <Box flex="1">
          <Skeleton height="24px" width="200px" mb={2} />
          <Skeleton height="16px" width="120px" mb={4} />
          <Skeleton height="36px" width="120px" mb={2} />
          <Skeleton height="20px" width="60%" mb={4} />
          <Flex gap={2}>
            <Skeleton height="24px" width="100px" />
            <Skeleton height="24px" width="80px" />
          </Flex>
        </Box>
      </Flex>
    </Box>
  );
};

const MemberList: React.FC<MemberListProps> = ({
  members,
  loading = false,
  currentPage = START_PAGE,
  totalPages = 1,
  showPagination = true,
  onPageChange,
}) => {
  const skeletonCount = loading ? Math.max(members.length, 3) : 0;

  return (
    <VStack spacing={6} align="stretch" w="100%">
      {loading ? (
        <VStack spacing={4} align="stretch">
          {[...Array(skeletonCount)].map((_, i) => (
            <LoadingCard key={i} />
          ))}
        </VStack>
      ) : members.length > 0 ? (
        <VStack spacing={4} align="stretch">
          {members.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </VStack>
      ) : (
        <Center p={8}>
          <Text color="gray.500">No members found</Text>
        </Center>
      )}

      {showPagination && totalPages > 1 && (
        <Flex justify="center" mt={6}>
          <ButtonGroup spacing={4} alignItems="center">
            <Button
              onClick={() => onPageChange?.(currentPage - 1)}
              isDisabled={currentPage === START_PAGE}
              colorScheme="blue"
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <Text fontSize="sm">
              Page {currentPage} of {totalPages}
            </Text>
            <Button
              onClick={() => onPageChange?.(currentPage + 1)}
              isDisabled={currentPage === totalPages}
              colorScheme="blue"
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </ButtonGroup>
        </Flex>
      )}
    </VStack>
  );
};

export default MemberList;
